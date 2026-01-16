import { css } from "@linaria/core";
import { createEffect, createMemo, createResource, createSignal, For, onCleanup, onMount, Show, untrack } from "solid-js";
import { produce } from "solid-js/store";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import yaml from "js-yaml";
import { api, type Entry } from "./server/api";
import { AppProvider, useApp, type FileStoreEntry } from "./context/AppContext";
import { TabBar } from "./components/TabBar";
import { MarkdownToolbar } from "./components/MarkdownToolbar";
import { CommandPalette } from "./components/CommandPalette";

/* =======================
   Styles
======================= */

const shell = css`
  height: 100vh;
  display: grid;
  grid-template-columns: 56px var(--sidebar-width, 320px) 1fr var(--panels-width, 300px);
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

const panelsSidebar = css`
  border-left: 1px solid #e6e6e6;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const panelsHeader = css`
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  background: #ffffff;
`;

const panelTab = css`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  
  &:hover {
    background: #f5f5f5;
    border-color: #60a5fa;
  }
`;

const panelTabActive = css`
  background: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6 !important;
`;

const panelsBody = css`
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
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
	type?: 'note' | 'project' | 'meeting' | 'daily' | 'capture';
	[key: string]: any;
}

interface NoteLink {
	raw: string;        // The full match text
	target: string;     // The link target (id/title/path)
	heading?: string;   // Optional heading anchor (#heading)
	displayText?: string; // Optional display text (for markdown links)
	kind: 'wiki' | 'markdown'; // [[wiki]] or [text](path)
	position: number;   // Character position in the text
}

interface NoteMetadata {
	path: string;
	id?: string;
	title?: string;
	aliases?: string[];
	body?: string; // Note content (optional, might not be loaded)
	links?: NoteLink[]; // Outgoing links from this note
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
	description?: string;
	keybinding?: string;
	run: () => void | Promise<void>;
}

interface PluginPanel {
	id: string;
	title: string;
	icon?: string;
	position?: 'left' | 'right' | 'bottom';
	defaultVisible?: boolean;
	render: (context: PluginPanelContext) => any;
}

interface PluginPanelContext {
	currentFile: string | null;
	notesIndex: Record<string, NoteMetadata>;
	openFile: (path: string) => void;
	createNote: () => void;
}

interface PluginRenderHook {
	// Transform markdown before parsing
	transformMarkdown?: (markdown: string, filePath: string) => string | Promise<string>;
	// Transform parsed HTML
	transformHTML?: (html: string, filePath: string) => string | Promise<string>;
	// Custom syntax patterns
	customSyntax?: {
		pattern: RegExp;
		render: (match: RegExpMatchArray) => string;
	}[];
}

interface PluginMetadataField {
	key: string;
	label: string;
	type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'select';
	options?: string[]; // For select type
	default?: any;
	required?: boolean;
	description?: string;
}

interface PluginSettings {
	fields: PluginMetadataField[];
}

interface PluginHooks {
	// Lifecycle hooks
	onCreateNote?: (filePath: string) => string | Promise<string>; // Return initial content
	onParse?: (content: string, filePath: string) => ParsedNote | Promise<ParsedNote>;
	onSave?: (context: { path: string; content: string; parsed: ParsedNote }) => void | Promise<void>;
	onRename?: (oldPath: string, newPath: string) => void | Promise<void>;
	onDelete?: (path: string) => void | Promise<void>;
	onActivate?: () => void | Promise<void>; // Called when plugin is enabled
	onDeactivate?: () => void | Promise<void>; // Called when plugin is disabled
	
	// Extension points
	commands?: PluginCommand[];
	panels?: PluginPanel[];
	renderHooks?: PluginRenderHook;
	metadataSchema?: PluginMetadataField[];
}

interface Plugin {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	enabled?: boolean;
	hooks: PluginHooks;
	settings?: PluginSettings;
}

/* =======================
   DEEZ Vault Specification
======================= */

/**
 * DEEZ Vault Format v1.0
 * 
 * A canonical specification for distributed, portable vaults.
 */

interface VaultManifest {
	version: string;           // Spec version (e.g., "1.0.0")
	id: string;                // Unique vault ID (UUID or similar)
	name: string;              // Human-readable vault name
	created: string;           // ISO8601 timestamp
	updated: string;           // ISO8601 timestamp
	encryption?: {
		enabled: boolean;
		algorithm: 'AES-256-GCM' | 'none';
		keyDerivation: 'PBKDF2' | 'none';
	};
	plugins?: string[];        // Plugin IDs that should be enabled
	settings?: Record<string, any>; // Vault-specific settings
}

/**
 * Required frontmatter keys for all notes in a DEEZ vault
 */
const REQUIRED_FRONTMATTER_KEYS = ['id', 'created'] as const;

/**
 * Standard frontmatter keys (recommended but not required)
 */
export const STANDARD_FRONTMATTER_KEYS = ['title', 'updated', 'tags', 'aliases', 'status', 'type'] as const;

/**
 * Link resolution order:
 * 1. Exact ID match (frontmatter.id)
 * 2. Exact filename match (without .md)
 * 3. Exact title match (frontmatter.title)
 * 4. Alias match (frontmatter.aliases[])
 */
export type LinkResolutionStrategy = 'id' | 'filename' | 'title' | 'alias';

export interface VaultStructure {
	'.deez/': {
		'manifest.json': VaultManifest;
		'index.json'?: Record<string, NoteMetadata>; // Cached index
		'plugins/'?: Record<string, any>; // Plugin data
	};
	'notes/': Record<string, string>; // All markdown files
	'attachments/'?: Record<string, Blob>; // Media files
}

/**
 * Validates a note's frontmatter against DEEZ spec
 */
export function validateNoteFrontmatter(frontmatter: Frontmatter | null, filePath: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (!frontmatter) {
		errors.push(`${filePath}: Missing frontmatter`);
		return { valid: false, errors };
	}
	
	// Check required keys
	for (const key of REQUIRED_FRONTMATTER_KEYS) {
		if (!frontmatter[key]) {
			errors.push(`${filePath}: Missing required frontmatter key: ${key}`);
		}
	}
	
	// Validate ID format (timestamp-based)
	if (frontmatter.id && !/^\d{14}-[a-z0-9]{3}$/.test(frontmatter.id)) {
		errors.push(`${filePath}: Invalid ID format. Expected YYYYMMDDHHMMSS-xxx`);
	}
	
	// Validate timestamp formats
	if (frontmatter.created && isNaN(Date.parse(frontmatter.created))) {
		errors.push(`${filePath}: Invalid 'created' timestamp`);
	}
	if (frontmatter.updated && isNaN(Date.parse(frontmatter.updated))) {
		errors.push(`${filePath}: Invalid 'updated' timestamp`);
	}
	
	return { valid: errors.length === 0, errors };
}

/**
 * Validates entire vault structure
 */
export function validateVault(entries: Entry[], manifest: VaultManifest | null): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (!manifest) {
		errors.push('Missing .deez/manifest.json');
		return { valid: false, errors };
	}
	
	// Validate manifest
	if (!manifest.version || !manifest.id || !manifest.name) {
		errors.push('Manifest missing required fields: version, id, name');
	}
	
	// Check for duplicate IDs across all notes (requires async file reading)
	// This will be implemented in the import/export phase
	if (entries.length === 0) {
		errors.push('Vault contains no entries');
	}
	
	return { valid: errors.length === 0, errors };
}

/**
 * Creates a default vault manifest
 */
export function createVaultManifest(name: string): VaultManifest {
	return {
		version: '1.0.0',
		id: generateZettelId(), // Reuse ID generator for vault ID
		name,
		created: new Date().toISOString(),
		updated: new Date().toISOString(),
		encryption: {
			enabled: false,
			algorithm: 'none',
			keyDerivation: 'none'
		},
		plugins: ['core.zettelkasten'],
		settings: {}
	};
}

/* =======================
   Vault Export/Import
======================= */

/**
 * Exports entire vault as a zip file
 * Preserves IDs, paths, hashes, and structure
 */
export async function exportVault(
	vaultName: string,
	entries: Entry[],
	api: { readFile: (path: string) => Promise<{ content: string; sha256: string }> },
	notesIndex: Record<string, NoteMetadata>
): Promise<Blob> {
	const JSZip = (await import('jszip')).default;
	const zip = new JSZip();
	
	// Create .deez directory
	const deezDir = zip.folder('.deez')!;
	
	// Create and add manifest
	const manifest = createVaultManifest(vaultName);
	deezDir.file('manifest.json', JSON.stringify(manifest, null, 2));
	
	// Add cached index
	deezDir.file('index.json', JSON.stringify(notesIndex, null, 2));
	
	// Export all files with their content
	for (const entry of entries) {
		if (entry.kind === 'file') {
			try {
				const { content } = await api.readFile(entry.path);
				zip.file(entry.path, content);
			} catch (e) {
				console.error(`Failed to read ${entry.path}:`, e);
			}
		}
	}
	
	// Generate zip blob
	return await zip.generateAsync({ type: 'blob' });
}

/**
 * Imports a vault from a zip file
 * Validates structure and frontmatter before importing
 */
export async function importVault(
	zipBlob: Blob,
	api: {
		createFile: (path: string, content: string) => Promise<any>;
		createFolder: (path: string) => Promise<any>;
	}
): Promise<{ success: boolean; errors: string[]; manifest: VaultManifest | null }> {
	const JSZip = (await import('jszip')).default;
	const errors: string[] = [];
	
	try {
		const zip = await JSZip.loadAsync(zipBlob);
		
		// Read and validate manifest
		const manifestFile = zip.file('.deez/manifest.json');
		if (!manifestFile) {
			errors.push('Missing .deez/manifest.json - not a valid DEEZ vault');
			return { success: false, errors, manifest: null };
		}
		
		const manifestContent = await manifestFile.async('text');
		const manifest: VaultManifest = JSON.parse(manifestContent);
		
		// Validate manifest structure
		if (!manifest.version || !manifest.id || !manifest.name) {
			errors.push('Invalid manifest: missing required fields');
			return { success: false, errors, manifest: null };
		}
		
		// Collect all folders first
		const folders = new Set<string>();
		zip.forEach((relativePath, file) => {
			if (file.dir) {
				folders.add(relativePath.replace(/\/$/, ''));
			} else {
				// Extract parent folders from file paths
				const parts = relativePath.split('/');
				for (let i = 1; i < parts.length; i++) {
					const folderPath = parts.slice(0, i).join('/');
					if (folderPath && !folderPath.startsWith('.deez')) {
						folders.add(folderPath);
					}
				}
			}
		});
		
		// Create folders
		for (const folder of Array.from(folders).sort()) {
			if (!folder.startsWith('.deez')) {
				try {
					await api.createFolder(folder);
				} catch (e) {
					// Folder might already exist, continue
					console.warn(`Folder creation warning for ${folder}:`, e);
				}
			}
		}
		
		// Import all markdown files
		let fileCount = 0;
		const filePromises: Promise<void>[] = [];
		
		zip.forEach((relativePath, file) => {
			if (!file.dir && !relativePath.startsWith('.deez/') && relativePath.endsWith('.md')) {
				filePromises.push(
					(async () => {
						try {
							const content = await file.async('text');
							
							// Validate frontmatter
							const parsed = parseFrontmatter(content);
							const validation = validateNoteFrontmatter(parsed.frontmatter, relativePath);
							
							if (!validation.valid) {
								errors.push(...validation.errors);
								return;
							}
							
							await api.createFile(relativePath, content);
							fileCount++;
						} catch (e) {
							errors.push(`Failed to import ${relativePath}: ${e}`);
						}
					})()
				);
			}
		});
		
		await Promise.all(filePromises);
		
		console.log(`Imported ${fileCount} files from vault: ${manifest.name}`);
		
		return {
			success: errors.length === 0,
			errors,
			manifest
		};
	} catch (e) {
		errors.push(`Failed to read zip file: ${e}`);
		return { success: false, errors, manifest: null };
	}
}

