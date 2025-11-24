import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show, type Component } from "solid-js";
import { api } from "../server/api";

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
        {props.component({})}
      </Show>
    </Show>
  );
};