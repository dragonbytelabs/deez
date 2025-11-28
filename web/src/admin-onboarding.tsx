import { css } from "@linaria/core";
import { useNavigate } from "@solidjs/router";

const mainContent = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const card = css`
  background: var(--gray800, #1f2937);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  text-align: center;
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white, #ffffff);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500, #6b7280);
  margin-bottom: 30px;
`;

const buttonPrimary = css`
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  border-radius: 8px;
  background: #4a1e79;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #5c2a8f;
  }
`;

const buttonSecondary = css`
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  border-radius: 8px;
  background: transparent;
  color: var(--gray400, #9ca3af);
  border: 1px solid var(--gray600, #4b5563);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--gray700, #374151);
    color: var(--white, #ffffff);
  }
`;

export const AdminOnboarding = () => {
	const navigate = useNavigate();

	const handleCreateTeam = () => {
		// Navigate to admin page where they can create a team
		navigate("/_/admin", { replace: true });
	};

	const handleSkip = () => {
		navigate("/_/admin", { replace: true });
	};

	return (
		<main class={mainContent}>
			<div class={card}>
				<h1 class={title}>Welcome!</h1>
				<p class={subtitle}>Your account has been created successfully. Would you like to create a team to get started?</p>
				<button type="button" class={buttonPrimary} onClick={handleCreateTeam}>
					Create a Team
				</button>
				<button type="button" class={buttonSecondary} onClick={handleSkip}>
					Skip for now
				</button>
			</div>
		</main>
	);
};