/* =======================
   Remote Store Abstraction
======================= */

/**
 * Remote file metadata
 */
export interface RemoteFileInfo {
	path: string;
	hash: string;
	size: number;
	modified: string; // ISO8601 timestamp
}

/**
 * Remote vault index
 */
export interface RemoteIndex {
	vaultId: string;
	updated: string; // ISO8601 timestamp
	files: RemoteFileInfo[];
}

/**
 * Storage backend interface
 * Implementations: S3, R2, Git, HTTP, WebDAV
 */
export interface RemoteStore {
	// Metadata operations
	name: string;
	
	// Read operations
	getIndex(): Promise<RemoteIndex>;
	readFile(path: string): Promise<{ content: string; hash: string }>;
	fileExists(path: string): Promise<boolean>;
	
	// Write operations (single-writer mode)
	writeFile(path: string, content: string, previousHash?: string): Promise<{ hash: string }>;
	deleteFile(path: string): Promise<void>;
	
	// Batch operations
	uploadFiles(files: Array<{ path: string; content: string }>): Promise<void>;
	downloadFiles(paths: string[]): Promise<Array<{ path: string; content: string; hash: string }>>;
	
	// Sync operations
	pushIndex(index: RemoteIndex): Promise<void>;
}

/**
 * HTTP-based remote store implementation
 * Works with any HTTP server exposing the vault API
 */
export class HttpRemoteStore implements RemoteStore {
	name = 'HTTP';
	private baseUrl: string;
	private authToken?: string;
	
	constructor(baseUrl: string, authToken?: string) {
		this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
		this.authToken = authToken;
	}
	
	private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
		const headers: Record<string, string> = {
			...(options.headers as Record<string, string> || {}),
		};
		
		if (this.authToken) {
			headers['Authorization'] = `Bearer ${this.authToken}`;
		}
		
		const response = await fetch(`${this.baseUrl}${path}`, {
			...options,
			headers
		});
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		return response;
	}
	
	async getIndex(): Promise<RemoteIndex> {
		const response = await this.fetch('/.deez/index.json');
		return await response.json();
	}
	
	async readFile(path: string): Promise<{ content: string; hash: string }> {
		const response = await this.fetch(`/${encodeURIComponent(path)}`);
		const content = await response.text();
		const hash = response.headers.get('ETag') || '';
		return { content, hash };
	}
	
	async fileExists(path: string): Promise<boolean> {
		try {
			await this.fetch(`/${encodeURIComponent(path)}`, { method: 'HEAD' });
			return true;
		} catch {
			return false;
		}
	}
	
	async writeFile(path: string, content: string, previousHash?: string): Promise<{ hash: string }> {
		const headers: HeadersInit = { 'Content-Type': 'text/markdown' };
		if (previousHash) {
			headers['If-Match'] = previousHash;
		}
		
		const response = await this.fetch(`/${encodeURIComponent(path)}`, {
			method: 'PUT',
			headers,
			body: content
		});
		
		const hash = response.headers.get('ETag') || '';
		return { hash };
	}
	
	async deleteFile(path: string): Promise<void> {
		await this.fetch(`/${encodeURIComponent(path)}`, { method: 'DELETE' });
	}
	
	async uploadFiles(files: Array<{ path: string; content: string }>): Promise<void> {
		await Promise.all(files.map(f => this.writeFile(f.path, f.content)));
	}
	
	async downloadFiles(paths: string[]): Promise<Array<{ path: string; content: string; hash: string }>> {
		const results = await Promise.all(
			paths.map(async (path) => {
				const { content, hash } = await this.readFile(path);
				return { path, content, hash };
			})
		);
		return results;
	}
	
	async pushIndex(index: RemoteIndex): Promise<void> {
		await this.fetch('/.deez/index.json', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(index, null, 2)
		});
	}
}

/**
 * In-memory remote store (for testing/demos)
 */
export class MemoryRemoteStore implements RemoteStore {
	name = 'Memory';
	private files = new Map<string, { content: string; hash: string; modified: string }>();
	private index: RemoteIndex = {
		vaultId: 'memory-vault',
		updated: new Date().toISOString(),
		files: []
	};
	
	async getIndex(): Promise<RemoteIndex> {
		return { ...this.index };
	}
	
	async readFile(path: string): Promise<{ content: string; hash: string }> {
		const file = this.files.get(path);
		if (!file) throw new Error(`File not found: ${path}`);
		return { content: file.content, hash: file.hash };
	}
	
	async fileExists(path: string): Promise<boolean> {
		return this.files.has(path);
	}
	
	async writeFile(path: string, content: string, previousHash?: string): Promise<{ hash: string }> {
		const existing = this.files.get(path);
		if (previousHash && existing && existing.hash !== previousHash) {
			throw new Error(`Hash mismatch for ${path}`);
		}
		
		const hash = `hash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const modified = new Date().toISOString();
		
		this.files.set(path, { content, hash, modified });
		this.updateIndex();
		
		return { hash };
	}
	
	async deleteFile(path: string): Promise<void> {
		this.files.delete(path);
		this.updateIndex();
	}
	
	async uploadFiles(files: Array<{ path: string; content: string }>): Promise<void> {
		await Promise.all(files.map(f => this.writeFile(f.path, f.content)));
	}
	
	async downloadFiles(paths: string[]): Promise<Array<{ path: string; content: string; hash: string }>> {
		return paths.map(path => {
			const file = this.files.get(path);
			if (!file) throw new Error(`File not found: ${path}`);
			return { path, content: file.content, hash: file.hash };
		});
	}
	
	async pushIndex(index: RemoteIndex): Promise<void> {
		this.index = { ...index };
	}
	
	private updateIndex(): void {
		this.index.updated = new Date().toISOString();
		this.index.files = Array.from(this.files.entries()).map(([path, file]) => ({
			path,
			hash: file.hash,
			size: file.content.length,
			modified: file.modified
		}));
	}
}

/* =======================
   Sync Operations (Single-Writer)
======================= */

export interface SyncStatus {
	lastSync?: string; // ISO8601 timestamp
	remoteStore?: RemoteStore;
	isSyncing: boolean;
}

export interface SyncResult {
	pulled: string[]; // Files downloaded from remote
	pushed: string[]; // Files uploaded to remote
	conflicts: string[]; // Files with hash conflicts (shouldn't happen in single-writer)
	errors: string[];
}

/**
 * Compare local and remote indexes to determine sync operations
 */
export function computeSyncDiff(
	localFiles: Array<{ path: string; hash: string }>,
	remoteFiles: RemoteFileInfo[]
): {
	toPull: string[]; // Files that exist remotely but not locally, or have different hashes
	toPush: string[]; // Files that exist locally but not remotely, or have different hashes
	conflicts: string[]; // Files that differ on both sides (shouldn't happen in single-writer)
} {
	const localMap = new Map(localFiles.map(f => [f.path, f.hash]));
	const remoteMap = new Map(remoteFiles.map(f => [f.path, f.hash]));
	
	const toPull: string[] = [];
	const toPush: string[] = [];
	const conflicts: string[] = [];
	
	// Check remote files
	for (const [path, remoteHash] of remoteMap) {
		const localHash = localMap.get(path);
		
		if (!localHash) {
			// Remote file doesn't exist locally - pull it
			toPull.push(path);
		} else if (localHash !== remoteHash) {
			// File exists on both sides with different hashes
			// In single-writer mode, this shouldn't happen - but handle it
			conflicts.push(path);
		}
	}
	
	// Check local files
	for (const [path] of localMap) {
		if (!remoteMap.has(path)) {
			// Local file doesn't exist remotely - push it
			toPush.push(path);
		}
	}
	
	return { toPull, toPush, conflicts };
}

/**
 * Pull files from remote store
 */
export async function pullFromRemote(
	remoteStore: RemoteStore,
	localApi: {
		createFile: (path: string, content: string) => Promise<any>;
		writeFile: (path: string, options: { content: string }) => Promise<any>;
		readFile: (path: string) => Promise<{ content: string; sha256: string }>;
	},
	onProgress?: (current: number, total: number, path: string) => void
): Promise<{ pulled: string[]; errors: string[] }> {
	const errors: string[] = [];
	const pulled: string[] = [];
	
	try {
		// Get remote index
		const remoteIndex = await remoteStore.getIndex();
		
		// Get local file list
		const localFiles: Array<{ path: string; hash: string }> = [];
		// Note: In real implementation, we'd need to list local files
		// For now, this is a placeholder that will be filled by the caller
		
		const diff = computeSyncDiff(localFiles, remoteIndex.files);
		
		// Download files that need pulling
		for (let i = 0; i < diff.toPull.length; i++) {
			const path = diff.toPull[i]!;
			try {
				if (onProgress) onProgress(i + 1, diff.toPull.length, path);
				
				const { content } = await remoteStore.readFile(path);
				
				// Check if file exists locally
				try {
					await localApi.readFile(path);
					// File exists - update it
					await localApi.writeFile(path, { content });
				} catch {
					// File doesn't exist - create it
					await localApi.createFile(path, content);
				}
				
				pulled.push(path);
			} catch (e) {
				errors.push(`Failed to pull ${path}: ${e}`);
			}
		}
		
		return { pulled, errors };
	} catch (e) {
		errors.push(`Pull failed: ${e}`);
		return { pulled, errors };
	}
}

/**
 * Push files to remote store
 */
export async function pushToRemote(
	remoteStore: RemoteStore,
	localApi: {
		readFile: (path: string) => Promise<{ content: string; sha256: string }>;
	},
	filesToPush: string[],
	onProgress?: (current: number, total: number, path: string) => void
): Promise<{ pushed: string[]; errors: string[] }> {
	const errors: string[] = [];
	const pushed: string[] = [];
	
	try {
		for (let i = 0; i < filesToPush.length; i++) {
			const path = filesToPush[i]!;
			try {
				if (onProgress) onProgress(i + 1, filesToPush.length, path);
				
				const { content } = await localApi.readFile(path);
				await remoteStore.writeFile(path, content);
				pushed.push(path);
			} catch (e) {
				errors.push(`Failed to push ${path}: ${e}`);
			}
		}
		
		return { pushed, errors };
	} catch (e) {
		errors.push(`Push failed: ${e}`);
		return { pushed, errors };
	}
}

/**
 * Full bidirectional sync (single-writer mode)
 */
export async function syncVault(
	remoteStore: RemoteStore,
	localFiles: Array<{ path: string; hash: string }>,
	localApi: {
		createFile: (path: string, content: string) => Promise<any>;
		writeFile: (path: string, options: { content: string }) => Promise<any>;
		readFile: (path: string) => Promise<{ content: string; sha256: string }>;
	},
	onProgress?: (status: string) => void
): Promise<SyncResult> {
	const result: SyncResult = {
		pulled: [],
		pushed: [],
		conflicts: [],
		errors: []
	};
	
	try {
		// Get remote index
		if (onProgress) onProgress('Fetching remote index...');
		const remoteIndex = await remoteStore.getIndex();
		
		// Compute diff
		const diff = computeSyncDiff(localFiles, remoteIndex.files);
		
		if (diff.conflicts.length > 0) {
			result.conflicts = diff.conflicts;
			result.errors.push(`Found ${diff.conflicts.length} conflicts (unexpected in single-writer mode)`);
		}
		
		// Pull changes
		if (diff.toPull.length > 0) {
			if (onProgress) onProgress(`Pulling ${diff.toPull.length} files...`);
			const pullResult = await pullFromRemote(remoteStore, localApi, (i, total, path) => {
				if (onProgress) onProgress(`Pulling ${i}/${total}: ${path}`);
			});
			result.pulled = pullResult.pulled;
			result.errors.push(...pullResult.errors);
		}
		
		// Push changes
		if (diff.toPush.length > 0) {
			if (onProgress) onProgress(`Pushing ${diff.toPush.length} files...`);
			const pushResult = await pushToRemote(remoteStore, localApi, diff.toPush, (i, total, path) => {
				if (onProgress) onProgress(`Pushing ${i}/${total}: ${path}`);
			});
			result.pushed = pushResult.pushed;
			result.errors.push(...pushResult.errors);
		}
		
		// Update remote index
		if (result.pushed.length > 0 || result.pulled.length > 0) {
			if (onProgress) onProgress('Updating remote index...');
			const updatedIndex: RemoteIndex = {
				vaultId: remoteIndex.vaultId,
				updated: new Date().toISOString(),
				files: localFiles.map(f => ({
					path: f.path,
					hash: f.hash,
					size: 0, // Would need actual size
					modified: new Date().toISOString()
				}))
			};
			await remoteStore.pushIndex(updatedIndex);
		}
		
		if (onProgress) onProgress('Sync complete');
		
		return result;
	} catch (e) {
		result.errors.push(`Sync failed: ${e}`);
		return result;
	}
}

/* =======================
   Conflict Detection & Resolution
======================= */

export interface FileConflict {
	path: string;
	localContent: string;
	localHash: string;
	remoteContent: string;
	remoteHash: string;
	detectedAt: string; // ISO8601 timestamp
}

export type ConflictResolution = 'keep-local' | 'keep-remote' | 'manual';

/**
 * Detect conflicts when a file has diverged on both sides
 */
export async function detectConflict(
	path: string,
	localHash: string,
	remoteHash: string,
	localApi: { readFile: (path: string) => Promise<{ content: string; sha256: string }> },
	remoteStore: RemoteStore
): Promise<FileConflict | null> {
	if (localHash === remoteHash) return null;
	
	try {
		const [local, remote] = await Promise.all([
			localApi.readFile(path),
			remoteStore.readFile(path)
		]);
		
		return {
			path,
			localContent: local.content,
			localHash: local.sha256,
			remoteContent: remote.content,
			remoteHash: remote.hash,
			detectedAt: new Date().toISOString()
		};
	} catch (e) {
		console.error(`Failed to detect conflict for ${path}:`, e);
		return null;
	}
}

/**
 * Save conflict file to disk
 */
export async function saveConflictCopy(
	conflict: FileConflict,
	localApi: { createFile: (path: string, content: string) => Promise<any> }
): Promise<string> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const conflictPath = conflict.path.replace(/\.md$/, `.conflict-${timestamp}.md`);
	
	const conflictContent = `---
conflict_detected: ${conflict.detectedAt}
original_file: ${conflict.path}
local_hash: ${conflict.localHash}
remote_hash: ${conflict.remoteHash}
---

# CONFLICT: ${conflict.path}

This file has diverged on both local and remote.

## Local Version

\`\`\`markdown
${conflict.localContent}
\`\`\`

## Remote Version

\`\`\`markdown
${conflict.remoteContent}
\`\`\`

---
Choose one version or manually merge, then delete this conflict file.
`;
	
	await localApi.createFile(conflictPath, conflictContent);
	return conflictPath;
}

/**
 * Resolve a conflict by choosing a version
 */
export async function resolveConflict(
	conflict: FileConflict,
	resolution: ConflictResolution,
	localApi: {
		writeFile: (path: string, options: { content: string; ifMatch?: string }) => Promise<any>;
	},
	remoteStore?: RemoteStore
): Promise<void> {
	switch (resolution) {
		case 'keep-local':
			// Local wins - push to remote
			if (remoteStore) {
				await remoteStore.writeFile(conflict.path, conflict.localContent, conflict.remoteHash);
			}
			break;
			
		case 'keep-remote':
			// Remote wins - overwrite local
			await localApi.writeFile(conflict.path, {
				content: conflict.remoteContent,
				ifMatch: conflict.localHash
			});
			break;
			
		case 'manual':
			// User will manually merge - save conflict file
			// Resolution happens when user edits and saves
			break;
	}
}

/* =======================
   Offline-First Operation Log
======================= */

export type OperationType = 'create' | 'write' | 'rename' | 'move' | 'delete';

export interface Operation {
	id: string; // Unique operation ID
	type: OperationType;
	timestamp: string; // ISO8601
	path: string;
	data?: {
		content?: string;
		oldPath?: string; // For rename/move
		newPath?: string;
		hash?: string;
	};
	synced: boolean; // Whether this op has been pushed to remote
}

export interface OperationLog {
	operations: Operation[];
	lastSync?: string; // ISO8601 timestamp of last sync
}

/**
 * Append-only operation log
 * Persisted to localStorage for offline resilience
 */
export class VaultOperationLog {
	private static readonly STORAGE_KEY = 'deez_operation_log';
	private log: OperationLog;
	
