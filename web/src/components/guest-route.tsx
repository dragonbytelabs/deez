import { useNavigate } from "@solidjs/router";
import { type Component, createSignal, onMount, Show } from "solid-js";
import { api } from "../server/api";

// Guest route component (redirect to home if already logged in)
export const GuestRoute: Component<{ component: Component }> = (props) => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

	onMount(async () => {
		const authenticated = await api.me();
		setIsAuthenticated(authenticated);
		if (authenticated) {
			navigate("/", { replace: true });
		}
	});

	return (
		<Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
			<Show when={!isAuthenticated()} fallback={null}>
				{props.component({})}
			</Show>
		</Show>
	);
};
