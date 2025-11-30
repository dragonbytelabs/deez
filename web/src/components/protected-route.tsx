import { css } from "@linaria/core";
import { useLocation, useNavigate } from "@solidjs/router";
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
	const location = useLocation();
	const { actions} = useDz();
	const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

	const isAdminRoute = () => location.pathname.startsWith("/_/admin");

	onMount(async () => {
		const result = await api.me();
		setIsAuthenticated(result.authenticated);
		if (result.authenticated && result.user) {
			actions.setUser(result.user);
			if (result.teams) {
				actions.setTeams(result.teams);
			}
		}
		if (!result.authenticated) {
			navigate("/_/admin/login", { replace: true });
		}
	});

	return (
		<Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
			<Show when={isAuthenticated()} fallback={null}>
				<div class={layout}>
					<Show when={isAdminRoute()}>
						<Sidebar />
						{/* Desktop toggle button - outside sidebar */}
						<SidebarToggleButton />
					</Show>
					<ProtectedRouteMain isAdminRoute={isAdminRoute()}>
						{props.children}
					</ProtectedRouteMain>
				</div>
			</Show>
		</Show>
	);
};