	constructor() {
		this.log = this.load();
	}
	
	private load(): OperationLog {
		try {
			const stored = localStorage.getItem(VaultOperationLog.STORAGE_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to load operation log:', e);
		}
		
		return { operations: [] };
	}
	
	private save(): void {
		try {
			localStorage.setItem(
				VaultOperationLog.STORAGE_KEY,
				JSON.stringify(this.log)
			);
		} catch (e) {
			console.error('Failed to save operation log:', e);
		}
	}
	
	/**
	 * Append a new operation to the log
	 */
	append(type: OperationType, path: string, data?: Operation['data']): Operation {
		const op: Operation = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
			type,
			timestamp: new Date().toISOString(),
			path,
			data,
			synced: false
		};
		
		this.log.operations.push(op);
		this.save();
		
		return op;
	}
	
	/**
	 * Get all unsynced operations
	 */
	getUnsynced(): Operation[] {
		return this.log.operations.filter(op => !op.synced);
	}
	
	/**
	 * Mark operations as synced
	 */
	markSynced(operationIds: string[]): void {
		const idSet = new Set(operationIds);
		for (const op of this.log.operations) {
			if (idSet.has(op.id)) {
				op.synced = true;
			}
		}
		this.save();
	}
	
	/**
	 * Get all operations (for debugging/review)
	 */
	getAll(): Operation[] {
		return [...this.log.operations];
	}
	
	/**
	 * Prune old synced operations to prevent log from growing unbounded
	 */
	prune(olderThan: Date): void {
		const cutoff = olderThan.toISOString();
		this.log.operations = this.log.operations.filter(
			op => !op.synced || op.timestamp > cutoff
		);
		this.save();
	}
	
	/**
	 * Clear the entire log (dangerous!)
	 */
	clear(): void {
		this.log = { operations: [] };
		this.save();
	}
	
	/**
	 * Replay operations to reconstruct vault state
	 */
	async replay(
		api: {
			createFile: (path: string, content: string) => Promise<any>;
			writeFile: (path: string, options: { content: string }) => Promise<any>;
			rename: (oldPath: string, newPath: string) => Promise<void>;
			deleteFile: (path: string) => Promise<void>;
		},
		onProgress?: (current: number, total: number, op: Operation) => void
	): Promise<{ success: number; errors: string[] }> {
		const errors: string[] = [];
		let success = 0;
		
		const ops = this.getUnsynced();
		
		for (let i = 0; i < ops.length; i++) {
			const op = ops[i]!;
			
			if (onProgress) onProgress(i + 1, ops.length, op);
			
			try {
				switch (op.type) {
					case 'create':
						if (op.data?.content) {
							await api.createFile(op.path, op.data.content);
						}
						break;
						
					case 'write':
						if (op.data?.content) {
							await api.writeFile(op.path, { content: op.data.content });
						}
						break;
						
					case 'rename':
					case 'move':
						if (op.data?.oldPath && op.data?.newPath) {
							await api.rename(op.data.oldPath, op.data.newPath);
						}
						break;
						
					case 'delete':
						await api.deleteFile(op.path);
						break;
				}
				
				success++;
			} catch (e) {
				errors.push(`Failed to replay ${op.type} ${op.path}: ${e}`);
			}
		}
		
		return { success, errors };
	}
}

/* =======================
   Embeddable Widget Interface
======================= */

/**
 * Minimal file provider interface for embeddable mode
 * Allows hosting applications to provide custom storage backends
 */
export interface FileProvider {
	// Read operations
	listFiles(): Promise<Entry[]>;
	readFile(path: string): Promise<{ content: string; sha256: string }>;
	
	// Write operations
	createFile(path: string, content: string): Promise<{ sha256: string }>;
	writeFile(path: string, options: { content: string; ifMatch?: string }): Promise<{ sha256: string }>;
	deleteFile(path: string): Promise<void>;
	
	// Directory operations
	createFolder(path: string): Promise<void>;
	deleteFolder(path: string): Promise<void>;
	rename(oldPath: string, newPath: string): Promise<void>;
	
	// Optional: Tree view for performance
	listTree?(): Promise<Entry[]>;
}

/**
 * Embeddable widget configuration
 */
export interface DeezConfig {
	// File provider (required)
	provider: FileProvider;
	
	// Theme customization
	theme?: {
		primaryColor?: string;
		backgroundColor?: string;
		textColor?: string;
		borderColor?: string;
	};
	
	// Initial state
	initialRoute?: string; // Initial file to open
	initialFolder?: string; // Initial folder to expand
	
	// Feature flags
	features?: {
		zettelkasten?: boolean;
		encryption?: boolean;
		sync?: boolean;
		graph?: boolean;
		search?: boolean;
	};
	
	// Plugins to load
	plugins?: Plugin[];
	
	// Remote sync (optional)
	remoteStore?: RemoteStore;
	
	// Callbacks
	onFileOpen?: (path: string) => void;
	onFileSave?: (path: string, content: string) => void;
	onFileDelete?: (path: string) => void;
}

/**
 * Create embeddable DEEZ instance
 * 
 * Example usage:
 * ```tsx
 * const myProvider: FileProvider = {
 *   listFiles: async () => [...],
 *   readFile: async (path) => ({ content: '...', sha256: '...' }),
 *   createFile: async (path, content) => ({ sha256: '...' }),
 *   // ... implement other methods
 * };
 * 
 * // In your host application:
 * import { createDeezWidget } from 'deez';
 * 
 * const widget = createDeezWidget({
 *   provider: myProvider,
 *   theme: { primaryColor: '#007acc' },
 *   initialRoute: "README.md",
 *   features: { zettelkasten: true, graph: true }
 * });
 * 
 * // Mount widget to DOM
 * widget.mount(document.getElementById('deez-container'));
 * ```
 */
export interface DeezWidget {
	mount(container: HTMLElement): void;
	unmount(): void;
	openFile(path: string): void;
	saveFile(path: string, content: string): Promise<void>;
	getState(): { currentFile: string | null; openFiles: string[] };
}

/**
 * Factory function to create embeddable widget (to be implemented)
 * This is the public API for embedding DEEZ into other applications
 */
export function createDeezWidget(_config: DeezConfig): DeezWidget {
	throw new Error('Widget mode not yet implemented - use <Home /> component directly for now');
}

/**
 * Props for the Home component (now supports custom configuration)
 */
interface HomeProps {
	apiOverride?: typeof api;
	config?: DeezConfig;
}

/* =======================
   VaultProvider Implementations
======================= */

/**
 * LocalStorage-based vault provider (for demos/testing)
 */
export class LocalStorageProvider implements FileProvider {
	private prefix = 'deez_vault_';
	
	async listFiles(): Promise<Entry[]> {
		const entries: Entry[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(this.prefix)) {
				const path = key.slice(this.prefix.length);
				entries.push({ kind: 'file', path, name: path.split('/').pop() || path, size: 0, mtime: new Date().toISOString() });
			}
		}
		return entries;
	}
	
	async readFile(path: string): Promise<{ content: string; sha256: string }> {
		const content = localStorage.getItem(this.prefix + path);
		if (!content) throw new Error(`File not found: ${path}`);
		const hash = `hash-${Date.now()}`;
		return { content, sha256: hash };
	}
	
