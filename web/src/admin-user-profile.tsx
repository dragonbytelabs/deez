import { css } from "@linaria/core";

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
	const handleUpdateEmail = () => {
		console.log("Update email clicked");
	};

	const handleUpdateDisplayName = () => {
		console.log("Update display_name clicked");
	};

	const handleUpdateAvatar = () => {
		console.log("Update avatar clicked");
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>User Profile</h1>
			<p class={subtitle}>Manage your profile settings</p>
			<div class={buttonGroup}>
				<button class={button} onClick={handleUpdateEmail}>
					Update Email
				</button>
				<button class={button} onClick={handleUpdateDisplayName}>
					Update Display Name
				</button>
				<button class={button} onClick={handleUpdateAvatar}>
					Update Avatar
				</button>
			</div>
		</main>
	);
};
