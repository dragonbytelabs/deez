import { css } from "@linaria/core";
import { createSignal, Show } from "solid-js";

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

const settingsContainer = css`
  max-width: 800px;
`;

const settingsSection = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const sectionTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray700);
`;

const settingRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--gray700);

  &:last-child {
    border-bottom: none;
  }
`;

const settingInfo = css`
  flex: 1;
`;

const settingLabel = css`
  font-size: 14px;
  font-weight: 500;
  color: var(--white);
  margin-bottom: 4px;
`;

const settingDescription = css`
  font-size: 13px;
  color: var(--gray500);
`;

const toggle = css`
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--gray600);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &.active {
    background: var(--primary);
  }
`;

const toggleKnob = css`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;

  .active & {
    transform: translateX(24px);
  }
`;

const fieldInput = css`
  padding: 10px 14px;
  background: var(--gray700);
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  width: 200px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const saveButton = css`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--gray600);
    cursor: not-allowed;
  }
`;

const successMessage = css`
  color: #22c55e;
  font-size: 14px;
  margin-left: 16px;
`;

const buttonContainer = css`
  display: flex;
  align-items: center;
  margin-top: 24px;
`;

export const AdminDZFormsSettings = () => {
	const [emailNotifications, setEmailNotifications] = createSignal(true);
	const [autoSave, setAutoSave] = createSignal(true);
	const [submitLimit, setSubmitLimit] = createSignal("100");
	const [saving, setSaving] = createSignal(false);
	const [saved, setSaved] = createSignal(false);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>Settings</h1>
			<p class={subtitle}>Configure DragonByteForm plugin settings</p>

			<div class={settingsContainer}>
				<div class={settingsSection}>
					<h2 class={sectionTitle}>General Settings</h2>
					
					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Email Notifications</div>
							<div class={settingDescription}>
								Send email notifications when forms are submitted
							</div>
						</div>
						<div
							class={toggle}
							classList={{ active: emailNotifications() }}
							onClick={() => setEmailNotifications(!emailNotifications())}
						>
							<div class={toggleKnob} />
						</div>
					</div>

					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Auto-save Forms</div>
							<div class={settingDescription}>
								Automatically save form drafts while editing
							</div>
						</div>
						<div
							class={toggle}
							classList={{ active: autoSave() }}
							onClick={() => setAutoSave(!autoSave())}
						>
							<div class={toggleKnob} />
						</div>
					</div>

					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Daily Submission Limit</div>
							<div class={settingDescription}>
								Maximum number of submissions per form per day
							</div>
						</div>
						<input
							type="number"
							class={fieldInput}
							value={submitLimit()}
							onInput={(e) => setSubmitLimit(e.currentTarget.value)}
							min="0"
						/>
					</div>
				</div>

				<div class={settingsSection}>
					<h2 class={sectionTitle}>Security</h2>
					
					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>CAPTCHA Protection</div>
							<div class={settingDescription}>
								Require CAPTCHA verification for form submissions
							</div>
						</div>
						<div class={toggle}>
							<div class={toggleKnob} />
						</div>
					</div>

					<div class={settingRow}>
						<div class={settingInfo}>
							<div class={settingLabel}>Honeypot Fields</div>
							<div class={settingDescription}>
								Add hidden honeypot fields to prevent spam
							</div>
						</div>
						<div class={toggle} classList={{ active: true }}>
							<div class={toggleKnob} />
						</div>
					</div>
				</div>

				<div class={buttonContainer}>
					<button
						class={saveButton}
						onClick={handleSave}
						disabled={saving()}
					>
						{saving() ? "Saving..." : "Save Settings"}
					</button>
					<Show when={saved()}>
						<span class={successMessage}>✓ Settings saved successfully</span>
					</Show>
				</div>
			</div>
		</main>
	);
};