	async createFile(path: string, content: string): Promise<{ sha256: string }> {
		localStorage.setItem(this.prefix + path, content);
		return { sha256: `hash-${Date.now()}` };
	}
	
	async writeFile(path: string, options: { content: string }): Promise<{ sha256: string }> {
		localStorage.setItem(this.prefix + path, options.content);
		return { sha256: `hash-${Date.now()}` };
	}
	
	async deleteFile(path: string): Promise<void> {
		localStorage.removeItem(this.prefix + path);
	}
	
	async createFolder(_path: string): Promise<void> {
		// LocalStorage doesn't have folders
	}
	
	async deleteFolder(_path: string): Promise<void> {
		// LocalStorage doesn't have folders
	}
	
	async rename(oldPath: string, newPath: string): Promise<void> {
		const content = localStorage.getItem(this.prefix + oldPath);
		if (content) {
			localStorage.setItem(this.prefix + newPath, content);
			localStorage.removeItem(this.prefix + oldPath);
		}
	}
	
	async listTree(): Promise<Entry[]> {
		return this.listFiles();
	}
}

/**
 * IndexedDB-based vault provider (for offline-first web apps)
 */
export class IndexedDBProvider implements FileProvider {
	private dbName = 'deez_vault';
	private storeName = 'files';
	private db: IDBDatabase | null = null;
	
	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);
			
			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};
			
			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName, { keyPath: 'path' });
				}
			};
		});
	}
	
	private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
		if (!this.db) await this.init();
		const tx = this.db!.transaction(this.storeName, mode);
		return tx.objectStore(this.storeName);
	}
	
	async listFiles(): Promise<Entry[]> {
		const store = await this.getStore('readonly');
		return new Promise((resolve, reject) => {
			const request = store.getAll();
			request.onsuccess = () => {
				const files = request.result.map((f: any) => ({
					kind: 'file' as const,
					path: f.path,
					name: f.path.split('/').pop() || f.path,
					size: f.content?.length || 0,
					mtime: new Date().toISOString()
				}));
				resolve(files);
			};
			request.onerror = () => reject(request.error);
		});
	}
	
	async readFile(path: string): Promise<{ content: string; sha256: string }> {
		const store = await this.getStore('readonly');
		return new Promise((resolve, reject) => {
			const request = store.get(path);
			request.onsuccess = () => {
				const file = request.result;
				if (!file) reject(new Error(`File not found: ${path}`));
				else resolve({ content: file.content, sha256: file.hash || `hash-${Date.now()}` });
			};
			request.onerror = () => reject(request.error);
		});
	}
	
	async createFile(path: string, content: string): Promise<{ sha256: string }> {
		const hash = `hash-${Date.now()}`;
		const store = await this.getStore('readwrite');
		return new Promise((resolve, reject) => {
			const request = store.put({ path, content, hash });
			request.onsuccess = () => resolve({ sha256: hash });
			request.onerror = () => reject(request.error);
		});
	}
	
	async writeFile(path: string, options: { content: string }): Promise<{ sha256: string }> {
		return this.createFile(path, options.content);
	}
	
	async deleteFile(path: string): Promise<void> {
		const store = await this.getStore('readwrite');
		return new Promise((resolve, reject) => {
			const request = store.delete(path);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
	
	async createFolder(_path: string): Promise<void> {
		// IndexedDB doesn't have folders
	}
	
	async deleteFolder(_path: string): Promise<void> {
		// IndexedDB doesn't have folders
	}
	
	async rename(oldPath: string, newPath: string): Promise<void> {
		const file = await this.readFile(oldPath);
		await this.createFile(newPath, file.content);
		await this.deleteFile(oldPath);
	}
	
	async listTree(): Promise<Entry[]> {
		return this.listFiles();
	}
}

/* =======================
   Vault Encryption
======================= */

export interface VaultKey {
	keyData: Uint8Array;
	salt: Uint8Array;
	algorithm: 'AES-GCM';
}

/**
 * Encryption utilities using Web Crypto API
 */
export class VaultEncryption {
	private static readonly PBKDF2_ITERATIONS = 100000;
	private static readonly KEY_LENGTH = 256;
	private static readonly SALT_LENGTH = 16;
	private static readonly IV_LENGTH = 12;
	
	/**
	 * Derive encryption key from password
	 */
	static async deriveKey(password: string, salt?: Uint8Array): Promise<VaultKey> {
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);
		
		// Generate or use provided salt
		const keySalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
		
		// Import password as key material
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			passwordBuffer,
			'PBKDF2',
			false,
			['deriveBits', 'deriveKey']
		);
		
		// Derive AES-GCM key
		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: keySalt.buffer as ArrayBuffer,
				iterations: this.PBKDF2_ITERATIONS,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: this.KEY_LENGTH },
			true,
			['encrypt', 'decrypt']
		);
		
		// Export key data
		const keyData = new Uint8Array(await crypto.subtle.exportKey('raw', key));
		
		return {
			keyData,
			salt: keySalt,
			algorithm: 'AES-GCM'
		};
	}
	
	/**
	 * Encrypt content with vault key
	 */
	static async encrypt(content: string, vaultKey: VaultKey): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(content);
		
		// Generate random IV
		const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
		
		// Import key
		const key = await crypto.subtle.importKey(
			'raw',
			vaultKey.keyData.buffer as ArrayBuffer,
			'AES-GCM',
			false,
			['encrypt']
		);
		
		// Encrypt
		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv },
			key,
			data
		);
		
		// Combine IV + encrypted data
		const combined = new Uint8Array(iv.length + encrypted.byteLength);
		combined.set(iv, 0);
		combined.set(new Uint8Array(encrypted), iv.length);
		
		// Return as base64
		return btoa(String.fromCharCode(...combined));
	}
	
	/**
	 * Decrypt content with vault key
	 */
	static async decrypt(encryptedBase64: string, vaultKey: VaultKey): Promise<string> {
		// Decode base64
		const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
		
		// Extract IV and encrypted data
		const iv = combined.slice(0, this.IV_LENGTH);
		const encrypted = combined.slice(this.IV_LENGTH);
		
		// Import key
		const key = await crypto.subtle.importKey(
			'raw',
			vaultKey.keyData.buffer as ArrayBuffer,
			'AES-GCM',
			false,
			['decrypt']
		);
		
		// Decrypt
		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv },
			key,
			encrypted
		);
		
		// Decode as UTF-8
		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	}
	
	/**
	 * Serialize vault key for storage
	 */
	static serializeKey(vaultKey: VaultKey): string {
		const combined = new Uint8Array(vaultKey.salt.length + vaultKey.keyData.length);
		combined.set(vaultKey.salt, 0);
		combined.set(vaultKey.keyData, vaultKey.salt.length);
		return btoa(String.fromCharCode(...combined));
	}
	
	/**
	 * Deserialize vault key from storage
	 */
	static deserializeKey(serialized: string): VaultKey {
		const combined = Uint8Array.from(atob(serialized), c => c.charCodeAt(0));
		const salt = combined.slice(0, this.SALT_LENGTH);
		const keyData = combined.slice(this.SALT_LENGTH);
		
		return {
			keyData,
			salt,
			algorithm: 'AES-GCM'
		};
	}
}

/**
 * Encrypted vault state manager
 */
export class EncryptedVault {
	private key: VaultKey | null = null;
	private locked = true;
	
	/**
	 * Unlock vault with password
	 */
	async unlock(password: string, salt?: Uint8Array): Promise<boolean> {
		try {
			this.key = await VaultEncryption.deriveKey(password, salt);
			this.locked = false;
			return true;
		} catch (e) {
			console.error('Failed to unlock vault:', e);
			return false;
		}
	}
	
	/**
	 * Lock vault (clear key from memory)
	 */
	lock(): void {
		this.key = null;
		this.locked = true;
	}
	
	/**
	 * Check if vault is locked
	 */
	isLocked(): boolean {
		return this.locked;
	}
	
	/**
	 * Encrypt file content
	 */
	async encryptFile(_path: string, content: string): Promise<string> {
		if (!this.key) throw new Error('Vault is locked');
		return await VaultEncryption.encrypt(content, this.key);
	}
	
	/**
	 * Decrypt file content
	 */
	async decryptFile(_path: string, encryptedContent: string): Promise<string> {
		if (!this.key) throw new Error('Vault is locked');
		return await VaultEncryption.decrypt(encryptedContent, this.key);
	}
	
	/**
	 * Get vault key for export/storage
	 */
	getKey(): VaultKey | null {
		return this.key;
	}
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
	
