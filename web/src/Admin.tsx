import { css } from "@linaria/core";

const mainContent = css`
  margin-left: 250px;
  padding: 40px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 80px 20px 20px;
  }
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
`;

export const Admin = () => {
	return (
		<main class={mainContent}>
			<h1 class={title}>Welcome to the Admin page</h1>
			<p class={subtitle}>This is your data</p>
		</main>
	);
};
