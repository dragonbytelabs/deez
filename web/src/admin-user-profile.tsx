import { css } from "@linaria/core";
import { createSignal } from "solid-js";
import { AvatarPicker } from "./components/user-profile-avatar-picker";
import { EmailPicker } from "./components/user-profile-email-picker";
import { DisplayNameEditor } from "./components/user-profile-display-name-editor";

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

const buttonGroup = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 300px;
`;

const button = css`
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--primaryDark);
  }
`;

export const AdminUserProfile = () => {
	const [isAvatarPickerOpen, setIsAvatarPickerOpen] = createSignal(false);
	const [isEmailPickerOpen, setIsEmailPickerOpen] = createSignal(false);
	const [isDisplayNameEditorOpen, setIsDisplayNameEditorOpen] = createSignal(false);

	const handleUpdateEmail = () => {
		setIsEmailPickerOpen(true);
	};

	const handleUpdateDisplayName = () => {
		setIsDisplayNameEditorOpen(true);
	};

	const handleUpdateAvatar = () => {
		setIsAvatarPickerOpen(true);
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>User Profile</h1>
			<p class={subtitle}>Manage your profile settings</p>
			<div class={buttonGroup}>
				<button class={button} onClick={handleUpdateEmail} type="button">
					Update Email
				</button>
				<button class={button} onClick={handleUpdateDisplayName} type="button">
					Update Display Name
				</button>
				<button class={button} onClick={handleUpdateAvatar} type="button">
					Update Avatar
				</button>
			</div>
			<AvatarPicker
				isOpen={isAvatarPickerOpen}
				setIsOpen={setIsAvatarPickerOpen}
			/>
			<EmailPicker
				isOpen={isEmailPickerOpen}
				setIsOpen={setIsEmailPickerOpen}
			/>
			<DisplayNameEditor
				isOpen={isDisplayNameEditorOpen}
				setIsOpen={setIsDisplayNameEditorOpen}
			/>
		</main>
	);
};