	// Extract [[Wiki Links]] with support for:
	// [[target]] - simple link
	// [[target|alias]] - link with custom display text
	// [[target#heading]] - link to heading
	// [[target#heading|alias]] - link to heading with custom display
	const wikiRegex = /\[\[([^\]]+)\]\]/g;
	let match: RegExpExecArray | null;
	
	while ((match = wikiRegex.exec(body)) !== null) {
		const content = match[1];
		
		// Split by | for alias
		const parts = content.split('|');
		const linkPart = parts[0].trim();
		const displayText = parts[1]?.trim();
		
		// Split by # for heading
		const headingParts = linkPart.split('#');
		const target = headingParts[0].trim();
		const heading = headingParts[1]?.trim();
		
		links.push({
			raw: match[0],
			target,
			heading,
			displayText,
			kind: 'wiki',
			position: match.index
		});
	}
	
	// Extract [Markdown](links.md) - only .md files
	// Also support [text](path.md#heading)
	const mdRegex = /\[([^\]]+)\]\(([^)]+\.md(?:#[^)]*)?)\)/g;
	
	while ((match = mdRegex.exec(body)) !== null) {
		const fullPath = match[2];
		const hashIndex = fullPath.indexOf('#');
		const target = hashIndex > 0 ? fullPath.slice(0, hashIndex) : fullPath;
		const heading = hashIndex > 0 ? fullPath.slice(hashIndex + 1) : undefined;
		
		links.push({
			raw: match[0],
			target,
			heading,
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
	description: 'Core note-taking functionality with ID generation and link parsing',
	author: 'DEEZ',
	enabled: true,
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
 * Task Management Plugin
 * Adds task tracking and visualization
 */
const taskPlugin: Plugin = {
	id: 'core.tasks',
	name: 'Task Manager',
	version: '1.0.0',
	description: 'Track and manage tasks across your notes',
	author: 'DEEZ',
	enabled: true,
	hooks: {
		metadataSchema: [
			{
				key: 'due',
				label: 'Due Date',
				type: 'date',
				description: 'When this task is due'
			},
			{
				key: 'priority',
				label: 'Priority',
				type: 'select',
				options: ['low', 'medium', 'high', 'urgent'],
				description: 'Task priority level'
			},
			{
				key: 'project',
				label: 'Project',
				type: 'string',
				description: 'Associated project name'
			}
		],
		
		renderHooks: {
			customSyntax: [
				{
					pattern: /- \[ \] (.+)/g,
					render: (match) => `<input type="checkbox" disabled> ${match[1]}`
				},
				{
					pattern: /- \[x\] (.+)/gi,
					render: (match) => `<input type="checkbox" checked disabled> <s>${match[1]}</s>`
				}
			]
		},
		
		panels: [
			{
				id: 'tasks.overview',
				title: 'Tasks',
				icon: '✓',
				position: 'right',
				defaultVisible: false,
				render: (context: PluginPanelContext) => {
					const tasks: Array<{ path: string; task: string; done: boolean }> = [];
					
					// Extract tasks from all notes
					Object.entries(context.notesIndex).forEach(([path, note]) => {
						if (!note.body) return;
						
						const todoRegex = /- \[ \] (.+)/g;
						const doneRegex = /- \[x\] (.+)/gi;
						
						let match;
						while ((match = todoRegex.exec(note.body)) !== null) {
							tasks.push({ path, task: match[1], done: false });
						}
						while ((match = doneRegex.exec(note.body)) !== null) {
							tasks.push({ path, task: match[1], done: true });
						}
					});
					
					const incompleteTasks = tasks.filter(t => !t.done);
					
					return (
						<div style={{ padding: '1rem' }}>
							<h3 style={{ margin: '0 0 1rem 0', 'font-size': '0.9rem' }}>
								Open Tasks ({incompleteTasks.length})
							</h3>
							{incompleteTasks.length === 0 ? (
								<p style={{ color: '#888', 'font-size': '0.85rem' }}>No open tasks</p>
							) : (
								<div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
									<For each={incompleteTasks.slice(0, 20)}>{(task) => (
										<div 
											style={{ 
												'font-size': '0.85rem',
												padding: '0.5rem',
												background: '#f5f5f5',
												'border-radius': '4px',
												cursor: 'pointer'
											}}
											onClick={() => context.openFile(task.path)}
										>
											<div style={{ 'font-weight': '500' }}>{task.task}</div>
											<div style={{ 'font-size': '0.75rem', color: '#666', 'margin-top': '0.25rem' }}>
												{task.path.split('/').pop()?.replace('.md', '')}
											</div>
										</div>
									)}</For>
								</div>
							)}
						</div>
					);
				}
			}
		],
		
		commands: [
			{
				id: 'tasks.show-all',
				label: 'Show All Tasks',
				icon: '✓',
				description: 'View all tasks across notes',
				run: () => {
					console.log('Show all tasks command');
				}
			}
		]
	}
};

/**
 * Backlinks Plugin
 * Shows incoming links to the current note
 */
const backlinksPlugin: Plugin = {
	id: 'core.backlinks',
	name: 'Backlinks',
	version: '1.0.0',
	description: 'Display incoming links to current note',
	author: 'DEEZ',
	enabled: true,
	hooks: {
		panels: [
			{
				id: 'backlinks.panel',
				title: 'Backlinks',
				icon: '←',
				position: 'right',
				defaultVisible: true,
				render: (context: PluginPanelContext) => {
					if (!context.currentFile) {
						return <div style={{ padding: '1rem', color: '#888', 'font-size': '0.85rem' }}>No file selected</div>;
					}
					
					// Get backlinks from the pre-calculated index
					const currentNote = context.notesIndex[context.currentFile];
					const backlinks: Array<{ path: string; name: string }> = currentNote?.backlinks?.map(path => ({
						path,
						name: path.split('/').pop()?.replace('.md', '') || path
					})) || [];
					
					return (
						<div style={{ padding: '1rem' }}>
							<h3 style={{ margin: '0 0 1rem 0', 'font-size': '0.9rem' }}>
								Linked from ({backlinks.length})
							</h3>
							{backlinks.length === 0 ? (
								<p style={{ color: '#888', 'font-size': '0.85rem' }}>No backlinks</p>
							) : (
								<div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.25rem' }}>
									<For each={backlinks}>{(link) => (
										<div
											style={{
												padding: '0.5rem',
												'font-size': '0.85rem',
												cursor: 'pointer',
												'border-radius': '4px',
												transition: 'background 0.1s'
											}}
											onClick={() => context.openFile(link.path)}
											onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
											onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
										>
											{link.name}
										</div>
									)}</For>
								</div>
							)}
						</div>
					);
				}
			}
		]
	}
};

/**
 * Markdown Enhancements Plugin
 * Adds custom markdown syntax transformations
 */
const markdownEnhancementsPlugin: Plugin = {
	id: 'core.markdown-enhancements',
	name: 'Markdown Enhancements',
	version: '1.0.0',
	description: 'Extended markdown syntax support',
	author: 'DEEZ',
	enabled: true,
	hooks: {
		renderHooks: {
			customSyntax: [
				// Highlight syntax ==text==
				{
					pattern: /==([^=]+)==/g,
					render: (match) => `<mark>${match[1]}</mark>`
				},
				// Callout blocks
				{
					pattern: /> \[!(\w+)\]\s*\n((?:> .+\n?)*)/g,
					render: (match) => {
						const type = match[1].toLowerCase();
						const content = match[2].replace(/^> /gm, '');
						const colors: Record<string, string> = {
							note: '#3b82f6',
							warning: '#f59e0b',
							tip: '#10b981',
							important: '#ef4444',
							info: '#06b6d4'
						};
						const color = colors[type] || '#6b7280';
						return `<div style="border-left: 4px solid ${color}; padding: 0.5rem 1rem; margin: 1rem 0; background: ${color}10; border-radius: 4px;"><strong style="color: ${color}; text-transform: uppercase; font-size: 0.8rem;">${type}</strong><div style="margin-top: 0.5rem;">${content}</div></div>`;
					}
				}
			]
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
		this.register(taskPlugin);
		this.register(backlinksPlugin);
		this.register(markdownEnhancementsPlugin);
	}
	
	async register(plugin: Plugin) {
		this.plugins.set(plugin.id, plugin);
		console.log(`[Plugin] Registered: ${plugin.name} v${plugin.version}`);
		
		// Execute onActivate if plugin is enabled
		if (plugin.enabled !== false && plugin.hooks.onActivate) {
			await plugin.hooks.onActivate();
		}
	}
	
	async unregister(pluginId: string) {
		const plugin = this.plugins.get(pluginId);
		if (plugin?.hooks.onDeactivate) {
			await plugin.hooks.onDeactivate();
		}
		this.plugins.delete(pluginId);
	}
	
	async togglePlugin(pluginId: string, enabled: boolean) {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) return;
		
		plugin.enabled = enabled;
		
		if (enabled && plugin.hooks.onActivate) {
			await plugin.hooks.onActivate();
		} else if (!enabled && plugin.hooks.onDeactivate) {
			await plugin.hooks.onDeactivate();
		}
	}
	
	getAll(): Plugin[] {
		return Array.from(this.plugins.values());
	}
	
	getEnabled(): Plugin[] {
		return Array.from(this.plugins.values()).filter(p => p.enabled !== false);
	}
	
	get(pluginId: string): Plugin | undefined {
		return this.plugins.get(pluginId);
	}
	
	// Execute hooks across all enabled plugins
	async executeOnCreateNote(filePath: string): Promise<string> {
		let content = "";
		for (const plugin of this.getEnabled()) {
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
		
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.onParse) {
				result = await plugin.hooks.onParse(content, filePath);
			}
		}
		
		return result;
	}
	
	async executeOnSave(context: { path: string; content: string; parsed: ParsedNote }) {
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.onSave) {
				await plugin.hooks.onSave(context);
			}
		}
	}
	
	async executeOnRename(oldPath: string, newPath: string) {
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.onRename) {
				await plugin.hooks.onRename(oldPath, newPath);
			}
		}
	}
	
	async executeOnDelete(path: string) {
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.onDelete) {
				await plugin.hooks.onDelete(path);
			}
		}
	}
	
	getAllCommands(): PluginCommand[] {
		const commands: PluginCommand[] = [];
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.commands) {
				commands.push(...plugin.hooks.commands);
			}
		}
		return commands;
	}
	
	getAllPanels(): PluginPanel[] {
		const panels: PluginPanel[] = [];
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.panels) {
				panels.push(...plugin.hooks.panels);
			}
		}
		return panels;
	}
	
	getAllMetadataFields(): PluginMetadataField[] {
		const fields: PluginMetadataField[] = [];
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.metadataSchema) {
				fields.push(...plugin.hooks.metadataSchema);
			}
		}
		return fields;
	}
	
	async transformMarkdown(markdown: string, filePath: string): Promise<string> {
		let result = markdown;
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.renderHooks?.transformMarkdown) {
				result = await plugin.hooks.renderHooks.transformMarkdown(result, filePath);
			}
		}
		return result;
	}
	
	async transformHTML(html: string, filePath: string): Promise<string> {
		let result = html;
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.renderHooks?.transformHTML) {
				result = await plugin.hooks.renderHooks.transformHTML(result, filePath);
			}
		}
		return result;
	}
	
	applyCustomSyntax(markdown: string): string {
		let result = markdown;
		for (const plugin of this.getEnabled()) {
			if (plugin.hooks.renderHooks?.customSyntax) {
				for (const syntax of plugin.hooks.renderHooks.customSyntax) {
					result = result.replace(syntax.pattern, (match, ...args) => {
						const fullMatch = [match, ...args];
						return syntax.render(fullMatch as RegExpMatchArray);
					});
				}
			}
		}
		return result;
	}
}

// Global plugin registry instance
const pluginRegistry = new PluginRegistry();

/* =======================
   Conflict Resolution Dialog
======================= */

const conflictDialog = css`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
`;

const conflictPanel = css`
	background: #1e1e1e;
	border: 1px solid #444;
	border-radius: 6px;
	width: 90%;
	max-width: 1200px;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

const conflictHeader = css`
	padding: 16px 20px;
	border-bottom: 1px solid #444;
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	h3 {
		margin: 0;
		font-size: 16px;
		color: #fff;
	}
`;

const conflictBody = css`
	flex: 1;
	overflow-y: auto;
	padding: 20px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
`;

const conflictVersion = css`
	border: 1px solid #444;
	border-radius: 4px;
	overflow: hidden;
	
	h4 {
		margin: 0;
		padding: 12px;
		background: #2d2d2d;
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		border-bottom: 1px solid #444;
	}
	
	pre {
		margin: 0;
		padding: 16px;
		font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
		font-size: 13px;
		line-height: 1.5;
		color: #d4d4d4;
		background: #1e1e1e;
		overflow-x: auto;
		max-height: 500px;
	}
`;

const conflictActions = css`
	padding: 16px 20px;
	border-top: 1px solid #444;
	display: flex;
	gap: 12px;
	justify-content: flex-end;
`;

const conflictBtn = css`
	padding: 8px 16px;
	border: 1px solid #444;
	border-radius: 4px;
	background: #2d2d2d;
	color: #fff;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.15s;
	
	&:hover {
		background: #3d3d3d;
		border-color: #555;
	}
	
	&.primary {
		background: #0e639c;
		border-color: #0e639c;
		
		&:hover {
			background: #1177bb;
		}
	}
	
	&.danger {
		background: #c72e0f;
		border-color: #c72e0f;
		
		&:hover {
			background: #e03e1f;
		}
	}
