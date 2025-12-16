import { css } from "@linaria/core";
import { createEffect, createMemo, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import yaml from "js-yaml";
import { api, type Entry } from "./server/api";

/* =======================
   Styles
======================= */

const shell = css`
  height: 100vh;
  display: grid;
  grid-template-columns: 56px var(--sidebar-width, 320px) 1fr;
`;

const rail = css`
  border-right: 1px solid #e6e6e6;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #d4d4d4;
`;

const railSpacer = css`
  flex: 1;
`;

const iconBtn = css`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: white;

  &:hover {
 	background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
 	background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const icon = css`
  width: 18px;
  height: 18px;
  opacity: 0.9;
`;

const resizeHandle = css`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 100;
  transition: all 0.1s ease;

  &:hover {
    width: 8px;
    background: rgba(96, 165, 250, 0.3);
    border-left: 2px solid #60a5fa;
  }

  &:active {
    background: rgba(96, 165, 250, 0.5);
    border-left: 2px solid #60a5fa;
  }
`;

const sidebar = css`
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: #ffffff;
  position: relative;
`;

const header = css`
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
`;

const headerActions = css`
  display: flex;
  gap: 6px;
`;

const tinyBtn = css`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: white;

  &:hover {
 	background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const sidebarBody = css`
  padding: 8px 10px;
  overflow: auto;
  color: #ffffff;
`;

const row = css`
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;

  &:hover {
 	background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const rowActive = css`
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
`;

const rowNew = css`
  background: rgba(100, 200, 255, 0.2);
  border: 1px solid rgba(100, 200, 255, 0.4);
  color: #ffffff;
  animation: pulse 1.5s ease-in-out;

  @keyframes pulse {
    0%, 100% {
      background: rgba(100, 200, 255, 0.2);
    }
    50% {
      background: rgba(100, 200, 255, 0.3);
    }
  }
`;

const caret = css`
  width: 14px;
  display: inline-block;
  opacity: 0.7;
`;

const nameInput = css`
  width: 100%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 8px 10px;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 14px;
  min-height: 36px;

  &:focus {
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.25);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const renameInputWrapper = css`
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 8px 10px;
  min-height: 36px;

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.25);
  }
`;

const renameInput = css`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #ffffff;
  font-size: 14px;
  min-width: 0;
`;

const renameExtension = css`
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  user-select: none;
  pointer-events: none;
`;

const main = css`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #ffffff;
`;

const tabsBar = css`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  overflow-x: auto;
  flex-shrink: 0;
`;

const tab = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  padding-top: 8px;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-top: 2px solid transparent;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.15s;
  max-width: 200px;
  min-width: 120px;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
  
  &:hover .tab-close-x {
    display: flex;
  }
  
  &:hover .tab-dirty-dot {
    display: none;
  }
`;

const tabFileName = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  padding-right: 24px;
`;

const tabActions = css`
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  right: 8px;
  background: inherit;
  padding-left: 8px;
`;

const tabActive = css`
  background: rgba(255, 255, 255, 0.15);
  border-top-color: #007acc;
  color: #ffffff;
`;

const tabPreview = css`
  font-style: italic;
  opacity: 0.85;
`;

const tabClose = css`
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  opacity: 0.7;
  transition: all 0.15s;
  font-size: 18px;
  line-height: 1;
  display: none;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const toolbar = css`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const toolBtn = css`
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const toolSeparator = css`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
`;

const editorWrapper = css`
  flex: 1;
  overflow: auto;
  padding: 12px;
`;

const preview = css`
  width: 100%;
  min-height: 100%;
  padding: 20px;
  color: #ffffff;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: #ffffff;
  }

  h1 { font-size: 2em; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; }
  h2 { font-size: 1.5em; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 6px; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  h5 { font-size: 0.875em; }
  h6 { font-size: 0.85em; color: rgba(255, 255, 255, 0.7); }

  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  a {
    color: #60a5fa;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.9em;
  }

  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 16px;

    code {
      background: transparent;
      padding: 0;
    }
  }

  blockquote {
    margin: 0;
    padding-left: 16px;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16px;
  }

  ul, ol {
    padding-left: 24px;
    margin-bottom: 16px;
  }

  li {
    margin-bottom: 4px;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin: 24px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
  }

  th, td {
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: rgba(255, 255, 255, 0.1);
    font-weight: 600;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  input[type="checkbox"] {
    margin-right: 8px;
  }
`;

const actionBtn = css`
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const rowWithActions = css`
  position: relative;
  
  & .actions {
    opacity: 0;
  }

  &:hover .actions {
    opacity: 1;
  }
`;

const rowDragging = css`
  opacity: 0.4;
  cursor: grabbing;
`;

const rowDropTarget = css`
  background: rgba(96, 165, 250, 0.2) !important;
  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 4px;
`;

const rowActiveFolder = css`
  background: rgba(96, 165, 250, 0.15);
  font-weight: 500;
`;

const editor = css`
  width: 100%;
  min-height: calc(100% - 60px);
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: #ffffff;
`;

const tagGutter = css`
  position: sticky;
  bottom: 0;
  background: #1e1e1e;
  border-top: 1px solid #3c3c3c;
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 48px;
`;

const tagItem = css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(96, 165, 250, 0.3);
    border-color: rgba(96, 165, 250, 0.5);
  }
`;

const tagRemove = css`
  opacity: 0.7;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  
  &:hover {
    opacity: 1;
    color: #ffffff;
  }
`;

const tagAddBtn = css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px dashed #3c3c3c;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #60a5fa;
    color: #60a5fa;
  }
`;

const frontmatterPanel = css`
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  padding: 12px 16px;
  font-size: 13px;
  color: #cccccc;
`;

const frontmatterHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  font-weight: 600;
`;

const frontmatterGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const frontmatterField = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const frontmatterLabel = css`
  font-size: 11px;
  color: #888;
  font-weight: 500;
`;

const frontmatterInput = css`
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 6px 8px;
  color: #ffffff;
  font-size: 12px;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #60a5fa;
  }

  &::placeholder {
    color: #666;
  }
`;

const frontmatterSelect = css`
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 6px 8px;
  color: #ffffff;
  font-size: 12px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #60a5fa;
  }
`;

const frontmatterBtn = css`
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 4px;
  padding: 4px 10px;
  color: #60a5fa;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(96, 165, 250, 0.25);
    border-color: rgba(96, 165, 250, 0.5);
  }
`;

const linksPanel = css`
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  padding: 12px 16px;
  font-size: 13px;
  color: #cccccc;
  max-height: 200px;
  overflow-y: auto;
`;

const linksHeader = css`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  font-weight: 600;
  margin-bottom: 8px;
`;

const linksList = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const linkItem = css`
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(96, 165, 250, 0.15);
  }
`;

const linkIcon = css`
  opacity: 0.5;
  font-size: 14px;
`;

const linkText = css`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const graphOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const graphContainer = css`
  width: 90%;
  height: 90%;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

const graphHeader = css`
  padding: 16px;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252526;
`;

const graphTitle = css`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const graphClose = css`
  background: transparent;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const graphCanvas = css`
  width: 100%;
  height: calc(100% - 64px);
