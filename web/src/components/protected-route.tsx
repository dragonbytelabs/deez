import { css } from "@linaria/core";
import { useNavigate } from "@solidjs/router";
import {
	createSignal,
	onMount,
	type ParentComponent,
	Show,
} from "solid-js";
import { api } from "../server/api";
import { Sidebar } from "./sidebar";
import { useDz } from "../dz-context";
import { SidebarToggleButton } from "./sidebar.toggle-button";
import { ProtectedRouteMain } from "./protected-route.main";


const layout = css`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

export const ProtectedRoute: ParentComponent = (props) => {
	const navigate = useNavigate();
	const { actions} = useDz();
	const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

	onMount(async () => {
		const result = await api.me();
		setIsAuthenticated(result.authenticated);
		if (result.authenticated && result.user) {
			actions.setUser(result.user);
		}
		if (!result.authenticated) {
			navigate("/login", { replace: true });
		}
	});

	return (
		<Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
			<Show when={isAuthenticated()} fallback={null}>
				<div class={layout}>
					<Sidebar />
					{/* Desktop toggle button - outside sidebar */}
					<SidebarToggleButton />
					<ProtectedRouteMain>
						{props.children}
					</ProtectedRouteMain>
				</div>
			</Show>
		</Show>
	);
};