`;

export function ConflictResolutionDialog(props: {
	conflict: FileConflict;
	onResolve: (resolution: ConflictResolution) => void;
	onCancel: () => void;
}) {
	return (
		<div class={conflictDialog} onClick={props.onCancel}>
			<div class={conflictPanel} onClick={(e) => e.stopPropagation()}>
				<div class={conflictHeader}>
					<h3>⚠️ Conflict Detected: {props.conflict.path}</h3>
					<button class={conflictBtn} onClick={props.onCancel}>
						✕
					</button>
				</div>
				
				<div class={conflictBody}>
					<div class={conflictVersion}>
						<h4>Local Version (Hash: {props.conflict.localHash.slice(0, 8)})</h4>
						<pre>{props.conflict.localContent}</pre>
					</div>
					
					<div class={conflictVersion}>
						<h4>Remote Version (Hash: {props.conflict.remoteHash.slice(0, 8)})</h4>
						<pre>{props.conflict.remoteContent}</pre>
					</div>
				</div>
				
				<div class={conflictActions}>
					<button 
						class={conflictBtn} 
						onClick={() => props.onResolve('manual')}
					>
						Save Conflict File (Manual Merge)
					</button>
					<button 
						class={`${conflictBtn} danger`}
						onClick={() => props.onResolve('keep-remote')}
					>
						Keep Remote (Overwrite Local)
					</button>
					<button 
						class={`${conflictBtn} primary`}
						onClick={() => props.onResolve('keep-local')}
					>
						Keep Local (Overwrite Remote)
					</button>
				</div>
			</div>
		</div>
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
	fileStore: Record<string, FileStoreEntry>;
	onOpenFile: (path: string) => void;
}) {
	let svgRef: SVGSVGElement | undefined;

	// Filter state
	const [filterTag, setFilterTag] = createSignal<string>("");
	const [filterType, setFilterType] = createSignal<string>("");
	const [filterStatus, setFilterStatus] = createSignal<string>("");
	const [hopDistance, setHopDistance] = createSignal<number>(1); // 1-hop or 2-hop

	// Helper to get frontmatter for a path
	const getFrontmatter = (path: string): Frontmatter | null => {
		const state = props.fileStore[path];
		if (!state) return null;
		const content = state.draftContent || state.savedContent;
		return parseFrontmatter(content).frontmatter;
	};

	// Collect all unique tags, types, statuses from notes
	const availableTags = createMemo(() => {
		const tags = new Set<string>();
		Object.keys(props.notesIndex).forEach(path => {
			const fm = getFrontmatter(path);
			if (fm?.tags) {
				fm.tags.forEach((tag: string) => tags.add(tag));
			}
		});
		return Array.from(tags).sort();
	});

	const availableTypes = createMemo(() => {
		const types = new Set<string>();
		Object.keys(props.notesIndex).forEach(path => {
			const fm = getFrontmatter(path);
			if (fm?.type) types.add(fm.type);
		});
		return Array.from(types).sort();
	});

	const availableStatuses = createMemo(() => {
		const statuses = new Set<string>();
		Object.keys(props.notesIndex).forEach(path => {
			const fm = getFrontmatter(path);
			if (fm?.status) statuses.add(fm.status);
		});
		return Array.from(statuses).sort();
	});

	// Filter predicate for a note path
	const matchesFilter = (path: string): boolean => {
		const tag = filterTag();
		const type = filterType();
		const status = filterStatus();

		const fm = getFrontmatter(path);
		if (!fm) return true; // Include notes without frontmatter

		if (tag && !(fm.tags || []).includes(tag)) return false;
		if (type && fm.type !== type) return false;
		if (status && fm.status !== status) return false;

		return true;
	};

	createEffect(() => {
		if (!props.isOpen || !svgRef || !props.currentPath) return;

		const current = props.notesIndex[props.currentPath];
		if (!current) return;

		const hops = hopDistance();

		// Build graph with hop-based expansion
		const nodes: Array<{id: string; label: string; isCurrent: boolean; distance: number}> = [];
		const links: Array<{source: string; target: string}> = [];
		const visited = new Set<string>();

		// BFS to expand nodes up to N hops
		const queue: Array<{id: string; distance: number}> = [{ id: props.currentPath, distance: 0 }];
		visited.add(props.currentPath);

		while (queue.length > 0) {
			const item = queue.shift()!;
			const note = props.notesIndex[item.id];
			if (!note) continue;

			// Add node if it matches filter (or is the current note)
			if (item.distance === 0 || matchesFilter(item.id)) {
				nodes.push({
					id: item.id,
					label: note.title || item.id.split('/').pop() || '',
					isCurrent: item.distance === 0,
					distance: item.distance
				});
			}

			// Expand neighbors if within hop distance
			if (item.distance < hops) {
				// Outgoing links
				for (const link of note.outgoingLinks) {
					const targetPath = Object.keys(props.notesIndex).find(p => {
						const n = props.notesIndex[p];
						return n.id === link.target || 
							n.title === link.target || 
							p === link.target ||
							(n.aliases || []).includes(link.target);
					});

					if (targetPath && !visited.has(targetPath)) {
						visited.add(targetPath);
						queue.push({ id: targetPath, distance: item.distance + 1 });
						
						// Add link if target passes filter
						if (matchesFilter(targetPath)) {
							links.push({ source: item.id, target: targetPath });
						}
					}
				}

				// Backlinks
				for (const backlink of note.backlinks) {
					if (!visited.has(backlink)) {
						visited.add(backlink);
						queue.push({ id: backlink, distance: item.distance + 1 });

						// Add link if backlink passes filter
						if (matchesFilter(backlink)) {
							links.push({ source: backlink, target: item.id });
						}
					}
				}
			}
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
				const nodeRadius = radius * (1 + node.distance * 0.3); // Further nodes slightly farther out
				positions.set(node.id, {
					x: centerX + nodeRadius * Math.cos(angle),
					y: centerY + nodeRadius * Math.sin(angle)
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
			circle.setAttribute('fill', node.isCurrent ? '#60a5fa' : node.distance === 1 ? '#3c3c3c' : '#2a2a2a');
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
					
					{/* Filters */}
					<div style={{
						display: "flex",
						gap: "8px",
						padding: "8px 12px",
						background: "rgba(0, 0, 0, 0.3)",
						"border-bottom": "1px solid rgba(255, 255, 255, 0.1)",
						"flex-wrap": "wrap",
						"align-items": "center"
					}}>
						<label style={{ "font-size": "12px", color: "#aaa" }}>Filters:</label>
						
						<select 
							value={filterTag()} 
							onChange={(e) => setFilterTag(e.currentTarget.value)}
							style={{
								padding: "4px 8px",
								background: "#1a1a1a",
								border: "1px solid #333",
								"border-radius": "4px",
								color: "#fff",
								"font-size": "12px"
							}}
						>
							<option value="">All Tags</option>
							<For each={availableTags()}>
								{(tag) => <option value={tag}>#{tag}</option>}
							</For>
						</select>

						<select 
							value={filterType()} 
							onChange={(e) => setFilterType(e.currentTarget.value)}
							style={{
								padding: "4px 8px",
								background: "#1a1a1a",
								border: "1px solid #333",
								"border-radius": "4px",
								color: "#fff",
								"font-size": "12px"
							}}
						>
							<option value="">All Types</option>
							<For each={availableTypes()}>
								{(type) => <option value={type}>{type}</option>}
							</For>
						</select>

						<select 
							value={filterStatus()} 
							onChange={(e) => setFilterStatus(e.currentTarget.value)}
							style={{
								padding: "4px 8px",
								background: "#1a1a1a",
								border: "1px solid #333",
								"border-radius": "4px",
								color: "#fff",
								"font-size": "12px"
							}}
						>
							<option value="">All Statuses</option>
							<For each={availableStatuses()}>
								{(status) => <option value={status}>{status}</option>}
							</For>
						</select>

						<label style={{ "font-size": "12px", color: "#aaa", "margin-left": "12px" }}>Distance:</label>
						<select 
							value={hopDistance()} 
							onChange={(e) => setHopDistance(Number(e.currentTarget.value))}
							style={{
								padding: "4px 8px",
								background: "#1a1a1a",
								border: "1px solid #333",
								"border-radius": "4px",
								color: "#fff",
								"font-size": "12px"
							}}
						>
							<option value={1}>1-hop</option>
							<option value={2}>2-hop</option>
						</select>

						<button
							onClick={() => {
								setFilterTag("");
								setFilterType("");
								setFilterStatus("");
								setHopDistance(1);
							}}
							style={{
								padding: "4px 8px",
								background: "#333",
								border: "1px solid #555",
								"border-radius": "4px",
								color: "#fff",
								"font-size": "12px",
								cursor: "pointer",
								"margin-left": "auto"
							}}
						>
							Clear Filters
						</button>
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

export const Home = (props?: HomeProps) => {
	return (
		<AppProvider>
			<HomeInner apiOverride={props?.apiOverride} />
		</AppProvider>
	);
};

const HomeInner = (props?: HomeProps) => {
	// Get all state from context
	const {
		openFolders, setOpenFolders,
		selectedFile, setSelectedFile,
		newlyCreatedFile, setNewlyCreatedFile,
		isSaving, setIsSaving,
		pending, setPending,
		pendingName, setPendingName,
		sidebarWidth, setSidebarWidth,
		viewMode, setViewMode,
		openTabs, setOpenTabs,
		previewTab, setPreviewTab,
		paletteOpen, setPaletteOpen,
		paletteLinkMode, setPaletteLinkMode,
		activeFolder, setActiveFolder,
		draggedFile, setDraggedFile,
		dropTarget, setDropTarget,
		showFrontmatter, setShowFrontmatter,
		graphOpen, setGraphOpen,
		settingsOpen, setSettingsOpen,
		renamePreview, setRenamePreview,
		activePanelId, setActivePanelId,
		panelsWidth,
		notesIndex, setNotesIndex,
		fileStore, setFileStore
	} = useApp();
	
	// Use provided API or default to global api
	const activeApi = props?.apiOverride ?? api;
	
	// IMPORTANT: listTree (not listFiles) so empty folders show
	const [entries, { refetch: refetchTree }] = createResource(activeApi.listTree);

	// stub "zettelkasten plugin enabled" for now
	const [zettelkastenEnabled] = createSignal(true);

	const treeNodes = createMemo(() => buildTreeFromEntries(entries() ?? []));


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

	// Track newly created files to prevent overwriting content from server
	const justCreatedFiles = new Set<string>();

	// Load file content from server and update store
	createEffect(() => {
		const f = file();
		if (!f) return;

		const currentFile = selectedFile();
		if (!currentFile) return;

		console.log('[DEBUG] File loaded from server:', currentFile, 'newlyCreatedFile:', newlyCreatedFile(), 'content length:', f.content.length);

		// Skip overwriting if this file was just created
		// This prevents losing content when opening a newly created file
		if (currentFile === newlyCreatedFile()) {
			console.log('[DEBUG] Skipping overwrite - file is newly created');
			return;
		}

		// Skip if we've marked this file as just created
		if (justCreatedFiles.has(currentFile)) {
			console.log('[DEBUG] Skipping overwrite - file in justCreated set');
			justCreatedFiles.delete(currentFile);
			return;
		}

		// Skip overwriting if the file has unsaved changes (dirty state)
		// This prevents losing edits that haven't been saved yet
		const currentEntry = untrack(() => fileStore[currentFile]);
		if (currentEntry && currentEntry.draftContent !== currentEntry.savedContent) {
			console.log('[DEBUG] Skipping overwrite - file has unsaved changes');
			return;
		}

		console.log('[DEBUG] Overwriting fileStore with server content');
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

	const handleExportVault = async () => {
		try {
			const vaultName = prompt("Vault name:", "deez-vault") || "deez-vault";
			const blob = await exportVault(vaultName, entries() ?? [], api, notesIndex);
			
			// Trigger download
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${vaultName}-${new Date().toISOString().split('T')[0]}.zip`;
			a.click();
			URL.revokeObjectURL(url);
			
			console.log(`Exported vault: ${vaultName}`);
		} catch (e) {
			console.error("Export failed:", e);
			alert(`Export failed: ${e}`);
		}
	};

	const handleImportVault = async () => {
		try {
			// Create file input
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.zip';
			
			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) return;
				
				const confirmed = confirm(
					`Import vault from "${file.name}"?\n\nThis will add all files from the archive to your current vault.`
				);
				if (!confirmed) return;
				
				const result = await importVault(file, api);
				
				if (result.success) {
					alert(`Successfully imported vault: ${result.manifest?.name}\n\nReloading...`);
					await refetchTree();
					triggerIndexRebuild();
				} else {
					alert(`Import completed with errors:\n\n${result.errors.join('\n')}`);
					await refetchTree();
					triggerIndexRebuild();
				}
			};
			
			input.click();
		} catch (e) {
			console.error("Import failed:", e);
			alert(`Import failed: ${e}`);
		}
	};

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
			const result = await api.createFile(filePath, initialContent);
			await refetchTree();

			// Pre-populate fileStore with the content before opening the tab
			setFileStore(produce((store) => {
				store[filePath] = {
					savedContent: initialContent,
					draftContent: initialContent,
					hash: result.sha256 || ""
				};
			}));

			// Mark as newly created and clear after 2 seconds
			setNewlyCreatedFile(filePath);

			// Open in tab (file will be loaded automatically)
			openInTab(filePath);
			if (parentDir) {
				const next = new Set(openFolders());
				next.add(parentDir);
				setOpenFolders(next);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const onNewZettel = async () => {
		const parentDir = currentDir();
		const zettelId = generateZettelId();
		const fileName = `${zettelId}.md`;
		const filePath = joinPath(parentDir, fileName);

		// Prompt for title
		const title = prompt("Zettel title (optional):");
		
		// Prompt for tags
		const tagsInput = prompt("Tags (comma-separated, optional):");
		const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

		// Create frontmatter
		const frontmatter: Record<string, any> = {
			id: zettelId,
			created: new Date().toISOString(),
			type: "note"
		};
		
		if (title) {
			frontmatter.title = title;
		}
		
		if (tags.length > 0) {
			frontmatter.tags = tags;
		}

		const frontmatterStr = serializeFrontmatter(frontmatter, "");
		const initialContent = `${frontmatterStr}\n`;

		try {
			// Execute plugin hooks
			const pluginContent = await pluginRegistry.executeOnCreateNote(filePath);
			const finalContent = pluginContent || initialContent;
			
			// Create the file with initial content
			const result = await api.createFile(filePath, finalContent);
			await refetchTree();

			// Pre-populate fileStore with the content before opening the tab
			setFileStore(produce((store) => {
				store[filePath] = {
					savedContent: finalContent,
					draftContent: finalContent,
					hash: result.sha256 || ""
				};
			}));

			// Mark as newly created and clear after 2 seconds
			setNewlyCreatedFile(filePath);

			// Open in tab (file will be loaded automatically)
			openInTab(filePath);
			if (parentDir) {
				const next = new Set(openFolders());
				next.add(parentDir);
				setOpenFolders(next);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const onNewDailyNote = async () => {
		const parentDir = currentDir();
		
		// Format: YYYY-MM-DD
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		const dateStr = `${yyyy}-${mm}-${dd}`;
		
		const fileName = `${dateStr}.md`;
		const filePath = joinPath(parentDir, fileName);

		// Check if file already exists
		const existingFile = entries()?.find(e => e.path === filePath);
		if (existingFile) {
			// File exists, just open it
			openInTab(filePath);
			if (parentDir) {
				const next = new Set(openFolders());
				next.add(parentDir);
				setOpenFolders(next);
			}
			return;
		}

		// Create frontmatter for daily note
		const frontmatter: Record<string, any> = {
			date: dateStr,
			created: new Date().toISOString(),
			type: "daily-note",
			tags: ["daily"]
		};

		const frontmatterStr = serializeFrontmatter(frontmatter, "");
		
		// Add template sections
		const template = `
## Tasks
- [ ] 

## Notes

## Log

`;
		const initialContent = `${frontmatterStr}${template}`;

		try {
			// Execute plugin hooks
			const pluginContent = await pluginRegistry.executeOnCreateNote(filePath);
			const finalContent = pluginContent || initialContent;
			
			// Create the file with initial content
			const result = await api.createFile(filePath, finalContent);
			await refetchTree();

			// Pre-populate fileStore with the content before opening the tab
			setFileStore(produce((store) => {
				store[filePath] = {
					savedContent: finalContent,
					draftContent: finalContent,
					hash: result.sha256 || ""
				};
			}));

			// Mark as newly created and clear after 2 seconds
			setNewlyCreatedFile(filePath);

			// Open in tab (file will be loaded automatically)
			openInTab(filePath);
			if (parentDir) {
				const next = new Set(openFolders());
				next.add(parentDir);
				setOpenFolders(next);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const onCapture = async () => {
		const inboxDir = "Inbox";
		
		// Ensure Inbox folder exists
		const inboxExists = entries()?.some(e => e.path === inboxDir && e.kind === 'folder');
		if (!inboxExists) {
			try {
				await api.createFolder(inboxDir);
				await refetchTree();
			} catch (e) {
				console.error("Failed to create Inbox folder:", e);
			}
		}

		// Prompt for quick note content
		const content = prompt("Quick capture:");
		if (!content) return;

		// Generate filename
		const zettelId = generateZettelId();
		const fileName = `${zettelId}.md`;
		const filePath = joinPath(inboxDir, fileName);

		// Create minimal frontmatter
		const frontmatter: Record<string, any> = {
			id: zettelId,
			created: new Date().toISOString(),
			type: "capture",
			tags: ["inbox"]
		};

		const frontmatterStr = serializeFrontmatter(frontmatter, "");
		const initialContent = `${frontmatterStr}\n${content}\n`;

		try {
		// Execute plugin hooks
		const pluginContent = await pluginRegistry.executeOnCreateNote(filePath);
		const finalContent = pluginContent || initialContent;
		
		// Create the file with initial content
		const result = await api.createFile(filePath, finalContent);
		await refetchTree();

		// Pre-populate fileStore with the content before opening the tab
		// This prevents the file from appearing empty while server loads
		console.log('[DEBUG] Quick Capture - pre-populating fileStore:', filePath, 'content length:', finalContent.length);
		setFileStore(produce((store) => {
			store[filePath] = {
				savedContent: finalContent,
				draftContent: finalContent,
				hash: result.sha256 || ""
			};
		}));

		// Mark as newly created and clear after 2 seconds
		console.log('[DEBUG] Quick Capture - setting newlyCreatedFile:', filePath);
		setNewlyCreatedFile(filePath);
		// Don't auto-clear - let it persist until file is saved or switched

		// Open in tab (file will be loaded automatically)
		console.log('[DEBUG] Quick Capture - opening in tab:', filePath);
		openInTab(filePath);			// Open the Inbox folder
			const next = new Set(openFolders());
			next.add(inboxDir);
			setOpenFolders(next);
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

			// Clear newly created flag once file is saved
			if (newlyCreatedFile() === p) {
				setNewlyCreatedFile("");
			}

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

	// Programmatic tab close (used when deleting files)
	const closeTabSilently = (filePath: string) => {
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

	const insertLink = (filePath: string) => {
		const file = selectedFile();
		
		if (!file) {
			return;
		}

		// Remove .md extension and get just the filename
		const linkTarget = filePath.replace(/\.md$/, '');
		
		const currentDraft = draft();
		
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		
		if (textarea) {
			// Insert at cursor position if textarea is available
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selectedText = currentDraft.substring(start, end);
			
			// If text is selected, use it as the alias
			const linkText = selectedText ? `[[${linkTarget}|${selectedText}]]` : `[[${linkTarget}]]`;
			const newText = currentDraft.substring(0, start) + linkText + currentDraft.substring(end);

			// Update draft using setDraft helper
			setDraft(newText);

			// Restore cursor position after the link
			setTimeout(() => {
				const newCursorPos = start + linkText.length;
				textarea.selectionStart = newCursorPos;
				textarea.selectionEnd = newCursorPos;
				textarea.focus();
			}, 0);
		} else {
			console.log('Textarea not found, using fallback');
			// Fallback: append to end of content
			const linkText = `[[${linkTarget}]]`;
			const newText = currentDraft + (currentDraft.endsWith('\n') ? '' : '\n') + linkText + '\n';
			setDraft(newText);
		}
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
			setPaletteLinkMode(false);
			setPaletteOpen(true);
			return false;
		}

		// Cmd/Ctrl+K: Link to note
		if (mod && e.key === 'k') {
			e.preventDefault();
			e.stopPropagation();
			setPaletteLinkMode(true);
			setPaletteOpen(true);
			return false;
		}
	};

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown, { capture: true });
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any));
	});

	/**
	 * Find all notes that link to the target and would be affected by renaming it
	 */
	const findAffectedNotes = (targetPath: string): Array<{ path: string; title: string; linkCount: number }> => {
		const affected: Array<{ path: string; title: string; linkCount: number }> = [];
		const targetMeta = notesIndex[targetPath];
		if (!targetMeta) return affected;

		// Find all notes that have links pointing to this note
		for (const path in notesIndex) {
			if (path === targetPath) continue;

			const note = notesIndex[path];
			let linkCount = 0;

			// Count links that resolve to the target
			for (const link of note.outgoingLinks) {
				const resolved = resolveLinkTarget(link.target, notesIndex);
				if (resolved === targetPath) {
					linkCount++;
				}
			}

			if (linkCount > 0) {
				affected.push({
					path,
					title: note.title || path.split('/').pop() || path,
					linkCount
				});
			}
		}

		return affected;
	};

	/**
	 * Update all links in a note's content to point to the new target
	 */
	const updateLinksInContent = (content: string, oldTarget: string, newTarget: string): string => {
		const parsed = parseFrontmatter(content);
		let body = parsed.body;

		// Match wiki links: [[target]], [[target|alias]], [[target#heading]], [[target#heading|alias]]
		const wikiLinkRegex = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

		body = body.replace(wikiLinkRegex, (match, target, heading, alias) => {
			const trimmedTarget = target.trim();
			
			// Check if this link resolves to the old target
			if (trimmedTarget === oldTarget || 
				trimmedTarget === oldTarget.replace(/\.md$/, '') ||
				trimmedTarget.toLowerCase() === oldTarget.toLowerCase()) {
				
				// Rebuild the link with new target
				const newLink = `[[${newTarget}${heading ? '#' + heading : ''}${alias ? '|' + alias : ''}]]`;
				return newLink;
			}

			return match;
		});

		return serializeFrontmatter(parsed.frontmatter ||{}, body);
	};

	/**
	 * Propagate rename across all affected notes
	 */
	const propagateRename = async (oldPath: string, newPath: string) => {
		const oldMeta = notesIndex[oldPath];
		if (!oldMeta) return;

		// Determine what to use as the new link target
		// Prefer ID if available, otherwise use filename without extension
		const oldTarget = oldMeta.id || oldMeta.title || oldPath.replace(/\.md$/, '');
		const newMeta = notesIndex[newPath];
		const newTarget = newMeta?.id || newPath.split('/').pop()!.replace(/\.md$/, '');

		// Find all affected notes
		const affected = findAffectedNotes(oldPath);

		// Update each affected note
		for (const { path } of affected) {
			const state = fileStore[path];
			if (!state) continue;

			const currentContent = state.draftContent || state.savedContent;
			const updatedContent = updateLinksInContent(currentContent, oldTarget, newTarget);

			// Update file store
			setFileStore(produce((store) => {
				if (store[path]) {
					store[path].draftContent = updatedContent;
				} else {
					store[path] = {
						savedContent: currentContent,
						draftContent: updatedContent,
						hash: ''
					};
				}
			}));

			// Auto-save the updated content
			try {
				const res = await api.writeFile(path, {
					content: updatedContent,
					ifMatch: state.hash
				});

				setFileStore(produce((store) => {
					if (store[path]) {
						store[path].savedContent = updatedContent;
						store[path].hash = res.sha256;
					}
				}));
			} catch (e) {
				console.error(`Failed to update links in ${path}:`, e);
			}
		}

		// Rebuild index after all updates
		triggerIndexRebuild();
	};

	const onRename = async (oldPath: string, newName: string) => {
		console.log('onRename called:', { oldPath, newName });

		// Check if this is a markdown file and show preview if links would be affected
		if (oldPath.endsWith('.md')) {
			const affected = findAffectedNotes(oldPath);
			if (affected.length > 0) {
				// Show preview modal
				setRenamePreview({
					oldPath,
					newName,
					affectedNotes: affected
				});
				return; // Wait for user confirmation
			}
		}

		// Execute rename
		await executeRename(oldPath, newName);
	};

	const executeRename = async (oldPath: string, newName: string, updateLinks: boolean = false) => {
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

			// Propagate link updates if requested
			if (updateLinks && oldPath.endsWith('.md')) {
				await propagateRename(oldPath, newPath);
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
				
				// Close the tab if it's open
				if (openTabs().includes(path)) {
					closeTabSilently(path);
				}
			} else {
				await api.deleteFolder(path);
				
				// Close all tabs for files in the deleted folder
				const tabsToClose = openTabs().filter(tab => tab.startsWith(path + "/"));
				for (const tab of tabsToClose) {
					closeTabSilently(tab);
				}
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

	// Rename Preview Modal Component
	const RenamePreviewModal = () => {
		const preview = renamePreview();
		if (!preview) return null;

		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "rgba(0, 0, 0, 0.8)",
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
					"z-index": 10000
				}}
				onClick={() => setRenamePreview(null)}
			>
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						"border-radius": "8px",
						padding: "24px",
						"max-width": "600px",
						width: "90%",
						"max-height": "80vh",
						overflow: "auto"
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<h2 style={{ margin: "0 0 16px 0", "font-size": "18px", color: "#fff" }}>
						Update Links?
					</h2>
					<p style={{ margin: "0 0 16px 0", color: "#aaa", "font-size": "14px" }}>
						Renaming "<strong>{preview.oldPath.split('/').pop()}</strong>" to "<strong>{preview.newName}</strong>" will affect {preview.affectedNotes.length} {preview.affectedNotes.length === 1 ? 'note' : 'notes'}:
					</p>
					<div
						style={{
							background: "#0a0a0a",
							border: "1px solid #222",
							"border-radius": "4px",
							padding: "12px",
							"margin-bottom": "20px",
							"max-height": "300px",
							overflow: "auto"
						}}
					>
						<For each={preview.affectedNotes}>
							{(note) => (
								<div
									style={{
										padding: "8px",
										"border-bottom": "1px solid #222",
										"font-size": "13px"
									}}
								>
									<div style={{ color: "#fff", "margin-bottom": "4px" }}>
										{note.title}
									</div>
									<div style={{ color: "#666", "font-size": "12px" }}>
										{note.linkCount} {note.linkCount === 1 ? 'link' : 'links'} will be updated
									</div>
								</div>
							)}
						</For>
					</div>
					<div style={{ display: "flex", gap: "12px", "justify-content": "flex-end" }}>
						<button
							onClick={() => setRenamePreview(null)}
							style={{
								padding: "8px 16px",
								background: "#333",
								border: "1px solid #555",
								"border-radius": "4px",
								color: "#fff",
								cursor: "pointer",
								"font-size": "14px"
							}}
						>
							Cancel
						</button>
						<button
							onClick={async () => {
								const p = renamePreview();
								if (p) {
									setRenamePreview(null);
									await executeRename(p.oldPath, p.newName, false);
								}
							}}
							style={{
								padding: "8px 16px",
								background: "#444",
								border: "1px solid #666",
								"border-radius": "4px",
								color: "#fff",
								cursor: "pointer",
								"font-size": "14px"
							}}
						>
							Rename Only
						</button>
						<button
							onClick={async () => {
								const p = renamePreview();
								if (p) {
									setRenamePreview(null);
									await executeRename(p.oldPath, p.newName, true);
								}
							}}
							style={{
								padding: "8px 16px",
								background: "#4fa8ff",
								border: "1px solid #60a5fa",
								"border-radius": "4px",
								color: "#fff",
								cursor: "pointer",
								"font-size": "14px"
							}}
						>
							Update Links
						</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div class={shell} style={{ "--sidebar-width": `${sidebarWidth()}px`, "--panels-width": `${panelsWidth()}px` }}>
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

				<RailButton title="Settings" onClick={() => setSettingsOpen(true)}>
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
						<button class={tinyBtn} title="Export vault" onClick={handleExportVault}>
							📦
						</button>
						<button class={tinyBtn} title="Import vault" onClick={handleImportVault}>
							📥
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
				<TabBar onSave={save} />

				{/* Markdown Toolbar */}
				<MarkdownToolbar onInsertMarkdown={insertMarkdown} />

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
										style={{ "flex-direction": "column", "align-items": "flex-start" }}
									>
										<div style={{ display: "flex", "align-items": "center", gap: "8px", width: "100%" }}>
											<span class={linkIcon}>⋯</span>
											<span 
												class={linkText}
												onClick={() => openInTab(mention.path, false)}
												style={{ flex: 1, cursor: "pointer" }}
												title={`Click to open\n${mention.context}`}
											>
												{mention.title}
											</span>
											<button
												onClick={(e) => {
													e.stopPropagation();
													const current = currentNoteMetadata();
													if (!current) return;

													// Get the note to convert the mention in
													const targetContent = fileStore[mention.path]?.draftContent || fileStore[mention.path]?.savedContent;
													if (!targetContent) return;

													const parsed = parseFrontmatter(targetContent);
													if (!parsed.frontmatter) return; // Need frontmatter for safe update

													// Create wiki link using ID (most specific) or title
													const linkTarget = current.id || current.title;
													const wikiLink = `[[${linkTarget}]]`;

													// Find all search terms that could match
													const searchTerms = [
														current.title,
														...(current.aliases || [])
													].filter(Boolean).map(t => t!);

													// Replace first occurrence of any search term
													let newBody = parsed.body;
													let replaced = false;
													for (const term of searchTerms) {
														if (!term) continue;
														// Use word boundary regex for more precise replacement
														const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
														if (regex.test(newBody)) {
															newBody = newBody.replace(regex, wikiLink);
															replaced = true;
															break;
														}
													}

													if (!replaced) return;

													// Update the file content using the proper pattern
													const newContent = serializeFrontmatter(parsed.frontmatter, newBody);
													setFileStore(produce((store) => {
														if (!store[mention.path]) {
															store[mention.path] = {
																savedContent: targetContent,
																draftContent: newContent,
																hash: ""
															};
														} else {
															store[mention.path].draftContent = newContent;
														}
													}));

													// Rebuild index after link conversion
													triggerIndexRebuild();
												}}
												title="Convert to wiki link"
												style={{
													padding: "2px 6px",
													"font-size": "11px",
													background: "rgba(79, 168, 255, 0.15)",
													border: "1px solid rgba(79, 168, 255, 0.3)",
													"border-radius": "4px",
													color: "#4fa8ff",
													cursor: "pointer",
													"font-family": "system-ui, sans-serif"
												}}
											>
												Link
											</button>
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
					</Show>						{/* Empty state */}
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
				onClose={() => {
					setPaletteOpen(false);
					setPaletteLinkMode(false);
				}}
				files={entries() ?? []}
				onOpenFile={openInTab}
				onNewNote={onNewNote}
				onNewZettel={onNewZettel}
				onNewDailyNote={onNewDailyNote}
				onCapture={onCapture}
				onNewFolder={onNewFolder}
				onTogglePreview={() => setViewMode(viewMode() === "edit" ? "preview" : "edit")}
				onCollapseAll={collapseAll}
				notesIndex={notesIndex}
				fileStore={fileStore}
				linkMode={paletteLinkMode()}
				onInsertLink={insertLink}
				pluginCommands={pluginRegistry.getAllCommands()}
				parseFrontmatter={parseFrontmatter}
			/>

			{/* Local Graph View */}
			<LocalGraphView
				isOpen={graphOpen()}
				onClose={() => setGraphOpen(false)}
				currentPath={selectedFile()}
				notesIndex={notesIndex}
				fileStore={fileStore}
				onOpenFile={(path) => {
					openInTab(path, false);
					setGraphOpen(false);
				}}
			/>

			{/* Rename Preview Modal */}
			<RenamePreviewModal />

			{/* Settings Modal */}
			<Show when={settingsOpen()}>
				<div class={graphOverlay} onClick={() => setSettingsOpen(false)}>
					<div class={graphContainer} onClick={(e) => e.stopPropagation()} style={{ width: '600px', height: '500px' }}>
						<div class={graphHeader}>
							<div class={graphTitle}>Settings</div>
							<button class={graphClose} onClick={() => setSettingsOpen(false)}>×</button>
						</div>
						<div style={{ padding: '1.5rem', 'overflow-y': 'auto', height: 'calc(100% - 64px)' }}>
							<h3 style={{ 'margin-top': '0', 'margin-bottom': '1rem', 'font-size': '1rem', color: '#ffffff' }}>
								Plugins
							</h3>
							<div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
								<For each={pluginRegistry.getAll()}>{(plugin) => (
									<div style={{
										padding: '1rem',
										background: '#2d2d30',
										'border-radius': '6px',
										border: '1px solid #3c3c3c'
									}}>
										<div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start', gap: '1rem' }}>
											<div style={{ flex: 1 }}>
												<div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem', 'margin-bottom': '0.5rem' }}>
													<strong style={{ color: '#ffffff', 'font-size': '0.95rem' }}>{plugin.name}</strong>
													<span style={{ 
														'font-size': '0.75rem',
														color: '#888',
														padding: '2px 6px',
														background: '#1e1e1e',
														'border-radius': '3px'
													}}>
														v{plugin.version}
													</span>
												</div>
												{plugin.description && (
													<p style={{ margin: '0', 'font-size': '0.85rem', color: '#aaa' }}>
														{plugin.description}
													</p>
												)}
												{plugin.author && (
													<p style={{ margin: '0.5rem 0 0 0', 'font-size': '0.75rem', color: '#777' }}>
														by {plugin.author}
													</p>
												)}
												<div style={{ 'margin-top': '0.75rem', display: 'flex', 'flex-wrap': 'wrap', gap: '0.5rem', 'font-size': '0.75rem', color: '#888' }}>
													{plugin.hooks.commands && plugin.hooks.commands.length > 0 && (
														<span style={{ padding: '2px 6px', background: '#1e1e1e', 'border-radius': '3px' }}>
															{plugin.hooks.commands.length} {plugin.hooks.commands.length === 1 ? 'command' : 'commands'}
														</span>
													)}
													{plugin.hooks.panels && plugin.hooks.panels.length > 0 && (
														<span style={{ padding: '2px 6px', background: '#1e1e1e', 'border-radius': '3px' }}>
															{plugin.hooks.panels.length} {plugin.hooks.panels.length === 1 ? 'panel' : 'panels'}
														</span>
													)}
													{plugin.hooks.metadataSchema && plugin.hooks.metadataSchema.length > 0 && (
														<span style={{ padding: '2px 6px', background: '#1e1e1e', 'border-radius': '3px' }}>
															{plugin.hooks.metadataSchema.length} metadata {plugin.hooks.metadataSchema.length === 1 ? 'field' : 'fields'}
														</span>
													)}
													{plugin.hooks.renderHooks && (
														<span style={{ padding: '2px 6px', background: '#1e1e1e', 'border-radius': '3px' }}>
															render hooks
														</span>
													)}
												</div>
											</div>
											<label style={{ display: 'flex', 'align-items': 'center', cursor: 'pointer' }}>
												<input
													type="checkbox"
													checked={plugin.enabled !== false}
													onChange={async (e) => {
														await pluginRegistry.togglePlugin(plugin.id, e.currentTarget.checked);
													}}
													style={{
														width: '18px',
														height: '18px',
														cursor: 'pointer',
														'accent-color': '#3b82f6'
													}}
												/>
											</label>
										</div>
									</div>
								)}</For>
							</div>
						</div>
					</div>
				</div>
			</Show>

			{/* Plugin Panels Sidebar */}
			<div class={panelsSidebar}>
				<div class={panelsHeader}>
					{pluginRegistry.getAllPanels().map((panel) => (
						<div
							class={`${panelTab} ${activePanelId() === panel.id ? panelTabActive : ""}`}
							onClick={() => setActivePanelId(activePanelId() === panel.id ? null : panel.id)}
						>
							{panel.icon && <span>{panel.icon}</span>}
							<span>{panel.title}</span>
						</div>
					))}
				</div>
				<div class={panelsBody}>
					{(() => {
						const activePanel = pluginRegistry.getAllPanels().find(p => p.id === activePanelId());
						if (!activePanel) {
							return (
								<div style={{ padding: '2rem', 'text-align': 'center', color: '#888', 'font-size': '0.9rem' }}>
									Select a panel from the tabs above
								</div>
							);
						}
						
						const context: PluginPanelContext = {
							currentFile: selectedFile(),
							notesIndex: notesIndex,
							openFile: (path: string) => openInTab(path, false),
							createNote: () => {
								onNewNote();
							}
						};
						
						return activePanel.render(context);
					})()}
				</div>
			</div>
		</div>
	);
};
