import { css } from "@linaria/core";

const content = css`
  background-color: #red;
`;

const menu = css`
  display: flex;
  justify-content: space-between;
  width: 300px;
  font-size: 20px;
`;

export const Home = () => {
	return (
		<div class={content}>
			<h1>Another</h1>
			<div class={menu}>
				<a href="/">home</a>
				<a href="/register">register</a>
				<a href="/login">login</a>
				<a href="/game">game</a>
			</div>
			<p>This is the homepage</p>
		</div>
	);
};
