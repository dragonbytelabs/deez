import { css } from "@linaria/core";
import { createEffect, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { marked } from "marked";
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

const editor = css`
  width: 100%;
  min-height: 100%;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: #ffffff;
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

function joinPath(parent: string, name: string) {
	if (!parent) return name;
	return `${parent.replace(/\/+$/, "")}/${name.replace(/^\/+/, "")}`;
}

function normalizeMarkdownName(name: string) {
	const raw = name.trim();
	if (!raw) return "";
	return raw.toLowerCase().endsWith(".md") ? raw : `${raw}.md`;
}

// Zettelkasten default name (stub for plugin behavior)
function formatZettelDefaultName() {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const yyyy = d.getFullYear();
	const mm = pad(d.getMonth() + 1);
	const dd = pad(d.getDate());
	const hh = pad(d.getHours());
	const mi = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	// Add seconds and a random suffix to prevent collisions
	const rand = Math.random().toString(36).substring(2, 5);
	return `${yyyy}${mm}${dd}${hh}${mi}${ss}-${rand}.md`;
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
}) {
	const [query, setQuery] = createSignal("");
	const [selectedIndex, setSelectedIndex] = createSignal(0);

	// Build combined list of actions + files
	const items = createMemo((): PaletteItem[] => {
		const q = query().toLowerCase();
		
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
			}
		];

		// Filter files by query
		const files: PaletteFile[] = props.files
			.filter(e => e.kind === 'file')
			.filter(e => !q || e.path.toLowerCase().includes(q) || e.name.toLowerCase().includes(q))
			.map(e => ({
				type: 'file' as const,
				path: e.path,
				name: e.name
			}));

		// If there's a query, show only matching files; otherwise show actions + all files
		if (q) {
			return files;
		}
		return [...actions, ...files];
	});

	// Reset selected index when items change
	createEffect(() => {
		items(); // Track dependency
		setSelectedIndex(0);
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
						class={paletteInput}
						type="text"
						placeholder="Type to search files or choose an action..."
						value={query()}
						onInput={(e) => setQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						autofocus
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
	onOpenFile: (path: string) => void;

	newlyCreatedFile: string;

	pending: PendingCreate;
	pendingName: string;
	setPendingName: (v: string) => void;
	commitPending: () => void;
	cancelPending: () => void;

	onRename: (oldPath: string, newName: string) => void;
	onDelete: (path: string, kind: "file" | "folder") => void;
}) {
	const [renamingPath, setRenamingPath] = createSignal<string>("");
	const [renameValue, setRenameValue] = createSignal<string>("");

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
										class={`${row} ${rowWithActions} ${props.newlyCreatedFile === n.path
											? rowNew
											: props.selectedFile === n.path
												? rowActive
												: ""
											}`}
										style={{ "padding-left": `${10 + depth * 14}px`, display: "flex", "justify-content": "space-between" }}
										onClick={() => props.onOpenFile(n.path)}
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
										class={row}
										style={{ "padding-left": `${10 + depth * 14}px` }}
										onClick={() => props.toggleFolder(folder.path)}
										title={folder.path}
									>
										<span class={caret}>{isOpen ? "▾" : ">"}</span>
										<strong>{folder.name}</strong>
									</div>

									<Show when={isPendingHere}>
										<div style={{ "padding-left": `${10 + (depth + 1) * 14}px`, padding: "6px 8px" }}>
											<input
												class={nameInput}
												value={props.pendingName}
												onInput={(e) => props.setPendingName(e.currentTarget.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") props.commitPending();
													if (e.key === "Escape") props.cancelPending();
												}}
												autofocus
											/>
										</div>
									</Show>

									<Show when={isOpen}>{renderNodes(folder.children, depth + 1)}</Show>
								</>
							);
						})()}
					</Show>
				</>
			)}
		</For>
	);

	const showPendingInRoot = props.pending && props.pending.parentDir === "";

	return (
		<>
			<Show when={showPendingInRoot}>
				<div style={{ padding: "8px", background: "rgba(255, 255, 255, 0.08)", "border-radius": "8px", "margin-bottom": "8px" }}>
					<input
						class={nameInput}
						value={props.pendingName}
						onInput={(e) => props.setPendingName(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") props.commitPending();
							if (e.key === "Escape") props.cancelPending();
						}}
						autofocus
						placeholder={props.pending?.kind === "folder" ? "Folder name..." : "Note name..."}
					/>
				</div>
			</Show>

			{renderNodes(props.nodes, 0)}
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

	// Update draft content for current file
	const setDraft = (content: string) => {
		const file = selectedFile();
		if (!file) return;
		
		setFileStore(produce((store) => {
			if (!store[file]) {
				store[file] = { savedContent: "", draftContent: content, hash: "" };
			} else {
				store[file].draftContent = content;
			}
		}));
	};

	// Check if a file has unsaved changes
	const isFileDirty = (filePath: string) => {
		const state = fileStore[filePath];
		if (!state) return false;
		return state.draftContent !== state.savedContent;
	};

	const previewHtml = createMemo(() => {
		if (!selectedFile() || viewMode() !== "preview") return "";
		return marked(draft(), { 
			async: false,
			breaks: true,
			gfm: true
		}) as string;
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
		if (next.has(p)) next.delete(p);
		else next.add(p);
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

	// v1 parent dir: directory of selected file, else root
	const currentDir = () => {
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
			// Create the file immediately
			await api.createFile(filePath, "");
			await refetchTree();

		// Mark as newly created and clear after 2 seconds
		setNewlyCreatedFile(filePath);
		setTimeout(() => setNewlyCreatedFile(""), 2000);

		// Open in tab and initialize store
		openInTab(filePath);
		initializeFile(filePath, "");
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
			const res = await api.writeFile(p, { 
				content: state.draftContent, 
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
		} catch (e) {
			console.error("Save failed:", e);
		} finally {
			setIsSaving(false);
		}
	};

	const openInTab = (filePath: string) => {
		if (!openTabs().includes(filePath)) {
			setOpenTabs([...openTabs(), filePath]);
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

	// Auto-save: DISABLED - manual save only
	// let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
	// createEffect(() => {
	// 	const file = selectedFile();
	// 	if (!file || !isDirty()) return;
	// 	if (autoSaveTimer) clearTimeout(autoSaveTimer);
	// 	autoSaveTimer = setTimeout(() => {
	// 		save();
	// 	}, 800);
	// });

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

	// Keyboard shortcuts
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const mod = isMac ? e.metaKey : e.ctrlKey;

			// Cmd/Ctrl+Shift+N: New folder (check this first before regular N)
			if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
				console.log('Cmd+Shift+N triggered');
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				onNewFolder();
				return false;
			}

			// Cmd/Ctrl+N: New note
			if (mod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
				console.log('Cmd+N triggered');
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				onNewNote();
				return false;
			}

			// Cmd/Ctrl+S: Save
			if (mod && e.key === 's') {
				console.log('Cmd+S triggered');
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

		// Use window instead of document, and capture phase
		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
	});

	const onRename = async (oldPath: string, newName: string) => {
		console.log('onRename called:', { oldPath, newName });
		try {
			const dir = oldPath.lastIndexOf("/") === -1 ? "" : oldPath.slice(0, oldPath.lastIndexOf("/"));
			const newPath = joinPath(dir, newName);

			console.log('Renaming to:', newPath);
			await api.rename(oldPath, newPath);
			await refetchTree();

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
		const confirmMsg = kind === "folder"
			? `Delete folder "${path}" and all its contents?`
			: `Delete file "${path}"?`;

		if (!confirm(confirmMsg)) return;

		try {
			if (kind === "file") {
				await api.deleteFile(path);
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

				<RailButton title="Graph" onClick={() => console.log("Graph")}>
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
										class={`${tab} ${selectedFile() === filePath ? tabActive : ""}`}
										onClick={() => setSelectedFile(filePath)}
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
			/>
		</div>
	);
};
