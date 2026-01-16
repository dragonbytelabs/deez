import { For, Show, createSignal, createEffect, createMemo } from "solid-js";
import { css } from "@linaria/core";
import type { Entry } from "../server/api";
import type { NoteMetadata, FileStoreEntry } from "../context/AppContext";

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
	type: "action";
	id: string;
	label: string;
	icon: string;
	onSelect: () => void;
};

type PaletteFile = {
	type: "file";
	path: string;
	name: string;
};

type PaletteItem = PaletteAction | PaletteFile;

export interface CommandPaletteProps {
	isOpen: boolean;
	onClose: () => void;
	files: Entry[];
	onOpenFile: (path: string) => void;
	onNewNote: () => void;
	onNewZettel?: () => void;
	onNewDailyNote?: () => void;
	onCapture?: () => void;
	onNewFolder: () => void;
	onTogglePreview: () => void;
	onCollapseAll: () => void;
	notesIndex?: Record<string, NoteMetadata>;
	fileStore?: Record<string, FileStoreEntry>;
	linkMode?: boolean;
	onInsertLink?: (path: string) => void;
	pluginCommands: Array<{ id: string; label: string; icon?: string; run: () => void | Promise<void> }>;
	parseFrontmatter: (content: string) => { frontmatter: any; body: string };
}

