import { useNavigate } from "@solidjs/router";
import { type ParentComponent, createSignal, onMount, Show } from "solid-js";
import { api } from "../server/api";

// Guest route component (redirect to home if already logged in)
export const GuestRoute: ParentComponent = (props) => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

	onMount(async () => {
		const result = await api.me();
		setIsAuthenticated(result.authenticated);
		if (result.authenticated) {
			navigate("/", { replace: true });
		}
	});

	return (
		<Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
			<Show when={!isAuthenticated()} fallback={null}>
				{props.children}
			</Show>
		</Show>
	);
};
