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

export const AdminSettings = () => {
	return (
		<main class={mainContent}>
			<h1 class={title}>Admin Settings</h1>
			<p class={subtitle}>View and manage settings here</p>
		</main>
	);
};
