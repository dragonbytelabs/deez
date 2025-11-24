import { css } from "@linaria/core";
import RegisterForm from "./components/register";

const content = css`
  background-color: #red;
`;

export const Register = () => {
	return (
		<div class={content}>
			<h1>Another</h1>
			<div>
				<a href="/">home</a>
				<a href="/game">game</a>
			</div>
			<RegisterForm />
		</div>
	);
};
