import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show, type Component } from "solid-js";
import { api } from "../server/api";
import { css } from "@linaria/core";

const menu = css`
  display: flex;
  justify-content: space-between;
  width: 300px;
  font-size: 20px;
`;

export const ProtectedRoute: Component<{ component: Component }> = (props) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

  onMount(async () => {
    const authenticated = await api.me();
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
      <Show when={isAuthenticated()} fallback={null}>
			<div class={menu}>
				<a href="/">home</a>
				<a href="/register">register</a>
				<a href="/login">login</a>
				<a href="/admin">game</a>
			</div>
        {props.component({})}
      </Show>
    </Show>
  );
};