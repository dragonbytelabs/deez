import { css } from "@linaria/core";

const content = css`
  background-color: #red;
`;

export const Home = () => {
	return (
		<div class={content}>
			<p>This is the homepage</p>
		</div>
	);
};
