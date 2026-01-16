import { createContext, useContext, createSignal, type ParentComponent, type Accessor, type Setter } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

/* =======================
   Types
======================= */

export type TreeNode =
	| { kind: "folder"; path: string; name: string; children: TreeNode[] }
	| { kind: "file"; path: string; name: string };

export type CreateKind = "file" | "folder";

export type PendingCreate =
	| null
	| {
		kind: CreateKind;
		parentDir: string; // "" = root
		tempId: string;
	};

export interface Frontmatter {
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

export interface NoteLink {
	raw: string;        // The full match text
	target: string;     // The link target (id/title/path)
	heading?: string;   // Optional heading anchor (#heading)
	displayText?: string; // Optional display text (for markdown links)
	kind: 'wiki' | 'markdown'; // [[wiki]] or [text](path)
	position: number;   // Character position in the text
}

export interface NoteMetadata {
	path: string;
	id?: string;
	title?: string;
	aliases?: string[];
	body?: string; // Note content (optional, might not be loaded)
	links?: NoteLink[]; // Outgoing links from this note
	outgoingLinks: NoteLink[];
	backlinks: string[]; // Paths of notes that link to this one
}

export interface FileStoreEntry {
	draftContent: string;
	savedContent: string;
	hash: string; // SHA256 hash from server
}

export type FileStore = Record<string, FileStoreEntry>;

export interface RenamePreview {
	oldPath: string;
	newName: string;
	affectedNotes: Array<{ path: string; title: string; linkCount: number }>;
}

/* =======================
   Context Type
======================= */

export interface AppContextType {
	// File tree state
	openFolders: Accessor<Set<string>>;
	setOpenFolders: Setter<Set<string>>;
	
	selectedFile: Accessor<string>;
	setSelectedFile: Setter<string>;
	
	newlyCreatedFile: Accessor<string>;
	setNewlyCreatedFile: Setter<string>;
	
	// File operations state
	isSaving: Accessor<boolean>;
	setIsSaving: Setter<boolean>;
	
	pending: Accessor<PendingCreate>;
	setPending: Setter<PendingCreate>;
	
	pendingName: Accessor<string>;
	setPendingName: Setter<string>;
	
	// UI state
	sidebarWidth: Accessor<number>;
	setSidebarWidth: Setter<number>;
	
	viewMode: Accessor<"edit" | "preview">;
	setViewMode: Setter<"edit" | "preview">;
	
	// Tab management
	openTabs: Accessor<string[]>;
	setOpenTabs: Setter<string[]>;
	
	previewTab: Accessor<string>;
	setPreviewTab: Setter<string>;
	
	// Command palette
	paletteOpen: Accessor<boolean>;
	setPaletteOpen: Setter<boolean>;
	
	paletteLinkMode: Accessor<boolean>;
	setPaletteLinkMode: Setter<boolean>;
	
	// File tree context
	activeFolder: Accessor<string>;
	setActiveFolder: Setter<string>;
	
	// Drag and drop
	draggedFile: Accessor<string>;
	setDraggedFile: Setter<string>;
	
	dropTarget: Accessor<string>;
	setDropTarget: Setter<string>;
	
	// Editor state
	showFrontmatter: Accessor<boolean>;
	setShowFrontmatter: Setter<boolean>;
	
	// Modals and views
	graphOpen: Accessor<boolean>;
	setGraphOpen: Setter<boolean>;
	
	settingsOpen: Accessor<boolean>;
	setSettingsOpen: Setter<boolean>;
	
	renamePreview: Accessor<RenamePreview | null>;
	setRenamePreview: Setter<RenamePreview | null>;
	
	// Plugin panels
	activePanelId: Accessor<string | null>;
	setActivePanelId: Setter<string | null>;
	
	panelsWidth: Accessor<number>;
	
	// Notes index (store)
	notesIndex: Record<string, NoteMetadata>;
	setNotesIndex: SetStoreFunction<Record<string, NoteMetadata>>;
	
