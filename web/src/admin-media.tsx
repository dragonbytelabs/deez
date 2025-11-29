import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { api, type MediaItem } from "./server/api";

// Allowed MIME types for image uploads - must match backend validation
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
];

const layout = css`
  display: flex;
  height: 100vh;
  flex-direction: column;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const mainContent = css`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  margin-left: 250px;
  
  @media (max-width: 768px) {
    padding: 80px 20px 20px;
    margin-left: 0;
  }
`;

const header = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-top: 8px;
`;

const uploadButton = css`
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: var(--primaryDark);
  }
  
  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const hiddenInput = css`
  display: none;
`;

const mediaGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
`;

const mediaCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const mediaImage = css`
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: var(--gray900);
`;

const mediaInfo = css`
  padding: 12px;
`;

const mediaName = css`
  font-size: 14px;
  color: var(--white);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const mediaSize = css`
  font-size: 12px;
  color: var(--gray500);
  margin-top: 4px;
`;

const mediaActions = css`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const actionButton = css`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
`;

const copyButton = css`
  background: var(--gray700);
  color: var(--white);
  
  &:hover {
    background: var(--gray600);
  }
`;

const deleteButton = css`
  background: #7f1d1d;
  color: white;
  
  &:hover {
    background: #991b1b;
  }
`;

const loading = css`
  text-align: center;
  padding: 40px;
  color: var(--gray500);
  font-size: 18px;
`;

const error = css`
  background: #991b1b;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const success = css`
  background: #166534;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const emptyState = css`
  text-align: center;
  padding: 60px 20px;
  color: var(--gray500);
`;

const emptyStateIcon = css`
  font-size: 48px;
  margin-bottom: 16px;
`;

const emptyStateText = css`
  font-size: 18px;
  margin-bottom: 8px;
`;

const emptyStateSubtext = css`
  font-size: 14px;
  color: var(--gray600);
`;

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function getFileTypeFromMimeType(mimeType: string): string {
    const parts = mimeType.split("/");
    if (parts.length >= 2 && parts[1]) {
        // Handle special cases like "svg+xml" -> "SVG"
        const subtype = parts[1].split("+")[0];
        return subtype.toUpperCase();
    }
    return "FILE";
}

export const AdminMedia = () => {
    const [media, setMedia] = createSignal<MediaItem[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [isUploading, setIsUploading] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    const [successMsg, setSuccessMsg] = createSignal<string | null>(null);
    let fileInputRef: HTMLInputElement | undefined;

    onMount(async () => {
        await loadMedia();
    });

    const loadMedia = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);

            const response = await api.getMedia();
            if (!response.ok) {
                throw new Error("Failed to load media");
            }

            const data = await response.json();
            setMedia(data.media || []);
        } catch (err) {
            console.error("Error loading media:", err);
            setErrorMsg("Failed to load media files");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef?.click();
    };

    const handleFileSelect = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            const response = await api.uploadMedia(file);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to upload file");
            }

            setSuccessMsg("File uploaded successfully!");
            await loadMedia();
        } catch (err) {
            console.error("Error uploading file:", err);
            setErrorMsg(err instanceof Error ? err.message : "Failed to upload file");
        } finally {
            setIsUploading(false);
            // Reset the file input
            if (fileInputRef) {
                fileInputRef.value = "";
            }
        }
    };

    const handleCopyUrl = async (item: MediaItem) => {
        try {
            // Construct absolute URL for sharing
            const absoluteUrl = `${window.location.origin}${item.url}`;
            await navigator.clipboard.writeText(absoluteUrl);
            setSuccessMsg("URL copied to clipboard!");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error("Error copying URL:", err);
            setErrorMsg("Failed to copy URL");
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (!confirm(`Are you sure you want to delete "${item.original_name}"?`)) {
            return;
        }

        try {
            setErrorMsg(null);
            setSuccessMsg(null);

            const response = await api.deleteMedia(item.id);
            if (!response.ok) {
                throw new Error("Failed to delete file");
            }

            setSuccessMsg("File deleted successfully!");
            await loadMedia();
        } catch (err) {
            console.error("Error deleting file:", err);
            setErrorMsg("Failed to delete file");
        }
    };

    return (
        <div class={layout}>
            <main class={mainContent}>
                <Show when={errorMsg()}>
                    <div class={error}>{errorMsg()}</div>
                </Show>

                <Show when={successMsg()}>
                    <div class={success}>{successMsg()}</div>
                </Show>

                <div class={header}>
                    <div>
                        <h1 class={title}>Media</h1>
                        <p class={subtitle}>
                            {media().length} file(s) uploaded
                        </p>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            class={hiddenInput}
                            accept={ALLOWED_MIME_TYPES.join(",")}
                            onChange={handleFileSelect}
                        />
                        <button
                            class={uploadButton}
                            onClick={handleUploadClick}
                            disabled={isUploading()}
                        >
                            {isUploading() ? "⏳ Uploading..." : "📤 Upload Image"}
                        </button>
                    </div>
                </div>

                <Show when={isLoading()}>
                    <div class={loading}>Loading media...</div>
                </Show>

                <Show when={!isLoading() && media().length === 0}>
                    <div class={emptyState}>
                        <div class={emptyStateIcon}>🖼️</div>
                        <div class={emptyStateText}>No media files yet</div>
                        <div class={emptyStateSubtext}>
                            Upload your first image to get started
                        </div>
                    </div>
                </Show>

                <Show when={!isLoading() && media().length > 0}>
                    <div class={mediaGrid}>
                        <For each={media()}>
                            {(item) => (
                                <div class={mediaCard}>
                                    <img
                                        src={item.url}
                                        alt={item.original_name}
                                        class={mediaImage}
                                        loading="lazy"
                                    />
                                    <div class={mediaInfo}>
                                        <div class={mediaName} title={item.original_name}>
                                            {item.original_name}
                                        </div>
                                        <div class={mediaSize}>
                                            {formatFileSize(item.size)} • {getFileTypeFromMimeType(item.mime_type)}
                                        </div>
                                        <div class={mediaActions}>
                                            <button
                                                class={`${actionButton} ${copyButton}`}
                                                onClick={() => handleCopyUrl(item)}
                                            >
                                                📋 Copy URL
                                            </button>
                                            <button
                                                class={`${actionButton} ${deleteButton}`}
                                                onClick={() => handleDelete(item)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </main>
        </div>
    );
};
