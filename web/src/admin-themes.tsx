import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { api, type ThemeItem } from "./server/api";

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

const themesGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const themeCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary);
  }
`;

const themePreview = css`
  width: 100%;
  height: 180px;
  background: var(--gray700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--gray500);
`;

const themeInfo = css`
  padding: 16px;
`;

const themeName = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const activeLabel = css`
  background: var(--primary);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
`;

const themePath = css`
  font-size: 14px;
  color: var(--gray500);
  margin-bottom: 16px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const themeActions = css`
  display: flex;
  gap: 8px;
`;

const actionButton = css`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const activateButton = css`
  background: var(--primary);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--primaryDark);
  }
`;

const deactivateButton = css`
  background: #7f1d1d;
  color: white;
  
  &:hover:not(:disabled) {
    background: #991b1b;
  }
`;

const previewButton = css`
  background: var(--gray700);
  color: var(--white);
  
  &:hover:not(:disabled) {
    background: var(--gray600);
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

const infoBox = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const infoTitle = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const infoText = css`
  font-size: 14px;
  color: var(--gray500);
  line-height: 1.5;
  
  code {
    background: var(--gray700);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
  }
`;

export const AdminThemes = () => {
    const [themes, setThemes] = createSignal<ThemeItem[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [isProcessing, setIsProcessing] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
    const [successMsg, setSuccessMsg] = createSignal<string | null>(null);

    onMount(async () => {
        await loadThemes();
    });

    const loadThemes = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);

            const response = await api.getThemes();
            if (!response.ok) {
                throw new Error("Failed to load themes");
            }

            const data = await response.json();
            setThemes(data.themes || []);
        } catch (err) {
            console.error("Error loading themes:", err);
            setErrorMsg("Failed to load themes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivate = async (themeName: string) => {
        try {
            setIsProcessing(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            const response = await api.activateTheme(themeName);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to activate theme");
            }

            setSuccessMsg(`Theme "${themeName}" activated successfully!`);
            await loadThemes();
        } catch (err) {
            console.error("Error activating theme:", err);
            setErrorMsg(err instanceof Error ? err.message : "Failed to activate theme");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            setIsProcessing(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            const response = await api.deactivateTheme();
            if (!response.ok) {
                throw new Error("Failed to deactivate theme");
            }

            setSuccessMsg("Theme deactivated successfully!");
            await loadThemes();
        } catch (err) {
            console.error("Error deactivating theme:", err);
            setErrorMsg("Failed to deactivate theme");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePreview = (themeName: string) => {
        // URL encode the theme name to prevent URL manipulation
        const encodedName = encodeURIComponent(themeName);
        window.open(`/_/preview/${encodedName}`, "_blank");
    };

    const activeTheme = () => themes().find(t => t.active);

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
                        <h1 class={title}>Themes</h1>
                        <p class={subtitle}>
                            {themes().length} theme(s) available
                            {activeTheme() && ` • ${activeTheme()?.name} is active`}
                        </p>
                    </div>
                </div>

                <div class={infoBox}>
                    <div class={infoTitle}>📁 How to add a theme</div>
                    <div class={infoText}>
                        Place your theme folder in the <code>dz_content/themes/</code> directory.
                        Each theme must have an <code>index.html</code> file in its root.
                        The active theme will be served at the root URL (<code>/</code>).
                    </div>
                </div>

                <Show when={isLoading()}>
                    <div class={loading}>Loading themes...</div>
                </Show>

                <Show when={!isLoading() && themes().length === 0}>
                    <div class={emptyState}>
                        <div class={emptyStateIcon}>🎨</div>
                        <div class={emptyStateText}>No themes installed</div>
                        <div class={emptyStateSubtext}>
                            Add a theme folder to dz_content/themes/ to get started
                        </div>
                    </div>
                </Show>

                <Show when={!isLoading() && themes().length > 0}>
                    <div class={themesGrid}>
                        <For each={themes()}>
                            {(theme) => (
                                <div class={themeCard} classList={{ active: theme.active }}>
                                    <div class={themePreview}>🎨</div>
                                    <div class={themeInfo}>
                                        <div class={themeName}>
                                            {theme.name}
                                            <Show when={theme.active}>
                                                <span class={activeLabel}>Active</span>
                                            </Show>
                                        </div>
                                        <div class={themePath} title={theme.path}>
                                            {theme.path}
                                        </div>
                                        <div class={themeActions}>
                                            <Show when={!theme.active}>
                                                <button
                                                    class={`${actionButton} ${activateButton}`}
                                                    onClick={() => handleActivate(theme.name)}
                                                    disabled={isProcessing()}
                                                >
                                                    {isProcessing() ? "Processing..." : "Activate"}
                                                </button>
                                            </Show>
                                            <Show when={theme.active}>
                                                <button
                                                    class={`${actionButton} ${deactivateButton}`}
                                                    onClick={handleDeactivate}
                                                    disabled={isProcessing()}
                                                >
                                                    {isProcessing() ? "Processing..." : "Deactivate"}
                                                </button>
                                            </Show>
                                            <button
                                                class={`${actionButton} ${previewButton}`}
                                                onClick={() => handlePreview(theme.name)}
                                            >
                                                Preview
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