`;

/* =======================
   Types + helpers
======================= */

type TreeNode =
	| { kind: "folder"; path: string; name: string; children: TreeNode[] }
	| { kind: "file"; path: string; name: string };

type CreateKind = "file" | "folder";
type PendingCreate =
	| null
	| {
		kind: CreateKind;
		parentDir: string; // "" = root
		tempId: string;
	};

interface Frontmatter {
	title?: string;
	id?: string;
	created?: string;
	updated?: string;
	tags?: string[];
	aliases?: string[];
	status?: 'draft' | 'active' | 'done' | 'archived';
	type?: 'note' | 'project' | 'meeting' | 'daily';
	[key: string]: any;
}

interface NoteLink {
	raw: string;        // The full match text
	target: string;     // The link target (id/title/path)
	displayText?: string; // Optional display text (for markdown links)
	kind: 'wiki' | 'markdown'; // [[wiki]] or [text](path)
	position: number;   // Character position in the text
}

interface NoteMetadata {
	path: string;
	id?: string;
	title?: string;
	aliases?: string[];
	outgoingLinks: NoteLink[];
	backlinks: string[]; // Paths of notes that link to this one
}

/* =======================
   Plugin API
======================= */

interface ParsedNote {
	frontmatter: Frontmatter | null;
	body: string;
	links: NoteLink[];
	tags: string[];
}

interface PluginCommand {
	id: string;
	label: string;
	icon?: string;
	run: () => void | Promise<void>;
}

interface PluginPanel {
	id: string;
	render: (context: { currentFile: string | null; notesIndex: Record<string, NoteMetadata> }) => any;
}

interface PluginHooks {
	// Lifecycle hooks
	onCreateNote?: (filePath: string) => string | Promise<string>; // Return initial content
	onParse?: (content: string, filePath: string) => ParsedNote | Promise<ParsedNote>;
	onSave?: (context: { path: string; content: string; parsed: ParsedNote }) => void | Promise<void>;
	onRename?: (oldPath: string, newPath: string) => void | Promise<void>;
	onDelete?: (path: string) => void | Promise<void>;
	
	// Extension points
	commands?: PluginCommand[];
	panels?: PluginPanel[];
}

interface Plugin {
	id: string;
	name: string;
	version: string;
	hooks: PluginHooks;
}

function joinPath(parent: string, name: string) {
	if (!parent) return name;
	return `${parent.replace(/\/+$/, "")}/${name.replace(/^\/+/, "")}`;
}

function normalizeMarkdownName(name: string) {
	const raw = name.trim();
	if (!raw) return "";
	return raw.toLowerCase().endsWith(".md") ? raw : `${raw}.md`;
}

// Zettelkasten default name (uses stable ID format)
function formatZettelDefaultName() {
	return `${generateZettelId()}.md`;
}

function buildTreeFromEntries(entries: Entry[]): TreeNode[] {
	const root: any = { children: new Map() };

	const ensureFolder = (parent: any, name: string, fullPath: string) => {
		if (!parent.children.has(name)) {
			parent.children.set(name, { kind: "folder", name, path: fullPath, children: new Map() });
		}
		return parent.children.get(name);
	};

	for (const e of entries) {
		const parts = e.path.split("/").filter(Boolean);
		let cur = root;
		let acc = "";

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]!;
			const isLast = i === parts.length - 1;
			acc = acc ? `${acc}/${part}` : part;

			if (isLast) {
				if (e.kind === "folder") {
					ensureFolder(cur, part, acc);
				} else {
					cur.children.set(part, { kind: "file", name: part, path: acc });
				}
			} else {
				cur = ensureFolder(cur, part, acc);
			}
		}
	}

	const finalize = (node: any): TreeNode[] => {
		const arr = Array.from(node.children.values());
		arr.sort((a: any, b: any) => {
			if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
		return arr.map((x: any) =>
			x.kind === "folder"
				? ({ kind: "folder", name: x.name, path: x.path, children: finalize(x) } as TreeNode)
				: (x as TreeNode)
		);
	};

	return finalize(root);
}

/* =======================
   Frontmatter Helpers
======================= */

interface ParsedContent {
	frontmatter: Frontmatter | null;
	body: string;
	raw: string;
}

function parseFrontmatter(content: string): ParsedContent {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);
	
	if (match) {
		try {
			const frontmatter = yaml.load(match[1]) as Frontmatter;
			return {
				frontmatter,
				body: match[2],
				raw: content
			};
		} catch (e) {
			console.error('Failed to parse frontmatter:', e);
		}
	}
	
	return {
		frontmatter: null,
		body: content,
		raw: content
	};
}

function serializeFrontmatter(frontmatter: Frontmatter, body: string): string {
	if (!frontmatter || Object.keys(frontmatter).length === 0) {
		return body;
	}
	
	const yamlStr = yaml.dump(frontmatter, {
		indent: 2,
		lineWidth: -1,
		noRefs: true,
		sortKeys: false
	}).trim();
	
	return `---\n${yamlStr}\n---\n\n${body}`;
}

function createDefaultFrontmatter(filePath: string): Frontmatter {
	const fileName = filePath.split('/').pop() || '';
	const title = fileName.replace(/\.md$/, '').replace(/-/g, ' ');
	const now = new Date().toISOString();
	
	// Extract ID from zettelkasten filename (YYYYMMDDHHMMSS-rand)
	const zettelMatch = fileName.match(/^(\d{14}-[a-z0-9]+)/);
	const id = zettelMatch ? zettelMatch[1] : fileName.replace(/\.md$/, '');
	
	return {
		title,
		id,
		created: now,
		updated: now,
		tags: [],
		aliases: [],
		status: 'draft',
		type: 'note'
	};
}

/**
 * Extract all links from note body content
 * Supports both [[Wiki Links]] and [Markdown](links.md)
 */
function extractLinks(body: string): NoteLink[] {
	const links: NoteLink[] = [];
	
	// Extract [[Wiki Links]] - simple format [[target]] or [[target|display]]
	const wikiRegex = /\[\[([^\]]+)\]\]/g;
	let match: RegExpExecArray | null;
	
	while ((match = wikiRegex.exec(body)) !== null) {
		const content = match[1];
		const parts = content.split('|');
		const target = parts[0].trim();
		const displayText = parts[1]?.trim();
		
		links.push({
			raw: match[0],
			target,
			displayText,
			kind: 'wiki',
			position: match.index
		});
	}
	
	// Extract [Markdown](links.md) - only .md files
	const mdRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
	
	while ((match = mdRegex.exec(body)) !== null) {
		links.push({
			raw: match[0],
			target: match[2],
			displayText: match[1],
			kind: 'markdown',
			position: match.index
		});
	}
	
	return links;
}

/**
 * Generate a stable zettelkasten ID for a new note
 */
function generateZettelId(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	const rand = Math.random().toString(36).substring(2, 5);
	return `${yyyy}${mm}${dd}${hh}${mi}${ss}-${rand}`;
}

/* =======================
   Built-in Plugins
======================= */

/**
 * Built-in Zettelkasten plugin
 * Encapsulates ZK-specific behaviors for note creation and parsing
 */
const zettelkastenPlugin: Plugin = {
	id: 'core.zettelkasten',
	name: 'Zettelkasten',
	version: '1.0.0',
	hooks: {
		onCreateNote: (filePath: string) => {
			// Generate frontmatter with stable ID
			const frontmatter = createDefaultFrontmatter(filePath);
			return serializeFrontmatter(frontmatter, "");
		},
		
		onParse: (content: string, _filePath: string) => {
			const parsed = parseFrontmatter(content);
			const links = extractLinks(parsed.body);
			
			// Extract hashtags from body
			const tagRegex = /(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g;
			const matches = Array.from(parsed.body.matchAll(tagRegex));
			const tags = Array.from(new Set(matches.map(m => m[1]))).sort();
			
			return {
				frontmatter: parsed.frontmatter,
				body: parsed.body,
				links,
				tags
			};
		},
		
		onSave: async (context) => {
			// Hook for future enhancements (e.g., update backlink files)
			console.log(`[Zettelkasten] Saved: ${context.path}`);
		}
	}
};

/**
 * Plugin registry - plugins can be dynamically registered here
 */
class PluginRegistry {
	private plugins: Map<string, Plugin> = new Map();
	
	constructor() {
		// Register built-in plugins
		this.register(zettelkastenPlugin);
	}
	
	register(plugin: Plugin) {
		this.plugins.set(plugin.id, plugin);
		console.log(`[Plugin] Registered: ${plugin.name} v${plugin.version}`);
	}
	
	unregister(pluginId: string) {
		this.plugins.delete(pluginId);
	}
	
	getAll(): Plugin[] {
		return Array.from(this.plugins.values());
	}
	
	get(pluginId: string): Plugin | undefined {
		return this.plugins.get(pluginId);
	}
	
	// Execute hooks across all plugins
	async executeOnCreateNote(filePath: string): Promise<string> {
		let content = "";
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onCreateNote) {
				const result = await plugin.hooks.onCreateNote(filePath);
				if (result) content = result;
			}
		}
		return content;
	}
	
	async executeOnParse(content: string, filePath: string): Promise<ParsedNote> {
		let result: ParsedNote = {
			frontmatter: null,
			body: content,
			links: [],
			tags: []
		};
		
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onParse) {
				result = await plugin.hooks.onParse(content, filePath);
			}
		}
		
		return result;
	}
	
	async executeOnSave(context: { path: string; content: string; parsed: ParsedNote }) {
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onSave) {
				await plugin.hooks.onSave(context);
			}
		}
	}
	
	async executeOnRename(oldPath: string, newPath: string) {
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onRename) {
				await plugin.hooks.onRename(oldPath, newPath);
			}
		}
	}
	
	async executeOnDelete(path: string) {
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.onDelete) {
				await plugin.hooks.onDelete(path);
			}
		}
	}
	
	getAllCommands(): PluginCommand[] {
		const commands: PluginCommand[] = [];
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.commands) {
				commands.push(...plugin.hooks.commands);
			}
		}
		return commands;
	}
	
	getAllPanels(): PluginPanel[] {
		const panels: PluginPanel[] = [];
		for (const plugin of this.plugins.values()) {
			if (plugin.hooks.panels) {
				panels.push(...plugin.hooks.panels);
			}
		}
		return panels;
	}
}

// Global plugin registry instance
const pluginRegistry = new PluginRegistry();

/* =======================
   Command Palette
======================= */

const paletteOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
`;

const paletteModal = css`
  width: 90%;
  max-width: 600px;
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const paletteInput = css`
  width: 100%;
  padding: 16px 20px;
  background: #1e1e1e;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const paletteResults = css`
  max-height: 400px;
  overflow-y: auto;
`;

const paletteItem = css`
  padding: 12px 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const paletteItemActive = css`
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
`;

const paletteItemIcon = css`
  width: 16px;
  height: 16px;
  opacity: 0.7;
  flex-shrink: 0;
`;

