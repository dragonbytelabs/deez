package vault

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Entry struct {
	Path  string    `json:"path"` // vault-relative (forward slashes)
	Name  string    `json:"name"`
	Kind  string    `json:"kind"` // "folder" | "file"
	Size  int64     `json:"size,omitempty"`
	MTime time.Time `json:"mtime"`
}

type FileInfo struct {
	Path  string    `json:"path"` // vault-relative, forward slashes
	Name  string    `json:"name"`
	Size  int64     `json:"size"`
	MTime time.Time `json:"mtime"`
	Hash  string    `json:"sha256,omitempty"` // optional
}

type ReadResult struct {
	Path    string    `json:"path"`
	Content string    `json:"content"`
	Size    int64     `json:"size"`
	MTime   time.Time `json:"mtime"`
	Hash    string    `json:"sha256"`
}

type WriteRequest struct {
	Content string `json:"content"`
	IfMatch string `json:"ifMatch,omitempty"` // optimistic concurrency
}

type WriteResult struct {
	Path  string    `json:"path"`
	Size  int64     `json:"size"`
	MTime time.Time `json:"mtime"`
	Hash  string    `json:"sha256"`
}

type Vault struct {
	root string // absolute
}

func New(root string) (*Vault, error) {
	abs, err := filepath.Abs(root)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(abs, 0o755); err != nil {
		return nil, err
	}
	return &Vault{root: abs}, nil
}

func (v *Vault) Root() string { return v.root }

// resolve takes a vault-relative path and returns an absolute path inside the vault.
// It rejects paths that escape the vault.
func (v *Vault) resolve(rel string) (string, error) {
	if rel == "" {
		return "", errors.New("path required")
	}
	// treat paths as slash-separated from client
	rel = filepath.FromSlash(rel)
	clean := filepath.Clean(rel)

	// reject absolute paths and parent traversal
	if filepath.IsAbs(clean) || strings.HasPrefix(clean, ".."+string(filepath.Separator)) || clean == ".." {
		return "", errors.New("invalid path")
	}

	abs := filepath.Join(v.root, clean)

	// extra safety: ensure resulting path is within root
	rootClean := filepath.Clean(v.root) + string(filepath.Separator)
	absClean := filepath.Clean(abs)
	if !strings.HasPrefix(absClean+string(filepath.Separator), rootClean) {
		return "", errors.New("path escapes vault")
	}

	return abs, nil
}

func sha256Hex(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

func (v *Vault) ListMarkdown(ctx context.Context) ([]FileInfo, error) {
	var out []FileInfo

	err := filepath.WalkDir(v.root, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		if d.IsDir() {
			// ignore hidden dirs like .git
			if strings.HasPrefix(d.Name(), ".") && p != v.root {
				return fs.SkipDir
			}
			return nil
		}

		if !strings.HasSuffix(strings.ToLower(d.Name()), ".md") {
			return nil
		}

		info, err := d.Info()
		if err != nil {
			return err
		}

		rel, _ := filepath.Rel(v.root, p)
		out = append(out, FileInfo{
			Path:  filepath.ToSlash(rel),
			Name:  d.Name(),
			Size:  info.Size(),
			MTime: info.ModTime(),
		})
		return nil
	})
	if err != nil {
		return nil, err
	}

	// sort by most recent mtime desc
	sort.Slice(out, func(i, j int) bool {
		return out[i].MTime.After(out[j].MTime)
	})

	return out, nil
}

func (v *Vault) ReadFile(ctx context.Context, rel string) (*ReadResult, error) {
	abs, err := v.resolve(rel)
	if err != nil {
		return nil, err
	}

	b, err := os.ReadFile(abs)
	if err != nil {
		return nil, err
	}

	stat, err := os.Stat(abs)
	if err != nil {
		return nil, err
	}

	return &ReadResult{
		Path:    filepath.ToSlash(rel),
		Content: string(b),
		Size:    stat.Size(),
		MTime:   stat.ModTime(),
		Hash:    sha256Hex(b),
	}, nil
}

