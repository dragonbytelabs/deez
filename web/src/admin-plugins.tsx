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

export const AdminPlugins = () => {
	return (
		<main class={mainContent}>
			<h1 class={title}>This is the plugin page</h1>
		</main>
	);
};
