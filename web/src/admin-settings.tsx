import { css } from "@linaria/core";
import { createSignal, onMount, Show } from "solid-js";
import { api, type PublicAuthSettings } from "./server/api";

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

const settingsSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const sectionTitle = css`
  font-size: 20px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const sectionDescription = css`
  font-size: 14px;
  color: var(--gray500);
  margin-bottom: 20px;
`;

const settingRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--gray700);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const settingInfo = css`
  flex: 1;
`;

const settingLabel = css`
  font-size: 16px;
  font-weight: 500;
  color: var(--white);
  margin-bottom: 4px;
`;

const settingHelp = css`
  font-size: 13px;
  color: var(--gray500);
`;

const toggle = css`
  position: relative;
  width: 52px;
  height: 28px;
  background: var(--gray600);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s;
  
  &.enabled {
    background: var(--primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const toggleKnob = css`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  
  .enabled & {
    transform: translateX(24px);
  }
`;

const errorMessage = css`
  background: #991b1b;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const successMessage = css`
  background: #166534;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const loading = css`
  text-align: center;
  padding: 40px;
  color: var(--gray500);
`;

export const AdminSettings = () => {
	const [settings, setSettings] = createSignal<PublicAuthSettings | null>(null);
	const [isLoading, setIsLoading] = createSignal(true);
	const [isUpdating, setIsUpdating] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [success, setSuccess] = createSignal<string | null>(null);

	onMount(async () => {
		await loadSettings();
	});

	const loadSettings = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await api.getPublicAuthSettings();
			if (!response.ok) {
				throw new Error("Failed to load settings");
			}

			const data = await response.json();
			setSettings(data);
		} catch (err) {
			console.error("Error loading settings:", err);
			setError("Failed to load settings");
		} finally {
			setIsLoading(false);
		}
	};

	const updateSetting = async (setting: "login" | "register", value: boolean) => {
		try {
			setIsUpdating(true);
			setError(null);
			setSuccess(null);

			const response = await api.updatePublicAuthSettings(
				setting === "login" ? value : undefined,
				setting === "register" ? value : undefined
			);

			if (!response.ok) {
				throw new Error("Failed to update setting");
			}

			const data = await response.json();
			setSettings({
				public_login_enabled: data.public_login_enabled,
				public_register_enabled: data.public_register_enabled,
			});

			setSuccess(`${setting === "login" ? "Login" : "Registration"} ${value ? "enabled" : "disabled"} successfully`);
			
			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			console.error("Error updating setting:", err);
			setError("Failed to update setting");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>Admin Settings</h1>
			<p class={subtitle}>View and manage settings here</p>

			<Show when={error()}>
				<div class={errorMessage}>{error()}</div>
			</Show>

			<Show when={success()}>
				<div class={successMessage}>{success()}</div>
			</Show>

			<Show when={isLoading()}>
				<div class={loading}>Loading settings...</div>
			</Show>

			<Show when={!isLoading() && settings()}>
				<div class={settingsSection}>
					<h2 class={sectionTitle}>Public Authentication</h2>
					<p class={sectionDescription}>
						Control whether visitors can log in or register through your theme's public pages.
						These settings affect the /login and /register pages on your site.
					</p>

					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Enable Public Login</div>
							<div class={settingHelp}>
								Allow visitors to log in through the theme's login page at /login
							</div>
						</div>
						<button
							class={`${toggle} ${settings()?.public_login_enabled ? "enabled" : ""}`}
							onClick={() => updateSetting("login", !settings()?.public_login_enabled)}
							disabled={isUpdating()}
							type="button"
						>
							<div class={toggleKnob} />
						</button>
					</div>

					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Enable Public Registration</div>
							<div class={settingHelp}>
								Allow visitors to create new accounts through the theme's register page at /register
							</div>
						</div>
						<button
							class={`${toggle} ${settings()?.public_register_enabled ? "enabled" : ""}`}
							onClick={() => updateSetting("register", !settings()?.public_register_enabled)}
							disabled={isUpdating()}
							type="button"
						>
							<div class={toggleKnob} />
						</button>
					</div>
				</div>
			</Show>
		</main>
	);
};
