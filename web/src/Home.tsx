import { css } from "@linaria/core";
import { createEffect, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { api, type Entry } from "./server/api";

/* =======================
   Styles
======================= */

const shell = css`
  height: 100vh;
  display: grid;
  grid-template-columns: 56px 320px 1fr;
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

const sidebar = css`
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: #ffffff;
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

const main = css`
  padding: 12px;
  overflow: auto;
  color: #ffffff;
`;

const editor = css`
  width: 100%;
  height: 70vh;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
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
   Icon helpers
======================= */

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
	onSelectFile: (path: string) => void;

	newlyCreatedFile: string;

	pending: PendingCreate;
	pendingName: string;
	setPendingName: (v: string) => void;
	commitPending: () => void;
	cancelPending: () => void;
}) {
	const renderNodes = (nodes: TreeNode[], depth: number) => (
		<For each={nodes}>
			{(n) => (
				<>
					<Show
						when={n.kind === "folder"}
						fallback={
							<div
								class={`${row} ${
									props.newlyCreatedFile === n.path
										? rowNew
										: props.selectedFile === n.path
											? rowActive
											: ""
								}`}
								style={{ "padding-left": `${10 + depth * 14}px` }}
								onClick={() => props.onSelectFile(n.path)}
								title={n.path}
							>
								<span class={caret} />
								{n.name}
							</div>
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

	const [openFolders, setOpenFolders] = createSignal<Set<string>>(new Set());
	const [selectedFile, setSelectedFile] = createSignal<string>("");
	const [newlyCreatedFile, setNewlyCreatedFile] = createSignal<string>("");

	const [draft, setDraft] = createSignal("");
	const [lastHash, setLastHash] = createSignal<string | undefined>(undefined);

	const [pending, setPending] = createSignal<PendingCreate>(null);
	const [pendingName, setPendingName] = createSignal("");

	const [file] = createResource(
		() => selectedFile() || null,
		(p) => {
			if (!p) return null;
			return api.readFile(p);
		}
	);

	createEffect(() => {
		const f = file();
		if (!f) return;
		setDraft(f.content);
		setLastHash(f.sha256);
	});

	const toggleFolder = (p: string) => {
		const next = new Set(openFolders());
		if (next.has(p)) next.delete(p);
		else next.add(p);
		setOpenFolders(next);
	};

	const collapseAll = () => setOpenFolders(new Set<string>());

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

			// Select it and show empty editor
			setSelectedFile(filePath);
			setDraft("");
			setLastHash(undefined);

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

			setSelectedFile(filePath);
			setDraft("");
			setLastHash(undefined);

			setPending(null);
		} catch (e) {
			console.error(e);
		}
	};

	const cancelPending = () => setPending(null);

	const save = async () => {
		const p = selectedFile();
		if (!p) return;
		const res = await api.writeFile(p, { content: draft(), ifMatch: lastHash() });
		setLastHash(res.sha256);
		await refetchTree();
	};

	return (
		<div class={shell}>
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
							onSelectFile={setSelectedFile}
							newlyCreatedFile={newlyCreatedFile()}
							pending={pending()}
							pendingName={pendingName()}
							setPendingName={setPendingName}
							commitPending={commitPending}
							cancelPending={cancelPending}
						/>
					</Show>
				</div>
			</div>

			{/* Main */}
			<div class={main}>
				<Show when={selectedFile() || pending()?.kind === "file"} fallback={<p>Select a note.</p>}>
					<textarea
						class={editor}
						value={draft()}
						onInput={(e) => setDraft(e.currentTarget.value)}
						placeholder="Start writing…"
					/>
					<div style={{ "margin-top": "8px" }}>
						<button onClick={save} disabled={!selectedFile()}>
							Save
						</button>
					</div>
				</Show>
			</div>
		</div>
	);
};
