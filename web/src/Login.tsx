import { css } from "@linaria/core";
import LoginWithSocials from "./components/login";

const content = css`
  background-color: #red;
`;

export const Login = () => {
	return (
		<div class={content}>
			<h1>Another</h1>
			<div>
				<a href="/">home</a>
				<a href="/game">game</a>
			</div>
			<LoginWithSocials />
		</div>
	);
};
