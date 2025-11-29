import { css } from "@linaria/core";
import { createSignal, Show } from "solid-js";
import { api } from "../server/api";
import { useNavigate } from "@solidjs/router";

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const card = css`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
`;

const title = css`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

const inputField = css`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const buttonPrimary = css`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  border-radius: 8px;
  background: #4a1e79;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const signupText = css`
  margin-top: 12px;
  font-size: 14px;
  color: #555;
  text-align: center;

  & a {
    color: #4a1e79;
    text-decoration: none;
    font-weight: bold;
  }
`;

const errorMessage = css`
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
`;

export default function LoginWithSocials() {
	const [email, setEmail] = createSignal("");
	const [password, setPassword] = createSignal("");
	const [error, setError] = createSignal("");
	const navigate = useNavigate();

	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(""); // Clear any previous errors

		// Validate email format
		if (!isValidEmail(email())) {
			setError("Please enter a valid email address");
			return;
		}

		// Build body the same way <form> would
		console.log("Email signal:", email());
		console.log("Password signal:", password());
		const response = await api.login(email(), password());
		console.log("Submitting login:", email(), password());

		if (response.ok) {
			const data = await response.json();
			console.log("Login successful:", data);
			if (data.redirect) {
				navigate(data.redirect, { replace: true });
			}
		} else {
			const errorText = await response.text();
			console.error("Login failed:", errorText);
			setError(errorText || "Login failed. Please try again.");
		}
	};

	return (
		<div class={container}>
			<div class={card}>
				<h1 class={title}>Login</h1>
				<form onSubmit={handleSubmit}>
					<Show when={error()}>
						<div class={errorMessage}>{error()}</div>
					</Show>
					<input
						type="email"
						placeholder="Email"
						class={inputField}
						value={email()}
						onInput={(e) => setEmail(e.currentTarget.value)}
						required
					/>
					<input
						type="password"
						placeholder="Password"
						class={inputField}
						value={password()}
						onInput={(e) => setPassword(e.currentTarget.value)}
					/>
					<button type="submit" class={buttonPrimary}>
						Sign In
					</button>
					<p class={signupText}>
						Don’t Have An Account? <a href="/_/admin/register">Create a new account</a>
					</p>
				</form>
			</div>
		</div>
	);
}