export function CommandPalette(props: CommandPaletteProps) {
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

		// Parse query for special operators
		const parseQuery = (q: string): {
			text: string;
			filters: {
				type?: string;
				status?: string;
				tag?: string;
				hasLinks?: boolean;
				hasBacklinks?: boolean;
				linkTo?: string;
				linkedBy?: string;
			};
		} => {
			const filters: {
				type?: string;
				status?: string;
				tag?: string;
				hasLinks?: boolean;
				hasBacklinks?: boolean;
				linkTo?: string;
				linkedBy?: string;
			} = {};
			let text = q;

			// Extract type: operator
			const typeMatch = q.match(/type:(\S+)/);
			if (typeMatch) {
				filters.type = typeMatch[1].toLowerCase();
				text = text.replace(/type:\S+\s*/g, "").trim();
			}

			// Extract status: operator
			const statusMatch = q.match(/status:(\S+)/);
			if (statusMatch) {
				filters.status = statusMatch[1].toLowerCase();
				text = text.replace(/status:\S+\s*/g, "").trim();
			}

			// Extract tag: operator
			const tagMatch = q.match(/tag:(\S+)/);
			if (tagMatch) {
				filters.tag = tagMatch[1].replace(/^#/, "").toLowerCase();
				text = text.replace(/tag:\S+\s*/g, "").trim();
			}

			// Extract links: operator (notes that have outgoing links)
			if (/links:/.test(q)) {
				filters.hasLinks = true;
				text = text.replace(/links:\s*/g, "").trim();
			}

			// Extract backlinks: operator (notes that have incoming links)
			if (/backlinks:/.test(q)) {
				filters.hasBacklinks = true;
				text = text.replace(/backlinks:\s*/g, "").trim();
			}

			// Extract linkto: operator (notes that link to a specific note)
			const linkToMatch = q.match(/linkto:(\S+)/);
			if (linkToMatch) {
				filters.linkTo = linkToMatch[1].toLowerCase();
				text = text.replace(/linkto:\S+\s*/g, "").trim();
			}

			// Extract linkedby: operator (notes linked by a specific note)
			const linkedByMatch = q.match(/linkedby:(\S+)/);
			if (linkedByMatch) {
				filters.linkedBy = linkedByMatch[1].toLowerCase();
				text = text.replace(/linkedby:\S+\s*/g, "").trim();
			}

			return { text: text.toLowerCase(), filters };
		};

		const { text: searchText, filters } = parseQuery(searchQuery);

		// Check if we have any active filters
		const hasActiveFilters = !!(
			filters.type ||
			filters.status ||
			filters.tag ||
			filters.hasLinks ||
			filters.hasBacklinks ||
			filters.linkTo ||
			filters.linkedBy
		);

		// Actions (always shown at top)
		const actions: PaletteAction[] = [
			{
				type: "action",
				id: "new-note",
				label: "New Note",
				icon: "📝",
				onSelect: () => {
					props.onClose();
					props.onNewNote();
				},
			},
			...(props.onNewZettel
				? [
						{
							type: "action" as const,
							id: "new-zettel",
							label: "New Zettel",
							icon: "🗒",
							onSelect: () => {
								props.onClose();
								props.onNewZettel!();
							},
						},
					]
				: []),
			...(props.onNewDailyNote
				? [
						{
							type: "action" as const,
							id: "daily-note",
							label: "Daily Note",
							icon: "📅",
							onSelect: () => {
								props.onClose();
								props.onNewDailyNote!();
							},
						},
					]
				: []),
			...(props.onCapture
				? [
						{
							type: "action" as const,
							id: "capture",
							label: "Quick Capture",
							icon: "📥",
							onSelect: () => {
								props.onClose();
								props.onCapture!();
							},
						},
					]
				: []),
			{
				type: "action",
				id: "new-folder",
				label: "New Folder",
				icon: "📁",
				onSelect: () => {
					props.onClose();
					props.onNewFolder();
				},
			},
			{
				type: "action",
				id: "toggle-preview",
				label: "Toggle Preview",
				icon: "👁",
				onSelect: () => {
					props.onClose();
					props.onTogglePreview();
				},
			},
			{
				type: "action",
				id: "collapse-all",
				label: "Collapse All Folders",
				icon: "⬆",
				onSelect: () => {
					props.onClose();
					props.onCollapseAll();
				},
			},
			// Add plugin commands
			...props.pluginCommands.map(
				(cmd): PaletteAction => ({
					type: "action",
					id: cmd.id,
					label: cmd.label,
					icon: cmd.icon || "🔌",
					onSelect: () => {
						props.onClose();
						cmd.run();
					},
				})
			),
		];

		// Filter files by query with ranking
		const filesWithScores: PaletteFile[] = props.files
			.filter((e) => e.kind === "file")
			.map((e) => {
				let score = 0;
				let matches = false;

				if (!props.notesIndex || !props.fileStore) {
					// Fallback: simple filename matching
					if (!searchText || e.path.toLowerCase().includes(searchText) || e.name.toLowerCase().includes(searchText)) {
						matches = true;
						score = e.name.toLowerCase().includes(searchText) ? 10 : 5;
					}
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: matches ? score : -1 };
				}

				const noteData = props.notesIndex[e.path];
				const fileData = props.fileStore[e.path];

				// If no search text and no filters, include all files
				if (!searchText && !hasActiveFilters) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: 1 };
				}

				// For files without fileData, we can still search by filename/path
				// but can't apply filters that require frontmatter
				if (!fileData) {
					// If filters are active, exclude files without data
					if (hasActiveFilters) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
					}

					// Otherwise, do basic filename/path search
					if (!searchText) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: 1 };
					}

					if (e.name.toLowerCase() === searchText) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: 100 };
					} else if (e.name.toLowerCase().includes(searchText)) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: 50 };
					} else if (e.path.toLowerCase().includes(searchText)) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: 40 };
					}

					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				const content = fileData.draftContent || fileData.savedContent;
				const parsed = props.parseFrontmatter(content);
				const fm = parsed.frontmatter;

				// Apply filters first
				if (filters.type && fm?.type !== filters.type) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				if (filters.status && fm?.status !== filters.status) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				if (filters.tag && !fm?.tags?.some((t: string) => t.toLowerCase() === filters.tag)) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				if (filters.hasLinks && (!noteData || noteData.outgoingLinks.length === 0)) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				if (filters.hasBacklinks && (!noteData || noteData.backlinks.length === 0)) {
					return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
				}

				if (filters.linkTo && noteData) {
					const linksToTarget = noteData.outgoingLinks.some((link) => {
						const target = link.target.toLowerCase();
						return target === filters.linkTo || target.replace(/\.md$/, "") === filters.linkTo;
					});
					if (!linksToTarget) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
					}
				}

				if (filters.linkedBy && noteData) {
					const linkedByTarget = noteData.backlinks.some((backlink) => {
						const backlinkLower = backlink.toLowerCase();
						return backlinkLower.includes(filters.linkedBy!) || backlinkLower.replace(/\.md$/, "") === filters.linkedBy;
					});
					if (!linkedByTarget) {
						return { file: { type: "file" as const, path: e.path, name: e.name }, score: -1 };
					}
				}

				// If no text query, include all files that passed filters
				if (!searchText) {
					matches = true;
					score = 1;
				} else {
					// Ranked text search
					// Exact filename match (highest priority)
					if (e.name.toLowerCase() === searchText) {
						matches = true;
						score += 100;
					} else if (e.name.toLowerCase().includes(searchText)) {
						matches = true;
						score += 50;
					} else if (e.path.toLowerCase().includes(searchText)) {
						matches = true;
						score += 40;
					}

					// Title match (high priority)
					if (noteData?.title) {
						if (noteData.title.toLowerCase() === searchText) {
							matches = true;
							score += 90;
						} else if (noteData.title.toLowerCase().includes(searchText)) {
							matches = true;
							score += 45;
						}
					}

					// ID match
					if (noteData?.id?.toLowerCase().includes(searchText)) {
						matches = true;
						score += 60;
					}

					// Aliases match
					if (noteData?.aliases?.some((a) => a.toLowerCase().includes(searchText))) {
						matches = true;
						score += 30;
					}

					// Tag match
					if (fm?.tags?.some((t: string) => t.toLowerCase().includes(searchText))) {
						matches = true;
						score += 20;
					}

					// Body content match (lowest priority)
					if (parsed.body.toLowerCase().includes(searchText)) {
						matches = true;
						score += 5;
					}
				}

				return {
					file: { type: "file" as const, path: e.path, name: e.name },
					score: matches ? score : -1,
				};
			})
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.map((item) => item.file);

		// In link mode, only show files (no actions)
		if (props.linkMode) {
			return filesWithScores;
		}

		// If there's a query, show ranked files; otherwise show actions + files
		if (searchQuery) {
			return filesWithScores;
		}
		return [...actions, ...filesWithScores];
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
			element.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		const itemsCount = items().length;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((selectedIndex() + 1) % itemsCount);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((selectedIndex() - 1 + itemsCount) % itemsCount);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const item = items()[selectedIndex()];
			if (item) {
				if (item.type === "action") {
					item.onSelect();
				} else {
					if (props.linkMode && props.onInsertLink) {
						props.onInsertLink(item.path);
						props.onClose();
					} else {
						props.onClose();
						props.onOpenFile(item.path);
					}
				}
			}
		} else if (e.key === "Escape") {
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
						placeholder={props.linkMode ? "Search for a note to link..." : "Type to search files or choose an action..."}
						value={query()}
						onInput={(e) => setQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
					/>
					<Show when={!query() && !props.linkMode}>
						<div
							style={{
								padding: "8px 12px",
								"font-size": "11px",
								color: "#888",
								"border-bottom": "1px solid #333",
							}}
						>
							Query operators: <code>type:</code> <code>status:</code> <code>tag:</code> <code>linkto:</code> <code>linkedby:</code>{" "}
							<code>links:</code> <code>backlinks:</code>
						</div>
					</Show>
					<div class={paletteResults}>
						<Show
							when={items().length > 0}
							fallback={<div class={paletteEmpty}>No results found</div>}
						>
							<For each={items()}>
								{(item, index) => (
									<div
										data-palette-index={index()}
										class={`${paletteItem} ${selectedIndex() === index() ? paletteItemActive : ""}`}
										onClick={() => {
											if (item.type === "action") {
												item.onSelect();
											} else {
												if (props.linkMode && props.onInsertLink) {
													props.onInsertLink(item.path);
													props.onClose();
												} else {
													props.onClose();
													props.onOpenFile(item.path);
												}
											}
										}}
										onMouseEnter={() => setSelectedIndex(index())}
									>
										<span class={paletteItemIcon}>{item.type === "action" ? item.icon : "📄"}</span>
										<span class={paletteItemLabel}>{item.type === "action" ? item.label : item.name}</span>
										<span class={paletteItemKind}>{item.type === "action" ? "action" : item.type === "file" ? "file" : ""}</span>
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