// WriteFile performs an atomic write (temp + rename).
// If IfMatch is set, it will reject if current file hash differs.
func (v *Vault) WriteFile(ctx context.Context, rel string, req WriteRequest) (*WriteResult, error) {
	abs, err := v.resolve(rel)
	if err != nil {
		return nil, err
	}

	// ensure parent dir exists
	if err := os.MkdirAll(filepath.Dir(abs), 0o755); err != nil {
		return nil, err
	}

	newBytes := []byte(req.Content)
	newHash := sha256Hex(newBytes)

	// optimistic concurrency check
	if req.IfMatch != "" {
		cur, err := os.ReadFile(abs)
		if err == nil {
			curHash := sha256Hex(cur)
			if curHash != req.IfMatch {
				return nil, errors.New("conflict: file changed")
			}
		}
	}

	tmp := abs + ".tmp"
	if err := os.WriteFile(tmp, newBytes, 0o644); err != nil {
		return nil, err
	}
	if err := os.Rename(tmp, abs); err != nil {
		_ = os.Remove(tmp)
		return nil, err
	}

	stat, err := os.Stat(abs)
	if err != nil {
		return nil, err
	}

	return &WriteResult{
		Path:  filepath.ToSlash(rel),
		Size:  stat.Size(),
		MTime: stat.ModTime(),
		Hash:  newHash,
	}, nil
}

// CreateFolder creates a new directory in the vault
func (v *Vault) CreateFolder(ctx context.Context, vaultPath string) error {
	absPath, err := v.resolve(vaultPath)
	if err != nil {
		return err
	}

	// Check if it already exists
	if _, err := os.Stat(absPath); err == nil {
		return errors.New("folder already exists")
	}

	// Create the directory with parent directories
	return os.MkdirAll(absPath, 0755)
}

func (v *Vault) ListEntries(ctx context.Context) ([]Entry, error) {
	var out []Entry

	err := filepath.WalkDir(v.root, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// skip root itself
		if p == v.root {
			return nil
		}

		// ignore hidden dirs like .git
		if d.IsDir() && strings.HasPrefix(d.Name(), ".") {
			return fs.SkipDir
		}

		info, err := d.Info()
		if err != nil {
			return err
		}

		rel, _ := filepath.Rel(v.root, p)
		kind := "file"
		if d.IsDir() {
			kind = "folder"
		}

		// Optional: if you ONLY want markdown files, keep folders always
		// and skip non-md files:
		if kind == "file" && !strings.HasSuffix(strings.ToLower(d.Name()), ".md") {
			return nil
		}

		out = append(out, Entry{
			Path:  filepath.ToSlash(rel),
			Name:  d.Name(),
			Kind:  kind,
			Size:  info.Size(),
			MTime: info.ModTime(),
		})
		return nil
	})

	if err != nil {
		return nil, err
	}

	// sort: folders first, then files, then path alpha
	sort.Slice(out, func(i, j int) bool {
		if out[i].Kind != out[j].Kind {
			return out[i].Kind == "folder"
		}
		return out[i].Path < out[j].Path
	})

	return out, nil
}

// DeleteFile removes a file from the vault
func (v *Vault) DeleteFile(ctx context.Context, vaultPath string) error {
	absPath, err := v.resolve(vaultPath)
	if err != nil {
		return err
	}

	info, err := os.Stat(absPath)
	if err != nil {
		return err
	}

	if info.IsDir() {
		return errors.New("path is a directory, use DeleteFolder instead")
	}

	return os.Remove(absPath)
}

// DeleteFolder removes a folder and all its contents from the vault
func (v *Vault) DeleteFolder(ctx context.Context, vaultPath string) error {
	absPath, err := v.resolve(vaultPath)
	if err != nil {
		return err
	}

	info, err := os.Stat(absPath)
	if err != nil {
		return err
	}

	if !info.IsDir() {
		return errors.New("path is not a directory, use DeleteFile instead")
	}

	return os.RemoveAll(absPath)
}

// RenameFile renames or moves a file within the vault
func (v *Vault) RenameFile(ctx context.Context, oldVaultPath, newVaultPath string) error {
	oldAbs, err := v.resolve(oldVaultPath)
	if err != nil {
		return err
	}
	newAbs, err := v.resolve(newVaultPath)
	if err != nil {
		return err
	}

	// Create parent directory if it doesn't exist
	newDir := filepath.Dir(newAbs)
	if err := os.MkdirAll(newDir, 0755); err != nil {
		return err
	}

	return os.Rename(oldAbs, newAbs)
}
