import { css } from "@linaria/core";
import { createSignal, For, onMount, Show } from "solid-js";
import { api, type PluginInfo } from "./server/api";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-bottom: 30px;
`;

const pluginGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const pluginCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray600);
  }
`;

const pluginHeader = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const pluginIcon = css`
  font-size: 32px;
`;

const pluginInfo = css`
  flex: 1;
`;

const pluginName = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
`;

const pluginVersion = css`
  font-size: 14px;
  color: var(--gray500);
`;

const pluginDescription = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 20px;
  line-height: 1.5;
`;

const pluginActions = css`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const activateButton = css`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--primary);
  color: white;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const deactivateButton = css`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--gray700);
  color: var(--gray300);

  &:hover {
    background: var(--gray600);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const checkUpdatesButton = css`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  border: 1px solid var(--gray600);
  color: var(--gray400);

  &:hover {
    border-color: var(--gray500);
    color: var(--gray300);
  }
`;

const activeBadge = css`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
`;

const inactiveBadge = css`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
`;

const errorText = css`
  color: #ef4444;
  font-size: 16px;
`;

export const AdminPlugins = () => {
	const [plugins, setPlugins] = createSignal<PluginInfo[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);
	const [updating, setUpdating] = createSignal<string | null>(null);

	const fetchPlugins = async () => {
		try {
			const response = await api.getPlugins();
			if (response.ok) {
				const data = await response.json();
				setPlugins(data.plugins || []);
			} else {
				setError("Failed to fetch plugins");
			}
		} catch (err) {
			setError("Failed to fetch plugins");
		} finally {
			setLoading(false);
		}
	};

	const togglePlugin = async (name: string, currentActive: boolean) => {
		setUpdating(name);
		try {
			const response = await api.updatePluginStatus(name, !currentActive);
			if (response.ok) {
				await fetchPlugins();
			} else {
				setError("Failed to update plugin status");
			}
		} catch (err) {
			setError("Failed to update plugin status");
		} finally {
			setUpdating(null);
		}
	};

	const checkForUpdates = async (name: string) => {
		try {
			const response = await api.checkPluginUpdates(name);
			if (response.ok) {
				const data = await response.json();
				if (data.update_available) {
					alert(`Update available: ${data.latest_version}`);
				} else {
					alert("You are using the latest version!");
				}
			}
		} catch (err) {
			setError("Failed to check for updates");
		}
	};

	onMount(() => {
		fetchPlugins();
	});

	return (
		<main class={mainContent}>
			<h1 class={title}>Plugins</h1>
			<p class={subtitle}>Manage your installed plugins</p>

			<Show when={loading()}>
				<p class={loadingText}>Loading plugins...</p>
			</Show>

			<Show when={error()}>
				<p class={errorText}>{error()}</p>
			</Show>

			<Show when={!loading() && !error()}>
				<div class={pluginGrid}>
					<For each={plugins()}>
						{(plugin) => (
							<div class={pluginCard}>
								<div class={pluginHeader}>
									<span class={pluginIcon}>{plugin.sidebar_icon || "🔌"}</span>
									<div class={pluginInfo}>
										<div class={pluginName}>{plugin.display_name}</div>
										<div class={pluginVersion}>v{plugin.version}</div>
									</div>
									<span class={plugin.is_active ? activeBadge : inactiveBadge}>
										{plugin.is_active ? "Active" : "Inactive"}
									</span>
								</div>
								<p class={pluginDescription}>
									{plugin.description || "No description available"}
								</p>
								<div class={pluginActions}>
									<Show
										when={plugin.is_active}
										fallback={
											<button
												class={activateButton}
												onClick={() => togglePlugin(plugin.name, plugin.is_active)}
												disabled={updating() === plugin.name}
											>
												{updating() === plugin.name ? "Activating..." : "Activate"}
											</button>
										}
									>
										<button
											class={deactivateButton}
											onClick={() => togglePlugin(plugin.name, plugin.is_active)}
											disabled={updating() === plugin.name}
										>
											{updating() === plugin.name ? "Deactivating..." : "Deactivate"}
										</button>
									</Show>
									<button
										class={checkUpdatesButton}
										onClick={() => checkForUpdates(plugin.name)}
									>
										Check for Updates
									</button>
								</div>
							</div>
						)}
					</For>
				</div>
			</Show>
		</main>
	);
};