const paletteItemLabel = css`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const paletteItemKind = css`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const paletteEmpty = css`
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

type PaletteAction = {
	type: 'action';
	id: string;
	label: string;
	icon: string;
	onSelect: () => void;
};

type PaletteFile = {
	type: 'file';
	path: string;
	name: string;
};

type PaletteItem = PaletteAction | PaletteFile;

function CommandPalette(props: {
	isOpen: boolean;
	onClose: () => void;
	files: Entry[];
	onOpenFile: (path: string) => void;
	onNewNote: () => void;
	onNewFolder: () => void;
	onTogglePreview: () => void;
	onCollapseAll: () => void;
	notesIndex?: Record<string, NoteMetadata>;
	fileStore?: Record<string, FileState>;
}) {
	const [query, setQuery] = createSignal("");
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	let inputRef: HTMLInputElement | undefined;

	// Focus input when palette opens
	createEffect(() => {
		if (props.isOpen && inputRef) {
			setTimeout(() => inputRef?.focus(), 0);
		}
	});

	// Build combined list of actions + files
	const items = createMemo((): PaletteItem[] => {
		const searchQuery = query().toLowerCase();

		// Actions (always shown at top)
		const actions: PaletteAction[] = [
			{
				type: 'action',
				id: 'new-note',
				label: 'New Note',
				icon: '📝',
				onSelect: () => {
					props.onClose();
					props.onNewNote();
				}
			},
			{
				type: 'action',
				id: 'new-folder',
				label: 'New Folder',
				icon: '📁',
				onSelect: () => {
					props.onClose();
					props.onNewFolder();
				}
			},
			{
				type: 'action',
				id: 'toggle-preview',
				label: 'Toggle Preview',
				icon: '👁',
				onSelect: () => {
					props.onClose();
					props.onTogglePreview();
				}
			},
			{
				type: 'action',
				id: 'collapse-all',
				label: 'Collapse All Folders',
				icon: '⬆',
				onSelect: () => {
					props.onClose();
					props.onCollapseAll();
				}
			},
			// Add plugin commands
			...pluginRegistry.getAllCommands().map((cmd): PaletteAction => ({
				type: 'action',
				id: cmd.id,
				label: cmd.label,
				icon: cmd.icon || '🔌',
				onSelect: () => {
					props.onClose();
					cmd.run();
				}
			}))
		];

		// Filter files by query
		const files: PaletteFile[] = props.files
			.filter(e => e.kind === 'file')
			.filter(e => {
				if (!searchQuery) return true;
				
				// Match by filename/path
				if (e.path.toLowerCase().includes(searchQuery) || e.name.toLowerCase().includes(searchQuery)) {
					return true;
				}

				// Enhanced search: check frontmatter and content
				if (props.notesIndex && props.fileStore) {
					const noteData = props.notesIndex[e.path];
					
					// Search in title
					if (noteData?.title?.toLowerCase().includes(searchQuery)) return true;
					
					// Search in ID
					if (noteData?.id?.toLowerCase().includes(searchQuery)) return true;
					
					// Search in aliases
					if (noteData?.aliases?.some(a => a.toLowerCase().includes(searchQuery))) return true;
					
					// Search in frontmatter tags
					const fileData = props.fileStore[e.path];
					if (fileData) {
						const content = fileData.draftContent || fileData.savedContent;
						const parsed = parseFrontmatter(content);
						
						// Search in frontmatter tags
						if (parsed.frontmatter?.tags?.some(t => t.toLowerCase().includes(searchQuery))) {
							return true;
						}
						
						// Search in body content (simple full-text)
						if (parsed.body.toLowerCase().includes(searchQuery)) {
							return true;
						}
					}
				}
				
				return false;
			})
			.map(e => ({
				type: 'file' as const,
				path: e.path,
				name: e.name
			}));

		// If there's a query, show only matching files; otherwise show actions + all files
		if (searchQuery) {
			return files;
		}
		return [...actions, ...files];
	});

	// Reset selected index when items change
	createEffect(() => {
		items(); // Track dependency
		setSelectedIndex(0);
	});

	// Scroll selected item into view
	createEffect(() => {
		const idx = selectedIndex();
		const element = document.querySelector(`[data-palette-index="${idx}"]`);
		if (element) {
			element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		const itemsCount = items().length;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((selectedIndex() + 1) % itemsCount);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((selectedIndex() - 1 + itemsCount) % itemsCount);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const item = items()[selectedIndex()];
			if (item) {
				if (item.type === 'action') {
					item.onSelect();
				} else {
					props.onClose();
					props.onOpenFile(item.path);
				}
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			props.onClose();
		}
	};

	return (
		<Show when={props.isOpen}>
			<div class={paletteOverlay} onClick={props.onClose}>
				<div class={paletteModal} onClick={(e) => e.stopPropagation()}>
					<input
						ref={inputRef}
						class={paletteInput}
						type="text"
						placeholder="Type to search files or choose an action..."
						value={query()}
						onInput={(e) => setQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
					/>
					<div class={paletteResults}>
						<Show
							when={items().length > 0}
							fallback={
								<div class={paletteEmpty}>
									No results found
								</div>
							}
						>
							<For each={items()}>
								{(item, index) => (
									<div
										data-palette-index={index()}
										class={`${paletteItem} ${selectedIndex() === index() ? paletteItemActive : ""}`}
										onClick={() => {
											if (item.type === 'action') {
												item.onSelect();
											} else {
												props.onClose();
												props.onOpenFile(item.path);
											}
										}}
										onMouseEnter={() => setSelectedIndex(index())}
									>
										<span class={paletteItemIcon}>
											{item.type === 'action' ? item.icon : '📄'}
										</span>
										<span class={paletteItemLabel}>
											{item.type === 'action' ? item.label : item.name}
										</span>
										<span class={paletteItemKind}>
											{item.type === 'action' ? 'action' : item.type === 'file' ? 'file' : ''}
										</span>
									</div>
								)}
							</For>
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
}

/* =======================
   Local Graph View
======================= */

function LocalGraphView(props: {
	isOpen: boolean;
	onClose: () => void;
	currentPath: string | null;
	notesIndex: Record<string, NoteMetadata>;
	onOpenFile: (path: string) => void;
}) {
	let svgRef: SVGSVGElement | undefined;

	createEffect(() => {
		if (!props.isOpen || !svgRef || !props.currentPath) return;

		const current = props.notesIndex[props.currentPath];
		if (!current) return;

		// Build simple graph: current note + neighbors
		const nodes: Array<{id: string; label: string; isCurrent: boolean}> = [];
		const links: Array<{source: string; target: string}> = [];

		// Add current note
		nodes.push({
			id: props.currentPath,
			label: current.title || props.currentPath.split('/').pop() || '',
			isCurrent: true
		});

		// Add outgoing links as nodes
		for (const link of current.outgoingLinks) {
			const targetPath = Object.keys(props.notesIndex).find(p => {
				const note = props.notesIndex[p];
				return note.id === link.target || 
					note.title === link.target || 
					p === link.target ||
					(note.aliases || []).includes(link.target);
			});

			if (targetPath && !nodes.find(n => n.id === targetPath)) {
				const targetNote = props.notesIndex[targetPath];
				nodes.push({
					id: targetPath,
					label: targetNote?.title || targetPath.split('/').pop() || '',
					isCurrent: false
				});
				links.push({ source: props.currentPath, target: targetPath });
			}
		}

		// Add backlinks as nodes
		for (const backlink of current.backlinks) {
			if (!nodes.find(n => n.id === backlink)) {
				const backlinkNote = props.notesIndex[backlink];
				nodes.push({
					id: backlink,
					label: backlinkNote?.title || backlink.split('/').pop() || '',
					isCurrent: false
				});
			}
			links.push({ source: backlink, target: props.currentPath });
		}

		// Simple SVG rendering (no force simulation for simplicity)
		const width = svgRef.clientWidth;
		const height = svgRef.clientHeight;
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) / 3;

		svgRef.innerHTML = '';

		// Position nodes in a circle around current
		const angleStep = (2 * Math.PI) / Math.max(1, nodes.length - 1);
		const positions = new Map<string, {x: number; y: number}>();

		nodes.forEach((node, i) => {
			if (node.isCurrent) {
				positions.set(node.id, { x: centerX, y: centerY });
			} else {
				const angle = angleStep * (i - 1);
				positions.set(node.id, {
					x: centerX + radius * Math.cos(angle),
					y: centerY + radius * Math.sin(angle)
				});
			}
		});

		// Draw links
		links.forEach(link => {
			const source = positions.get(link.source);
			const target = positions.get(link.target);
			if (!source || !target) return;

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', String(source.x));
			line.setAttribute('y1', String(source.y));
			line.setAttribute('x2', String(target.x));
			line.setAttribute('y2', String(target.y));
			line.setAttribute('stroke', '#3c3c3c');
			line.setAttribute('stroke-width', '2');
			svgRef.appendChild(line);
		});

		// Draw nodes
		nodes.forEach(node => {
			const pos = positions.get(node.id);
			if (!pos) return;

			const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.style.cursor = 'pointer';
			g.onclick = () => props.onOpenFile(node.id);

			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', String(pos.x));
			circle.setAttribute('cy', String(pos.y));
			circle.setAttribute('r', node.isCurrent ? '12' : '8');
			circle.setAttribute('fill', node.isCurrent ? '#60a5fa' : '#3c3c3c');
			circle.setAttribute('stroke', node.isCurrent ? '#60a5fa' : '#666');
			circle.setAttribute('stroke-width', '2');

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', String(pos.x));
			text.setAttribute('y', String(pos.y - 20));
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', '#ffffff');
			text.setAttribute('font-size', '12');
			text.textContent = node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label;

			g.appendChild(circle);
			g.appendChild(text);
			svgRef.appendChild(g);
		});
	});

	return (
		<Show when={props.isOpen}>
			<div class={graphOverlay} onClick={props.onClose}>
				<div class={graphContainer} onClick={(e) => e.stopPropagation()}>
					<div class={graphHeader}>
						<div class={graphTitle}>
							Local Graph: {props.currentPath ? (props.notesIndex[props.currentPath]?.title || props.currentPath.split('/').pop()) : ''}
						</div>
						<button class={graphClose} onClick={props.onClose}>×</button>
					</div>
					<svg ref={svgRef} class={graphCanvas} />
				</div>
			</div>
		</Show>
	);
}

/* =======================
   Icon helpers
======================= */

// File state management types
type FileState = {
	savedContent: string;  // Content from server (source of truth)
	draftContent: string;  // User's current edits
	hash: string;          // SHA256 hash from server
};

type FileStore = {
	[filePath: string]: FileState;
};

function Icon(props: { children: any }) {
	return (
		<svg class={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			{props.children}
		</svg>
	);
}

function RailButton(props: { title: string; onClick: () => void; children: any }) {
	return (
		<button class={iconBtn} title={props.title} onClick={props.onClick}>
			{props.children}
		</button>
	);
}

/* =======================
   TreeView (pure)
======================= */

function TreeView(props: {
	nodes: TreeNode[];
	openFolders: Set<string>;
	toggleFolder: (path: string) => void;

	selectedFile: string;
	onOpenFile: (path: string, isPreview?: boolean) => void;

	newlyCreatedFile: string;

	pending: PendingCreate;
	pendingName: string;
	setPendingName: (v: string) => void;
	commitPending: () => void;
	cancelPending: () => void;

	onRename: (oldPath: string, newName: string) => void;
	onDelete: (path: string, kind: "file" | "folder") => void;

	activeFolder: string;
	draggedFile: string;
	setDraggedFile: (path: string) => void;
	dropTarget: string;
	setDropTarget: (path: string) => void;
	onMove: (filePath: string, targetFolder: string) => void;
}) {
	const [renamingPath, setRenamingPath] = createSignal<string>("");
	const [renameValue, setRenameValue] = createSignal<string>("");
	let pendingInputRef: HTMLInputElement | undefined;

	// Auto-focus pending input when it appears
	createEffect(() => {
		if (props.pending && pendingInputRef) {
			setTimeout(() => pendingInputRef?.focus(), 0);
		}
	});

	const startRename = (path: string, currentName: string) => {
		setRenamingPath(path);
		// Strip .md extension for editing
		const nameWithoutExt = currentName.endsWith('.md')
			? currentName.slice(0, -3)
			: currentName;
		setRenameValue(nameWithoutExt);
	};

	const commitRename = () => {
		const path = renamingPath();
		const newName = renameValue().trim();
		if (path && newName) {
			// Always append .md extension
			const newNameWithExt = newName.endsWith('.md') ? newName : `${newName}.md`;
			props.onRename(path, newNameWithExt);
			setRenamingPath("");
		}
	};

	const cancelRename = () => {
		setRenamingPath("");
		setRenameValue("");
	};

	const renderNodes = (nodes: TreeNode[], depth: number) => (
		<For each={nodes}>
			{(n) => (
				<>
					<Show
						when={n.kind === "folder"}
						fallback={
							<Show
								when={renamingPath() === n.path}
								fallback={
									<div
										class={`${row} ${rowWithActions} ${props.draggedFile === n.path ? rowDragging : ""
											} ${props.newlyCreatedFile === n.path
												? rowNew
												: props.selectedFile === n.path
													? rowActive
													: ""
											}`}
										style={{ "padding-left": `${10 + depth * 14}px`, display: "flex", "justify-content": "space-between" }}
										draggable={true}
										onDragStart={(e) => {
											props.setDraggedFile(n.path);
											e.dataTransfer!.effectAllowed = "move";
										}}
										onDragEnd={() => {
											props.setDraggedFile("");
											props.setDropTarget("");
										}}
										onClick={(e) => {
											if (e.detail === 1) {
												// Single-click: preview
												props.onOpenFile(n.path, true);
											} else if (e.detail === 2) {
												// Double-click: persist
												props.onOpenFile(n.path, false);
											}
										}}
										onKeyDown={(e) => {
											if (e.key === "F2") {
												e.preventDefault();
												startRename(n.path, n.name);
											}
											if (e.key === "Delete") {
												e.preventDefault();
												props.onDelete(n.path, "file");
											}
										}}
										tabIndex={0}
										title={n.path}
									>
										<span style={{ display: "flex", "align-items": "center", gap: "6px", flex: 1, "min-width": 0 }}>
											<span class={caret} />
											<span style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
												{n.name}
											</span>
										</span>
										<span class="actions" style={{ display: "flex", gap: "4px", "margin-left": "8px" }}>
											<button
												class={actionBtn}
												onClick={(e) => {
													e.stopPropagation();
													startRename(n.path, n.name);
												}}
												title="Rename (F2)"
											>
												F2
											</button>
											<button
												class={actionBtn}
												onClick={(e) => {
													e.stopPropagation();
													props.onDelete(n.path, "file");
												}}
												title="Delete"
											>
												Del
											</button>
										</span>
									</div>
								}
							>
								<div style={{ "padding-left": `${10 + depth * 14}px`, padding: "6px 8px" }}>
									<div class={renameInputWrapper}>
										<input
											class={renameInput}
											value={renameValue()}
											onInput={(e) => setRenameValue(e.currentTarget.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") commitRename();
												if (e.key === "Escape") cancelRename();
											}}
											onBlur={cancelRename}
											autofocus
										/>
										<span class={renameExtension}>.md</span>
									</div>
								</div>
							</Show>
						}
					>
						{(() => {
							const folder = n as Extract<TreeNode, { kind: "folder" }>;
							const isOpen = props.openFolders.has(folder.path);
							const isPendingHere = props.pending && props.pending.parentDir === folder.path;

							return (
								<>
									<div
										class={`${row} ${rowWithActions} ${props.dropTarget === folder.path ? rowDropTarget : ""
											} ${props.activeFolder === folder.path ? rowActiveFolder : ""
											}`}
										style={{ "padding-left": `${10 + depth * 14}px`, display: "flex", "justify-content": "space-between" }}
										onClick={() => props.toggleFolder(folder.path)}
										onKeyDown={(e) => {
											if (e.key === "F2") {
												e.preventDefault();
												startRename(folder.path, folder.name);
											}
											if (e.key === "Delete") {
												e.preventDefault();
												props.onDelete(folder.path, "folder");
											}
										}}
										tabIndex={0}
										onDragOver={(e) => {
											if (props.draggedFile && props.draggedFile !== folder.path) {
												e.preventDefault();
												e.dataTransfer!.dropEffect = "move";
												props.setDropTarget(folder.path);
											}
										}}
										onDragLeave={() => {
											props.setDropTarget("");
										}}
										onDrop={(e) => {
											e.preventDefault();
											if (props.draggedFile) {
												props.onMove(props.draggedFile, folder.path);
												props.setDraggedFile("");
												props.setDropTarget("");
											}
										}}
											title={folder.path}
										>
											<span style={{ display: "flex", "align-items": "center", gap: "6px", flex: 1, "min-width": 0 }}>
												<span class={caret}>{isOpen ? "▾" : ">"}</span>
												<strong style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>{folder.name}</strong>
											</span>
											<span class="actions" style={{ display: "flex", gap: "4px", "margin-left": "8px" }}>
												<button
													class={actionBtn}
													onClick={(e) => {
														e.stopPropagation();
														startRename(folder.path, folder.name);
													}}
													title="Rename (F2)"
												>
													F2
												</button>
												<button
													class={actionBtn}
													onClick={(e) => {
														e.stopPropagation();
														props.onDelete(folder.path, "folder");
													}}
													title="Delete"
												>
													Del
												</button>
											</span>
										</div>

									<Show when={renamingPath() === folder.path}>
										<div style={{ "padding-left": `${10 + depth * 14}px`, padding: "6px 8px" }}>
											<input
												class={nameInput}
												value={renameValue()}
												onInput={(e) => setRenameValue(e.currentTarget.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														const path = renamingPath();
														const newName = renameValue().trim();
														if (path && newName) {
															props.onRename(path, newName);
															setRenamingPath("");
														}
													}
													if (e.key === "Escape") cancelRename();
												}}
												onBlur={cancelRename}
												autofocus
											/>
										</div>
									</Show>

									<Show when={isPendingHere}>
										<div style={{ "padding-left": `${10 + (depth + 1) * 14}px`, padding: "6px 8px" }}>
											<input
												ref={pendingInputRef}
												class={nameInput}
												value={props.pendingName}
												onInput={(e) => props.setPendingName(e.currentTarget.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") props.commitPending();
													if (e.key === "Escape") props.cancelPending();
												}}
											/>
										</div>
									</Show>									<Show when={isOpen}>{renderNodes(folder.children, depth + 1)}</Show>
								</>
							);
						})()}
					</Show>
				</>
			)}
		</For>
	);

	const showPendingInRoot = createMemo(() => props.pending && props.pending.parentDir === "");

	return (
		<>
			<Show when={showPendingInRoot()}>
				<div style={{ padding: "8px", background: "rgba(255, 255, 255, 0.08)", "border-radius": "8px", "margin-bottom": "8px" }}>
					<input
						ref={pendingInputRef}
						class={nameInput}
						value={props.pendingName}
						onInput={(e) => props.setPendingName(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") props.commitPending();
							if (e.key === "Escape") props.cancelPending();
						}}
						placeholder={props.pending?.kind === "folder" ? "Folder name..." : "Note name..."}
					/>
				</div>
			</Show>
			<div
				onDragOver={(e) => {
					if (props.draggedFile) {
						e.preventDefault();
						e.dataTransfer!.dropEffect = "move";
					}
				}}
				onDrop={(e) => {
					e.preventDefault();
					if (props.draggedFile) {
						// Drop to root level
						props.onMove(props.draggedFile, "");
						props.setDraggedFile("");
						props.setDropTarget("");
					}
				}}
			>
				{renderNodes(props.nodes, 0)}
			</div>
		</>
	);
}

/* =======================
   Home
======================= */

export const Home = () => {
	// IMPORTANT: listTree (not listFiles) so empty folders show
	const [entries, { refetch: refetchTree }] = createResource(api.listTree);

	// stub “zettelkasten plugin enabled” for now
	const [zettelkastenEnabled] = createSignal(true);

	const treeNodes = createMemo(() => buildTreeFromEntries(entries() ?? []));

	// Load persisted state from localStorage
	const loadPersistedState = () => {
		try {
			const stored = localStorage.getItem('deez-ui-state');
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to load persisted state:', e);
		}
		return null;
	};

	const persistedState = loadPersistedState();

	const [openFolders, setOpenFolders] = createSignal<Set<string>>(
		persistedState?.openFolders ? new Set(persistedState.openFolders) : new Set()
	);
	const [selectedFile, setSelectedFile] = createSignal<string>(persistedState?.selectedFile || "");
	const [newlyCreatedFile, setNewlyCreatedFile] = createSignal<string>("");

	const [isSaving, setIsSaving] = createSignal(false);

	const [pending, setPending] = createSignal<PendingCreate>(null);
	const [pendingName, setPendingName] = createSignal("");

	const [sidebarWidth, setSidebarWidth] = createSignal(persistedState?.sidebarWidth || 320);

	const [openTabs, setOpenTabs] = createSignal<string[]>(persistedState?.openTabs || []);
	const [viewMode, setViewMode] = createSignal<"edit" | "preview">("edit");

	// Command palette state
	const [paletteOpen, setPaletteOpen] = createSignal(false);

	// Active folder for context (used when creating new files)
	const [activeFolder, setActiveFolder] = createSignal<string>("");

	// Drag and drop state
	const [draggedFile, setDraggedFile] = createSignal<string>("");
	const [dropTarget, setDropTarget] = createSignal<string>("");

	// Preview tab state (VS Code-style single-click preview)
	const [previewTab, setPreviewTab] = createSignal<string>("");

	// Frontmatter state
	const [showFrontmatter, setShowFrontmatter] = createSignal(true);

	// Graph view state
	const [graphOpen, setGraphOpen] = createSignal(false);

	// Zettelkasten: Backlinks index (note path -> metadata)
	const [notesIndex, setNotesIndex] = createStore<Record<string, NoteMetadata>>({});

	// Rebuild the backlinks index when files change
	const rebuildIndex = async () => {
		const allEntries = entries();
		if (!allEntries) return;

		const files = allEntries.filter(e => e.kind === "file" && e.path.endsWith('.md'));
		const newIndex: Record<string, NoteMetadata> = {};

		// First pass: extract all links and metadata
		for (const file of files) {
			try {
				const content = fileStore[file.path]?.draftContent || fileStore[file.path]?.savedContent;
				if (!content) {
					// File not loaded yet, skip for now
					newIndex[file.path] = {
						path: file.path,
						outgoingLinks: [],
						backlinks: []
					};
					continue;
				}

				const parsed = parseFrontmatter(content);
				const links = extractLinks(parsed.body);

				newIndex[file.path] = {
					path: file.path,
					id: parsed.frontmatter?.id,
					title: parsed.frontmatter?.title,
					aliases: parsed.frontmatter?.aliases || [],
					outgoingLinks: links,
					backlinks: [] // Will populate in second pass
				};
			} catch (e) {
				console.error(`Failed to index ${file.path}:`, e);
			}
		}

		// Second pass: build backlinks
		for (const sourcePath in newIndex) {
			const sourceNote = newIndex[sourcePath];
			for (const link of sourceNote.outgoingLinks) {
				// Resolve link target to actual file path
				const targetPath = resolveLinkTarget(link.target, newIndex);
				if (targetPath && newIndex[targetPath]) {
					if (!newIndex[targetPath].backlinks.includes(sourcePath)) {
						newIndex[targetPath].backlinks.push(sourcePath);
					}
				}
			}
		}

		setNotesIndex(newIndex);
	};

	// Resolve a link target ([[id-or-title]]) to actual file path
	const resolveLinkTarget = (target: string, index: Record<string, NoteMetadata>): string | null => {
		// Try exact ID match first
		for (const path in index) {
			if (index[path].id === target) return path;
		}

		// Try exact filename match (with or without .md)
		const targetWithExt = target.endsWith('.md') ? target : `${target}.md`;
		if (index[targetWithExt]) return targetWithExt;

		// Try title match
		for (const path in index) {
			if (index[path].title?.toLowerCase() === target.toLowerCase()) return path;
		}

		// Try alias match
		for (const path in index) {
			const aliases = index[path].aliases || [];
			if (aliases.some(a => a.toLowerCase() === target.toLowerCase())) return path;
		}

		return null;
	};

	// Rebuild index when tree loads or changes
	createEffect(() => {
		const tree = entries();
		if (tree) {
			rebuildIndex();
		}
	});

	// Rebuild index when current file is saved (its links may have changed)
	const triggerIndexRebuild = () => {
		setTimeout(() => rebuildIndex(), 100);
	};

	// Current note's metadata
	const currentNoteMetadata = createMemo(() => {
		const file = selectedFile();
		return file ? notesIndex[file] : null;
	});

	// Find unlinked mentions of current note in other notes
	const unlinkedMentions = createMemo(() => {
		const current = currentNoteMetadata();
		if (!current) return [];

		const mentions: Array<{ path: string; title: string; context: string }> = [];
		const searchTerms = [
			current.title,
			...(current.aliases || [])
		].filter(Boolean).map(t => t!.toLowerCase());

		if (searchTerms.length === 0) return [];

		// Search all other notes for mentions of this note's title/aliases
		for (const path in notesIndex) {
			if (path === current.path) continue; // Skip current note

			const note = notesIndex[path];
			
			// Check if already linked (skip if it is)
			const alreadyLinked = note.outgoingLinks.some(link => {
				const resolved = resolveLinkTarget(link.target, notesIndex);
				return resolved === current.path;
			});
			if (alreadyLinked) continue;

			// Check if the note's body mentions any of our search terms
			const content = fileStore[path]?.draftContent || fileStore[path]?.savedContent;
			if (!content) continue;

			const parsed = parseFrontmatter(content);
			const bodyLower = parsed.body.toLowerCase();

			for (const term of searchTerms) {
				if (bodyLower.includes(term)) {
					// Extract context (surrounding text)
					const index = bodyLower.indexOf(term);
					const start = Math.max(0, index - 40);
					const end = Math.min(parsed.body.length, index + term.length + 40);
					const context = (start > 0 ? '...' : '') + 
						parsed.body.substring(start, end) + 
						(end < parsed.body.length ? '...' : '');

					mentions.push({
						path,
						title: note.title || path.split('/').pop() || path,
						context
					});
					break; // Only add once per note
				}
			}
		}

		return mentions;
	});

	// Persist UI state to localStorage
	createEffect(() => {
		const state = {
			sidebarWidth: sidebarWidth(),
			openFolders: Array.from(openFolders()),
			openTabs: openTabs(),
			selectedFile: selectedFile()
		};
		try {
			localStorage.setItem('deez-ui-state', JSON.stringify(state));
		} catch (e) {
			console.error('Failed to persist state:', e);
		}
	});

	// File state store - the single source of truth for all file content
	const [fileStore, setFileStore] = createStore<FileStore>({});

	// Computed: current file's draft content
	const draft = createMemo(() => {
		const file = selectedFile();
		if (!file) return "";
		return fileStore[file]?.draftContent || "";
	});

	// Computed: parsed frontmatter from current file
	const currentParsed = createMemo(() => parseFrontmatter(draft()));
	const currentFrontmatter = createMemo(() => currentParsed().frontmatter);
	const currentBody = createMemo(() => currentParsed().body);

	// Update draft content for current file
	const setDraft = (content: string) => {
		const file = selectedFile();
		if (!file) return;

		// Editing a preview tab promotes it to permanent
		if (previewTab() === file) {
			setPreviewTab("");
		}

		setFileStore(produce((store) => {
			if (!store[file]) {
				store[file] = { savedContent: "", draftContent: content, hash: "" };
			} else {
				store[file].draftContent = content;
			}
		}));
	};

	// Update frontmatter and rebuild content
	const updateFrontmatter = (updates: Partial<Frontmatter>) => {
		const parsed = currentParsed();
		const fm = parsed.frontmatter || createDefaultFrontmatter(selectedFile()!);
		const updated = { ...fm, ...updates, updated: new Date().toISOString() };
		const newContent = serializeFrontmatter(updated, parsed.body);
		setDraft(newContent);
	};

	// Add frontmatter if it doesn't exist
	const addFrontmatter = () => {
		if (currentFrontmatter()) return;
		const fm = createDefaultFrontmatter(selectedFile()!);
		const newContent = serializeFrontmatter(fm, draft());
		setDraft(newContent);
	};

	// Remove frontmatter
	const removeFrontmatter = () => {
		if (!currentFrontmatter()) return;
		setDraft(currentBody());
	};

	// Check if a file has unsaved changes
	const isFileDirty = (filePath: string) => {
		const state = fileStore[filePath];
		if (!state) return false;
		return state.draftContent !== state.savedContent;
	};

	// Configure marked with syntax highlighting
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	const previewHtml = createMemo(() => {
		if (!selectedFile() || viewMode() !== "preview") return "";
		
		// Render only the body (without frontmatter)
		const content = currentBody();
		const renderer = new marked.Renderer();
		
		renderer.code = (token: { text: string; lang?: string; escaped?: boolean }) => {
			const code = token.text;
			const language = token.lang;
			const validLanguage = language && hljs.getLanguage(language) ? language : 'plaintext';
			const highlighted = hljs.highlight(code, { language: validLanguage }).value;
			return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
		};

		return marked(content, { renderer }) as string;
	});

	const [file] = createResource(
		() => selectedFile() || null,
		(p) => {
			if (!p) return null;
			return api.readFile(p);
		}
	);

	// Load file content from server and update store
	createEffect(() => {
		const f = file();
		if (!f) return;

		const currentFile = selectedFile();
		if (!currentFile) return;

		setFileStore(produce((store) => {
			// Always reset to server content when loading a file
			// This ensures opening a file doesn't show it as dirty
			store[currentFile] = {
				savedContent: f.content,
				draftContent: f.content,
				hash: f.sha256
			};
		}));
	});

	const toggleFolder = (p: string) => {
		const next = new Set(openFolders());
		if (next.has(p)) {
			next.delete(p);
			if (activeFolder() === p) setActiveFolder("");
		} else {
			next.add(p);
			setActiveFolder(p); // Set as active when expanding
		}
		setOpenFolders(next);
	};

	const collapseAll = () => setOpenFolders(new Set<string>());

	// Helper to initialize a new file's content in the store
	const initializeFile = (filePath: string, content: string = "") => {
		setFileStore(produce((store) => {
			store[filePath] = {
				savedContent: content,
				draftContent: content,
				hash: ""
			};
		}));
	};

	// Parent dir: use activeFolder if set, else directory of selected file, else root
	const currentDir = () => {
		const active = activeFolder();
		if (active) return active;

		const p = selectedFile();
		if (!p) return "";
		const idx = p.lastIndexOf("/");
		return idx === -1 ? "" : p.slice(0, idx);
	};

	const onNewFolder = () => {
		const parentDir = currentDir();
		setPending({ kind: "folder", parentDir, tempId: crypto.randomUUID() });
		setPendingName("New folder");

		if (parentDir) {
			const next = new Set(openFolders());
			next.add(parentDir);
			setOpenFolders(next);
		}
	};

	const onNewNote = async () => {
		const parentDir = currentDir();
		const fileName = zettelkastenEnabled() ? formatZettelDefaultName() : "New note.md";
		const filePath = joinPath(parentDir, fileName);

		try {
			// Use plugin hooks to generate initial content
			const initialContent = zettelkastenEnabled() 
				? await pluginRegistry.executeOnCreateNote(filePath)
				: "";
			
			// Create the file with initial content
			await api.createFile(filePath, initialContent);
			await refetchTree();

			// Mark as newly created and clear after 2 seconds
			setNewlyCreatedFile(filePath);
			setTimeout(() => setNewlyCreatedFile(""), 2000);

			// Open in tab and initialize store with content
			openInTab(filePath);
			initializeFile(filePath, initialContent);
			if (parentDir) {
				const next = new Set(openFolders());
				next.add(parentDir);
				setOpenFolders(next);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const commitPending = async () => {
		const p = pending();
		if (!p) return;

		const raw = pendingName().trim();
		if (!raw) {
			setPending(null);
			return;
		}

		try {
			if (p.kind === "folder") {
				const folderPath = joinPath(p.parentDir, raw);
				await api.createFolder(folderPath);
				await refetchTree();
				setPending(null);
				return;
			}

			const fileName = normalizeMarkdownName(raw);
			const filePath = joinPath(p.parentDir, fileName);

			await api.createFile(filePath, "");
			await refetchTree();

			openInTab(filePath);
			initializeFile(filePath, "");

			setPending(null);
		} catch (e) {
			console.error(e);
		}
	};

	const cancelPending = () => setPending(null);

	const save = async () => {
		const p = selectedFile();
		if (!p || isSaving()) return;

		const state = fileStore[p];
		if (!state) return;

		try {
			setIsSaving(true);
			
			// Auto-update the 'updated' timestamp in frontmatter if it exists
			let contentToSave = state.draftContent;
			const parsed = parseFrontmatter(contentToSave);
			if (parsed.frontmatter) {
				const updatedFm = { ...parsed.frontmatter, updated: new Date().toISOString() };
				contentToSave = serializeFrontmatter(updatedFm, parsed.body);
				
				// Update the draft content to reflect the timestamp change
				setFileStore(produce((store) => {
					if (store[p]) {
						store[p].draftContent = contentToSave;
					}
				}));
			}
			
			const res = await api.writeFile(p, {
				content: contentToSave,
				ifMatch: state.hash
			});

			// Update store: saved content now matches draft, update hash
			setFileStore(produce((store) => {
				if (store[p]) {
					store[p].savedContent = store[p].draftContent;
					store[p].hash = res.sha256;
				}
			}));

			await refetchTree();
			
			// Execute plugin hooks on save
			const parsedNote = await pluginRegistry.executeOnParse(contentToSave, p);
			await pluginRegistry.executeOnSave({
				path: p,
				content: contentToSave,
				parsed: parsedNote
			});
			
			// Rebuild backlinks index after save (links may have changed)
			triggerIndexRebuild();
		} catch (e) {
			console.error("Save failed:", e);
		} finally {
			setIsSaving(false);
		}
	};

	const openInTab = (filePath: string, isPreview: boolean = false) => {
		const currentPreview = previewTab();
		const tabs = openTabs();
		const isAlreadyOpen = tabs.includes(filePath);
		const isPermanent = isAlreadyOpen && currentPreview !== filePath;
		
		if (isPreview) {
			// If file is already open as permanent tab, just select it
			if (isPermanent) {
				setSelectedFile(filePath);
				return;
			}
			
			// Single-click: open as preview
			if (currentPreview && currentPreview !== filePath) {
				// Replace existing preview tab
				const previewIdx = tabs.indexOf(currentPreview);
				if (previewIdx !== -1) {
					// Replace preview tab with new file
					const newTabs = [...tabs];
					newTabs[previewIdx] = filePath;
					setOpenTabs(newTabs);
					
					// Clean up old preview file from store
					setFileStore(produce((store) => {
						delete store[currentPreview];
					}));
				} else {
					// Preview tab was already promoted, just add new preview
					if (!isAlreadyOpen) {
						setOpenTabs([...tabs, filePath]);
					}
				}
			} else if (!isAlreadyOpen) {
				// No existing preview, just add new tab
				setOpenTabs([...tabs, filePath]);
			}
			setPreviewTab(filePath);
		} else {
			// Double-click: persist tab (remove from preview mode)
			if (!isAlreadyOpen) {
				setOpenTabs([...tabs, filePath]);
			}
			if (previewTab() === filePath) {
				setPreviewTab(""); // Promote to permanent tab
			}
		}
		
		setSelectedFile(filePath);
	};

	const closeTab = async (filePath: string, e?: MouseEvent) => {
		e?.stopPropagation();

		// Check if file has unsaved changes
		const fileIsDirty = isFileDirty(filePath);
		if (fileIsDirty) {
			const result = confirm(`"${filePath.split('/').pop()}" has unsaved changes. Do you want to save them?\n\nYour changes will be lost if you don't save them.`);

			if (result) {
				// User wants to save
				if (selectedFile() === filePath) {
					// File is currently selected, save it
					await save();
				} else {
					// File is not selected, we need to switch to it, save, then close
					setSelectedFile(filePath);
					// Wait a tick for the file to load
					await new Promise(resolve => setTimeout(resolve, 100));
					await save();
				}
			} else {
				// User doesn't want to save (revert changes to saved version)
				const state = fileStore[filePath];
				if (state) {
					setFileStore(produce((store) => {
						if (store[filePath]) {
							store[filePath].draftContent = store[filePath].savedContent;
						}
					}));
				}
			}
		}

		// Get current index before removing
		const currentIdx = openTabs().indexOf(filePath);
		const tabs = openTabs().filter(p => p !== filePath);
		setOpenTabs(tabs);

		// Remove from store
		setFileStore(produce((store) => {
			delete store[filePath];
		}));

		// If closing the selected file, select an appropriate tab
		if (selectedFile() === filePath) {
			if (tabs.length > 0) {
				// Try to select the tab to the right, or the one to the left if at the end
				const nextIdx = currentIdx >= tabs.length ? tabs.length - 1 : currentIdx;
				setSelectedFile(tabs[nextIdx]);
			} else {
				setSelectedFile("");
			}
		}
	};

	const insertMarkdown = (before: string, after: string = "") => {
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		if (!textarea) return;

		const file = selectedFile();
		if (!file) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const currentDraft = draft();
		const selectedText = currentDraft.substring(start, end);
		const newText = currentDraft.substring(0, start) + before + selectedText + after + currentDraft.substring(end);

		// Update draft using setDraft helper
		setDraft(newText);

		// Restore cursor position
		setTimeout(() => {
			const newCursorPos = start + before.length + selectedText.length + after.length;
			textarea.selectionStart = newCursorPos;
			textarea.selectionEnd = newCursorPos;
			textarea.focus();
		}, 0);
	};

	// Sidebar resize handlers
	const handleResizeStart = (e: MouseEvent) => {
		e.preventDefault();

		const handleResize = (e: MouseEvent) => {
			const newWidth = Math.max(200, Math.min(600, e.clientX));
			setSidebarWidth(newWidth);
		};

		const handleResizeEnd = () => {
			document.removeEventListener('mousemove', handleResize);
			document.removeEventListener('mouseup', handleResizeEnd);
		};

		document.addEventListener('mousemove', handleResize);
		document.addEventListener('mouseup', handleResizeEnd);
	};

	// Keyboard shortcuts - setup once on mount
	const handleKeyDown = (e: KeyboardEvent) => {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const mod = isMac ? e.metaKey : e.ctrlKey;

		// Cmd/Ctrl+Shift+N: New folder (check this first before regular N)
		if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			onNewFolder();
			return false;
		}

		// Cmd/Ctrl+N: New note
		if (mod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			onNewNote();
			return false;
		}

		// Cmd/Ctrl+S: Save
		if (mod && e.key === 's') {
			e.preventDefault();
			e.stopPropagation();
			save();
			return false;
		}

		// Cmd/Ctrl+B: Bold
		if (mod && e.key === 'b' && selectedFile()) {
			e.preventDefault();
			e.stopPropagation();
			insertMarkdown("**", "**");
			return false;
		}

		// Cmd/Ctrl+I: Italic
		if (mod && e.key === 'i' && selectedFile()) {
			e.preventDefault();
			e.stopPropagation();
			insertMarkdown("*", "*");
			return false;
		}

		// Cmd/Ctrl+E: Toggle preview
		if (mod && e.key === 'e' && selectedFile()) {
			e.preventDefault();
			e.stopPropagation();
			setViewMode(viewMode() === "edit" ? "preview" : "edit");
			return false;
		}

		// Cmd/Ctrl+P: Command palette
		if (mod && e.key === 'p') {
			e.preventDefault();
			e.stopPropagation();
			setPaletteOpen(true);
			return false;
		}
	};

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown, { capture: true });
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any));
	});

	const onRename = async (oldPath: string, newName: string) => {
		console.log('onRename called:', { oldPath, newName });
		try {
			const dir = oldPath.lastIndexOf("/") === -1 ? "" : oldPath.slice(0, oldPath.lastIndexOf("/"));
			
			// Determine if this is a file or folder by checking entries
			const allEntries = entries() ?? [];
			const entry = allEntries.find(e => e.path === oldPath);
			const isFolder = entry?.kind === "folder";
			
			// For files, ensure .md extension; for folders, use name as-is
			const finalName = isFolder ? newName : (newName.endsWith('.md') ? newName : `${newName}.md`);
			const newPath = joinPath(dir, finalName);

			console.log('Renaming to:', newPath);
			await api.rename(oldPath, newPath);
			await refetchTree();

			// Execute plugin hooks on rename
			await pluginRegistry.executeOnRename(oldPath, newPath);

			// Update tabs if the file is open
			const tabs = openTabs();
			const tabIndex = tabs.indexOf(oldPath);
			if (tabIndex !== -1) {
				const newTabs = [...tabs];
				newTabs[tabIndex] = newPath;
				setOpenTabs(newTabs);
			}

			// Update file store (move the file state to new path)
			setFileStore(produce((store) => {
				if (store[oldPath]) {
					store[newPath] = store[oldPath];
					delete store[oldPath];
				}
			}));

			// If the renamed file was selected, update selection
			if (selectedFile() === oldPath) {
				setSelectedFile(newPath);
			}
		} catch (e) {
			console.error("Rename failed:", e);
			alert(`Rename failed: ${e}`);
		}
	};

	const onDelete = async (path: string, kind: "file" | "folder") => {
		console.log('onDelete called:', { path, kind });
		
		let confirmMsg: string;
		if (kind === "folder") {
			// Count files in this folder
			const allEntries = entries() ?? [];
			const filesInFolder = allEntries.filter(e => 
				e.kind === "file" && e.path.startsWith(path + "/")
			);
			const foldersInFolder = allEntries.filter(e => 
				e.kind === "folder" && e.path.startsWith(path + "/")
			);
			
			if (filesInFolder.length > 0 || foldersInFolder.length > 0) {
				const parts = [];
				if (filesInFolder.length > 0) {
					parts.push(`${filesInFolder.length} file${filesInFolder.length === 1 ? '' : 's'}`);
				}
				if (foldersInFolder.length > 0) {
					parts.push(`${foldersInFolder.length} folder${foldersInFolder.length === 1 ? '' : 's'}`);
				}
				confirmMsg = `Delete folder "${path.split('/').pop()}"?\n\nThis will permanently delete ${parts.join(' and ')}.`;
			} else {
				confirmMsg = `Delete empty folder "${path.split('/').pop()}"?`;
			}
		} else {
			confirmMsg = `Delete file "${path.split('/').pop()}"?`;
		}

		if (!confirm(confirmMsg)) return;

		try {
			if (kind === "file") {
				await api.deleteFile(path);
				
				// Execute plugin hooks on delete
				await pluginRegistry.executeOnDelete(path);
			} else {
				await api.deleteFolder(path);
			}

			await refetchTree();

			// If the deleted file was selected, clear selection
			if (selectedFile() === path || selectedFile().startsWith(path + "/")) {
				setSelectedFile("");
			}
		} catch (e) {
			console.error("Delete failed:", e);
			alert(`Delete failed: ${e}`);
		}
	};

	const onMove = async (filePath: string, targetFolder: string) => {
		const fileName = filePath.split("/").pop()!;
		const newPath = joinPath(targetFolder, fileName);

		if (filePath === newPath) return; // No change

		try {
			await api.rename(filePath, newPath);
			await refetchTree();

			// Update tabs and selection
			const tabs = openTabs();
			const idx = tabs.indexOf(filePath);
			if (idx !== -1) {
				const newTabs = [...tabs];
				newTabs[idx] = newPath;
				setOpenTabs(newTabs);

				if (selectedFile() === filePath) {
					setSelectedFile(newPath);
				}
			}

			// Update file store
			setFileStore(produce((store) => {
				if (store[filePath]) {
					store[newPath] = store[filePath];
					delete store[filePath];
				}
			}));

			// Ensure target folder is expanded
			if (targetFolder) {
				const next = new Set(openFolders());
				next.add(targetFolder);
				setOpenFolders(next);
			}
		} catch (e) {
			console.error("Move failed:", e);
		}
	};

	// Tag extraction and management (from body only, not frontmatter)
	const extractTags = createMemo(() => {
		const content = currentBody();
		if (!content) return [];
		
		// Match hashtags: #word (but not ##heading)
		const tagRegex = /(?:^|[^#\w])#([a-zA-Z][a-zA-Z0-9_-]*)/g;
		const matches = Array.from(content.matchAll(tagRegex));
		const uniqueTags = new Set(matches.map(m => m[1]));
		return Array.from(uniqueTags).sort();
	});

	const addTag = (tag: string) => {
		const normalizedTag = tag.replace(/^#+\s*/, '').trim().replace(/\s+/g, '-');
		if (!normalizedTag) return;

		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		if (!textarea) return;

		const parsed = currentParsed();
		const tagToAdd = `#${normalizedTag}`;
		
		// Check if tag already exists in body
		if (extractTags().includes(normalizedTag)) {
			// Jump to first occurrence
			const index = draft().indexOf(tagToAdd);
			if (index !== -1) {
				textarea.focus();
				textarea.setSelectionRange(index, index + tagToAdd.length);
				textarea.scrollTop = textarea.scrollHeight * (index / draft().length);
			}
			return;
		}

		// Add tag at the end of the body with proper spacing
		const newBody = parsed.body.trimEnd() + (parsed.body.trim() ? '\n\n' : '') + tagToAdd;
		const newContent = parsed.frontmatter 
			? serializeFrontmatter(parsed.frontmatter, newBody)
			: newBody;
		setDraft(newContent);

		// Focus and scroll to new tag
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(newContent.length, newContent.length);
			textarea.scrollTop = textarea.scrollHeight;
		}, 0);
	};

	const removeTag = (tag: string) => {
		const parsed = currentParsed();
		const tagPattern = new RegExp(`(?:^|[^#\\w])#${tag}(?![\\w-])`, 'g');
		const newBody = parsed.body.replace(tagPattern, (match) => {
			// Keep the leading character if it's not # or word character
			return match[0] === '#' ? '' : match[0];
		}).replace(/\n{3,}/g, '\n\n').trim();
		
		const newContent = parsed.frontmatter
			? serializeFrontmatter(parsed.frontmatter, newBody)
			: newBody;
		setDraft(newContent);
	};

	const jumpToTag = (tag: string) => {
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		if (!textarea) return;

		const currentDraft = draft();
		const tagToFind = `#${tag}`;
		const index = currentDraft.indexOf(tagToFind);
		
		if (index !== -1) {
			textarea.focus();
			textarea.setSelectionRange(index, index + tagToFind.length);
			// Scroll to make the tag visible
			const lines = currentDraft.substring(0, index).split('\n').length;
			const lineHeight = 20; // approximate
			textarea.scrollTop = Math.max(0, (lines - 10) * lineHeight);
		}
	};

	const [tagInput, setTagInput] = createSignal("");
	const [showTagInput, setShowTagInput] = createSignal(false);

	return (
		<div class={shell} style={{ "--sidebar-width": `${sidebarWidth()}px` }}>
			{/* Left icon rail */}
			<div class={rail}>
				<RailButton title="Notes" onClick={() => console.log("Notes")}>
					<Icon>
						<path d="M6 2h9l3 3v17H6z" />
						<path d="M15 2v4h4" />
						<path d="M8 10h8M8 14h8" />
					</Icon>
				</RailButton>

				<RailButton title="Graph" onClick={() => setGraphOpen(true)}>
					<Icon>
						<circle cx="6" cy="12" r="2" />
						<circle cx="18" cy="6" r="2" />
						<circle cx="18" cy="18" r="2" />
						<path d="M8 12l8-6M8 12l8 6" />
					</Icon>
				</RailButton>

				<RailButton title="Calendar" onClick={() => console.log("Calendar")}>
					<Icon>
						<path d="M7 3v2M17 3v2" />
						<path d="M4 7h16" />
						<rect x="4" y="5" width="16" height="16" rx="2" />
					</Icon>
				</RailButton>

				<RailButton title="Pages" onClick={() => console.log("Pages")}>
					<Icon>
						<rect x="6" y="3" width="12" height="18" rx="2" />
						<path d="M9 7h6M9 11h6M9 15h6" />
					</Icon>
				</RailButton>

				<RailButton title="Command" onClick={() => console.log("Command palette")}>
					<Icon>
						<path d="M6 8l4 4-4 4" />
						<path d="M12 16h6" />
					</Icon>
				</RailButton>

				<RailButton title="Tasks" onClick={() => console.log("Tasks")}>
					<Icon>
						<path d="M6 7h12" />
						<path d="M6 12h12" />
						<path d="M6 17h12" />
					</Icon>
				</RailButton>

				<div class={railSpacer} />

				<RailButton title="Pin" onClick={() => console.log("Pin")}>
					<Icon>
						<path d="M14 3l7 7-4 1-5 10-2-2 10-5z" />
					</Icon>
				</RailButton>

				<RailButton title="Help" onClick={() => console.log("Help")}>
					<Icon>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" />
						<path d="M12 17h.01" />
					</Icon>
				</RailButton>

				<RailButton title="Settings" onClick={() => console.log("Settings")}>
					<Icon>
						<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
						<path d="M19.4 15a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.3.7a8 8 0 0 0-1.7-1L15 3h-6l-.5 4.1a8 8 0 0 0-1.7 1L4.5 7.4l-2 3.4L4.5 12l-.1 2-2 1.2 2 3.4 2.3-.7a8 8 0 0 0 1.7 1L9 21h6l.5-4.1a8 8 0 0 0 1.7-1l2.3.7 2-3.4z" />
					</Icon>
				</RailButton>
			</div>

			{/* Sidebar */}
			<div class={sidebar}>
				<div class={header}>
					<strong>Notes</strong>
					<div class={headerActions}>
						<button class={tinyBtn} title="New note" onClick={onNewNote}>
							✎
						</button>
						<button class={tinyBtn} title="New folder" onClick={onNewFolder}>
							📁
						</button>
						<button class={tinyBtn} title="Sort" onClick={() => console.log("Sort")}>
							⇅
						</button>
						<button class={tinyBtn} title="Collapse all" onClick={collapseAll}>
							▾
						</button>
					</div>
				</div>

				<div class={sidebarBody}>
					<Show when={!entries.loading} fallback={<p>Loading…</p>}>
						<TreeView
							nodes={treeNodes()}
							openFolders={openFolders()}
							toggleFolder={toggleFolder}
							selectedFile={selectedFile()}
							onOpenFile={openInTab}
							newlyCreatedFile={newlyCreatedFile()}
							pending={pending()}
							pendingName={pendingName()}
							setPendingName={setPendingName}
							commitPending={commitPending}
							cancelPending={cancelPending}
							onRename={onRename}
							onDelete={onDelete}
							activeFolder={activeFolder()}
							draggedFile={draggedFile()}
							setDraggedFile={setDraggedFile}
							dropTarget={dropTarget()}
							setDropTarget={setDropTarget}
							onMove={onMove}
						/>
					</Show>
				</div>

				<div class={resizeHandle} onMouseDown={handleResizeStart} />
			</div>

			{/* Main */}
			<div class={main}>
				{/* Tabs Bar */}
				<Show when={openTabs().length > 0}>
					<div class={tabsBar}>
						<For each={openTabs()}>
							{(filePath) => {
								const fileName = filePath.split('/').pop() || filePath;
								return (
									<div
										class={`${tab} ${selectedFile() === filePath ? tabActive : ""} ${previewTab() === filePath ? tabPreview : ""}`}
										onClick={() => setSelectedFile(filePath)}
										onDblClick={() => {
											if (previewTab() === filePath) {
												setPreviewTab("");
											}
										}}
										title={filePath}
									>
										<span class={tabFileName}>{fileName}</span>
										<div class={tabActions}>
											<Show when={isFileDirty(filePath)}>
												<div class="tab-dirty-dot" style={{
													width: "8px",
													height: "8px",
													"border-radius": "50%",
													background: "#ffffff",
													opacity: "0.9"
												}} title="Unsaved changes" />
											</Show>
											<div
												class={`${tabClose} tab-close-x`}
												style={{ display: isFileDirty(filePath) ? "none" : "flex" }}
												onClick={(e) => closeTab(filePath, e)}
												title="Close"
											>
												×
											</div>
										</div>
									</div>
								);
							}}
						</For>
					</div>
				</Show>

				{/* Markdown Toolbar */}
				<Show when={selectedFile()}>
					<div class={toolbar}>
						<button class={toolBtn} onClick={() => insertMarkdown("**", "**")} title="Bold (Cmd+B)">
							<strong>B</strong>
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("*", "*")} title="Italic (Cmd+I)">
							<em>I</em>
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("~~", "~~")} title="Strikethrough">
							<s>S</s>
						</button>
						<div class={toolSeparator} />
						<button class={toolBtn} onClick={() => insertMarkdown("# ")} title="Heading 1">
							H1
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("## ")} title="Heading 2">
							H2
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("### ")} title="Heading 3">
							H3
						</button>
						<div class={toolSeparator} />
						<button class={toolBtn} onClick={() => insertMarkdown("[", "](url)")} title="Link">
							🔗
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("[[", "]]")} title="Wiki Link (Zettelkasten)">
							[[]]
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("`", "`")} title="Code">
							{"</>"}
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("```\n", "\n```")} title="Code Block">
							{"{ }"}
						</button>
						<div class={toolSeparator} />
						<button class={toolBtn} onClick={() => insertMarkdown("- ")} title="Bullet List">
							•
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("1. ")} title="Numbered List">
							1.
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("- [ ] ")} title="Task List">
							☑
						</button>
						<div class={toolSeparator} />
						<button class={toolBtn} onClick={() => insertMarkdown("> ")} title="Quote">
							"
						</button>
						<button class={toolBtn} onClick={() => insertMarkdown("---\n")} title="Horizontal Rule">
							─
						</button>
						<div class={toolSeparator} />
						<button
							class={toolBtn}
							onClick={() => setViewMode(viewMode() === "edit" ? "preview" : "edit")}
							style={{ "background": viewMode() === "preview" ? "rgba(96, 165, 250, 0.2)" : undefined }}
							title={viewMode() === "edit" ? "Preview" : "Edit"}
						>
							{viewMode() === "edit" ? "👁️" : "✎"}
						</button>
					</div>
				</Show>

				{/* Frontmatter Panel */}
				<Show when={selectedFile() && viewMode() === "edit"}>
					<Show
						when={currentFrontmatter()}
						fallback={
							<div class={frontmatterPanel}>
								<div class={frontmatterHeader}>
									<span>No Metadata</span>
									<button class={frontmatterBtn} onClick={addFrontmatter}>
										+ Add Frontmatter
									</button>
								</div>
							</div>
						}
					>
						<div class={frontmatterPanel}>
							<div class={frontmatterHeader}>
								<span>Metadata</span>
								<div style={{ display: "flex", gap: "8px" }}>
									<button 
										class={frontmatterBtn} 
										onClick={() => setShowFrontmatter(!showFrontmatter())}
									>
										{showFrontmatter() ? "Hide" : "Show"}
									</button>
									<button 
										class={frontmatterBtn}
										onClick={() => {
											if (confirm("Remove all frontmatter metadata?")) {
												removeFrontmatter();
											}
										}}
										style={{ color: "#f87171", "border-color": "rgba(248, 113, 113, 0.3)" }}
									>
										Remove
									</button>
								</div>
							</div>
							<Show when={showFrontmatter()}>
								<div class={frontmatterGrid}>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>Title</label>
										<input
											class={frontmatterInput}
											type="text"
											value={currentFrontmatter()?.title || ""}
											onInput={(e) => updateFrontmatter({ title: e.currentTarget.value })}
											placeholder="Note title"
										/>
									</div>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>Type</label>
										<select
											class={frontmatterSelect}
											value={currentFrontmatter()?.type || "note"}
											onChange={(e) => updateFrontmatter({ type: e.currentTarget.value as any })}
										>
											<option value="note">Note</option>
											<option value="project">Project</option>
											<option value="meeting">Meeting</option>
											<option value="daily">Daily</option>
										</select>
									</div>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>Status</label>
										<select
											class={frontmatterSelect}
											value={currentFrontmatter()?.status || "draft"}
											onChange={(e) => updateFrontmatter({ status: e.currentTarget.value as any })}
										>
											<option value="draft">Draft</option>
											<option value="active">Active</option>
											<option value="done">Done</option>
											<option value="archived">Archived</option>
										</select>
									</div>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>ID</label>
										<input
											class={frontmatterInput}
											type="text"
											value={currentFrontmatter()?.id || ""}
											onInput={(e) => updateFrontmatter({ id: e.currentTarget.value })}
											placeholder="Unique identifier"
										/>
									</div>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>Created</label>
										<input
											class={frontmatterInput}
											type="text"
											value={currentFrontmatter()?.created || ""}
											disabled
											style={{ opacity: 0.6, cursor: "not-allowed" }}
										/>
									</div>
									<div class={frontmatterField}>
										<label class={frontmatterLabel}>Updated</label>
										<input
											class={frontmatterInput}
											type="text"
											value={currentFrontmatter()?.updated || ""}
											disabled
											style={{ opacity: 0.6, cursor: "not-allowed" }}
										/>
									</div>
								</div>
							</Show>
						</div>
					</Show>
				</Show>

				{/* Links & Backlinks Panel */}
				<Show when={selectedFile() && viewMode() === "edit" && currentNoteMetadata()}>
					<div class={linksPanel}>
						{/* Outgoing Links */}
						<Show when={(currentNoteMetadata()?.outgoingLinks.length || 0) > 0}>
							<div class={linksHeader}>
								Links ({currentNoteMetadata()?.outgoingLinks.length || 0})
							</div>
							<div class={linksList}>
								<For each={currentNoteMetadata()?.outgoingLinks || []}>
									{(link) => {
										const targetPath = resolveLinkTarget(link.target, notesIndex);
										const targetNote = targetPath ? notesIndex[targetPath] : null;
										const displayName = targetNote?.title || link.target;
										
										return (
											<div
												class={linkItem}
												onClick={() => {
													if (targetPath) {
														openInTab(targetPath, false);
													}
												}}
												title={targetPath || `Unresolved: ${link.target}`}
												style={{ opacity: targetPath ? 1 : 0.5 }}
											>
												<span class={linkIcon}>→</span>
												<span class={linkText}>{displayName}</span>
											</div>
										);
									}}
								</For>
							</div>
						</Show>

						{/* Backlinks */}
						<Show when={(currentNoteMetadata()?.backlinks.length || 0) > 0}>
							<div class={linksHeader} style={{ "margin-top": (currentNoteMetadata()?.outgoingLinks.length || 0) > 0 ? "12px" : "0" }}>
								Backlinks ({currentNoteMetadata()?.backlinks.length || 0})
							</div>
							<div class={linksList}>
								<For each={currentNoteMetadata()?.backlinks || []}>
									{(backlink) => {
										const backlinkNote = notesIndex[backlink];
										const displayName = backlinkNote?.title || backlink.split('/').pop() || backlink;
										
										return (
											<div
												class={linkItem}
												onClick={() => openInTab(backlink, false)}
												title={backlink}
											>
												<span class={linkIcon}>←</span>
												<span class={linkText}>{displayName}</span>
											</div>
										);
									}}
								</For>
							</div>
						</Show>

						{/* Unlinked Mentions */}
						<Show when={unlinkedMentions().length > 0}>
							<div class={linksHeader} style={{ "margin-top": "12px" }}>
								Unlinked Mentions ({unlinkedMentions().length})
							</div>
							<div class={linksList}>
								<For each={unlinkedMentions()}>
									{(mention) => (
										<div
											class={linkItem}
											onClick={() => openInTab(mention.path, false)}
											title={`Click to open and link\n${mention.context}`}
											style={{ "flex-direction": "column", "align-items": "flex-start" }}
										>
											<div style={{ display: "flex", "align-items": "center", gap: "8px", width: "100%" }}>
												<span class={linkIcon}>⋯</span>
												<span class={linkText}>{mention.title}</span>
											</div>
											<div style={{ 
												"font-size": "11px", 
												color: "#888", 
												"padding-left": "22px",
												overflow: "hidden",
												"text-overflow": "ellipsis",
												"white-space": "nowrap",
												width: "100%"
											}}>
												{mention.context}
											</div>
										</div>
									)}
								</For>
							</div>
						</Show>

						{/* Empty state */}
						<Show when={(currentNoteMetadata()?.outgoingLinks.length || 0) === 0 && (currentNoteMetadata()?.backlinks.length || 0) === 0 && unlinkedMentions().length === 0}>
							<div style={{ color: "#666", "font-size": "12px", "font-style": "italic" }}>
								No links or backlinks yet. Use [[note-id]] or [[note-title]] to link notes.
							</div>
						</Show>
					</div>
				</Show>

				{/* Editor / Preview */}
				<div class={editorWrapper}>
					<Show when={selectedFile()} fallback={<p>Select a note from the sidebar or create a new one.</p>}>
						<Show
							when={viewMode() === "edit"}
							fallback={
								<div class={preview} innerHTML={previewHtml()} />
							}
						>
							<textarea
								class={editor}
								value={draft()}
								onInput={(e) => {
									const newContent = e.currentTarget.value;
									setDraft(newContent);
								}}
								placeholder="Start writing…"
							/>
						</Show>

						{/* Tag Gutter - only show in edit mode */}
						<Show when={viewMode() === "edit"}>
							<div class={tagGutter}>
								<For each={extractTags()}>
									{(tag) => (
										<div 
											class={tagItem}
											onClick={() => jumpToTag(tag)}
											title={`Click to jump to #${tag}`}
										>
											<span>#{tag}</span>
											<span 
												class={tagRemove}
												onClick={(e) => {
													e.stopPropagation();
													if (confirm(`Remove all instances of #${tag}?`)) {
														removeTag(tag);
													}
												}}
												title="Remove tag"
											>
												×
											</span>
										</div>
									)}
								</For>
								
								<Show 
									when={!showTagInput()}
									fallback={
										<input
											type="text"
											value={tagInput()}
											onInput={(e) => setTagInput(e.currentTarget.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													addTag(tagInput());
													setTagInput("");
													setShowTagInput(false);
												}
												if (e.key === "Escape") {
													setTagInput("");
													setShowTagInput(false);
												}
											}}
											onBlur={() => {
												setTagInput("");
												setShowTagInput(false);
											}}
											placeholder="Enter tag name..."
											autofocus
											style={{
												background: "rgba(255, 255, 255, 0.05)",
												border: "1px solid #60a5fa",
												"border-radius": "12px",
												padding: "4px 10px",
												color: "#ffffff",
												outline: "none",
												"font-size": "12px",
												width: "150px"
											}}
										/>
									}
								>
									<div 
										class={tagAddBtn}
										onClick={() => setShowTagInput(true)}
										title="Add new tag"
									>
										<span>+ New tag</span>
									</div>
								</Show>
							</div>
						</Show>
					</Show>
				</div>
			</div>

			{/* Command Palette */}
			<CommandPalette
				isOpen={paletteOpen()}
				onClose={() => setPaletteOpen(false)}
				files={entries() ?? []}
				onOpenFile={openInTab}
				onNewNote={onNewNote}
				onNewFolder={onNewFolder}
				onTogglePreview={() => setViewMode(viewMode() === "edit" ? "preview" : "edit")}
				onCollapseAll={collapseAll}
				notesIndex={notesIndex}
				fileStore={fileStore}
			/>

			{/* Local Graph View */}
			<LocalGraphView
				isOpen={graphOpen()}
				onClose={() => setGraphOpen(false)}
				currentPath={selectedFile()}
				notesIndex={notesIndex}
				onOpenFile={(path) => {
					openInTab(path, false);
					setGraphOpen(false);
				}}
			/>
		</div>
	);
};
