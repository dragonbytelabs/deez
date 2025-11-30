import { css } from "@linaria/core";
import { createSignal, onMount, Show } from "solid-js";
import { api } from "./server/api";

const container = css`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const content = css`
  text-align: center;
  padding: 2rem;
  max-width: 600px;
`;

const logo = css`
  font-size: 4rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const title = css`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 300;
`;

const description = css`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const links = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const adminLink = css`
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const authLink = css`
  display: inline-block;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  border: 2px solid white;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.3);
  }
`;

const footer = css`
  margin-top: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const loading = css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
`;

export const Home = () => {
	const [activeTheme, setActiveTheme] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(true);
	const [loginEnabled, setLoginEnabled] = createSignal(false);
	const [registerEnabled, setRegisterEnabled] = createSignal(false);

	onMount(async () => {
		try {
			// Fetch active theme
			const themeResponse = await api.getPublicTheme();
			if (themeResponse.ok) {
				const themeData = await themeResponse.json();
				setActiveTheme(themeData.active_theme || null);
			}

			// Fetch public auth settings
			const authResponse = await api.getPublicAuth();
			if (authResponse.ok) {
				const authData = await authResponse.json();
				setLoginEnabled(authData.login_enabled || false);
				setRegisterEnabled(authData.register_enabled || false);
			}
		} catch (error) {
			console.error("Error fetching theme/auth status:", error);
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<Show when={!isLoading()} fallback={<div class={loading}>Loading...</div>}>
			<div class={container}>
				<div class={content}>
					<div class={logo}>DZ</div>
					<h1 class={title}>Welcome to Your Site</h1>
					<p class={description}>
						<Show when={activeTheme()} fallback="This is the default theme. Upload a custom theme or customize this one to get started.">
							Theme "{activeTheme()}" is active. Upload a custom theme or customize this one to get started.
						</Show>
					</p>
					<div class={links}>
						<a href="/_/admin" class={adminLink}>Go to Admin Panel</a>
						<Show when={loginEnabled()}>
							<a href="/_/admin/login" class={authLink}>Login</a>
						</Show>
						<Show when={registerEnabled()}>
							<a href="/_/admin/register" class={authLink}>Register</a>
						</Show>
					</div>
					<div class={footer}>
						<p>Powered by DZ CMS</p>
					</div>
				</div>
			</div>
		</Show>
	);
};