	// File content store
	fileStore: FileStore;
	setFileStore: SetStoreFunction<FileStore>;
}

/* =======================
   Context Provider
======================= */

const AppContext = createContext<AppContextType>();

export const AppProvider: ParentComponent = (props) => {
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

	// File tree state
	const [openFolders, setOpenFolders] = createSignal<Set<string>>(
		persistedState?.openFolders ? new Set(persistedState.openFolders) : new Set()
	);
	const [selectedFile, setSelectedFile] = createSignal<string>(persistedState?.selectedFile || "");
	const [newlyCreatedFile, setNewlyCreatedFile] = createSignal<string>("");

	// File operations state
	const [isSaving, setIsSaving] = createSignal(false);
	const [pending, setPending] = createSignal<PendingCreate>(null);
	const [pendingName, setPendingName] = createSignal("");

	// UI state
	const [sidebarWidth, setSidebarWidth] = createSignal(persistedState?.sidebarWidth || 320);
	const [viewMode, setViewMode] = createSignal<"edit" | "preview">("edit");

	// Tab management
	const [openTabs, setOpenTabs] = createSignal<string[]>(persistedState?.openTabs || []);
	const [previewTab, setPreviewTab] = createSignal<string>("");

	// Command palette
	const [paletteOpen, setPaletteOpen] = createSignal(false);
	const [paletteLinkMode, setPaletteLinkMode] = createSignal(false);

	// File tree context
	const [activeFolder, setActiveFolder] = createSignal<string>("");

	// Drag and drop
	const [draggedFile, setDraggedFile] = createSignal<string>("");
	const [dropTarget, setDropTarget] = createSignal<string>("");

	// Editor state
	const [showFrontmatter, setShowFrontmatter] = createSignal(true);

	// Modals and views
	const [graphOpen, setGraphOpen] = createSignal(false);
	const [settingsOpen, setSettingsOpen] = createSignal(false);
	const [renamePreview, setRenamePreview] = createSignal<RenamePreview | null>(null);

	// Plugin panels
	const [activePanelId, setActivePanelId] = createSignal<string | null>('backlinks.panel');
	const [panelsWidth] = createSignal(300);

	// Notes index (store)
	const [notesIndex, setNotesIndex] = createStore<Record<string, NoteMetadata>>({});

	// File content store
	const [fileStore, setFileStore] = createStore<FileStore>({});

	const value: AppContextType = {
		// File tree state
		openFolders,
		setOpenFolders,
		selectedFile,
		setSelectedFile,
		newlyCreatedFile,
		setNewlyCreatedFile,
		
		// File operations state
		isSaving,
		setIsSaving,
		pending,
		setPending,
		pendingName,
		setPendingName,
		
		// UI state
		sidebarWidth,
		setSidebarWidth,
		viewMode,
		setViewMode,
		
		// Tab management
		openTabs,
		setOpenTabs,
		previewTab,
		setPreviewTab,
		
		// Command palette
		paletteOpen,
		setPaletteOpen,
		paletteLinkMode,
		setPaletteLinkMode,
		
		// File tree context
		activeFolder,
		setActiveFolder,
		
		// Drag and drop
		draggedFile,
		setDraggedFile,
		dropTarget,
		setDropTarget,
		
		// Editor state
		showFrontmatter,
		setShowFrontmatter,
		
		// Modals and views
		graphOpen,
		setGraphOpen,
		settingsOpen,
		setSettingsOpen,
		renamePreview,
		setRenamePreview,
		
		// Plugin panels
		activePanelId,
		setActivePanelId,
		panelsWidth,
		
		// Notes index
		notesIndex,
		setNotesIndex,
		
		// File content store
		fileStore,
		setFileStore,
	};

	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	);
};

/* =======================
   Hook
======================= */

export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useApp must be used within AppProvider");
	}
	return context;
}
