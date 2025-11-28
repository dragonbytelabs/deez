import { css } from "@linaria/core";
import { useNavigate } from "@solidjs/router";
import {
	type Component,
	createEffect,
	createSignal,
	onMount,
	Show,
} from "solid-js";
import { api } from "../server/api";
import { Sidebar } from "./sidebar";

const SIDEBAR_STORAGE_KEY = "deez-sidebar-open";

const layout = css`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const sideToggleButton = css`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 50%;
  color: var(--gray500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 101;
  
  &:hover {
    background: var(--gray700);
    border-color: var(--primary);
    color: var(--white);
  }
  
  &.sidebar-open {
    left: 234px; /* 250px - 16px to sit on edge */
  }
  
  &.sidebar-closed {
    left: 64px; /* 80px - 16px to sit on edge */
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const mainContent = css`
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.sidebar-closed {
    margin-left: 80px;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    transition: margin-left 0.3s ease;
  }
`;

const pageContent = css`
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 20px;
    padding-top: 80px; /
  }
`;

export const ProtectedRoute: Component<{ component: Component }> = (props) => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);

	const getInitialSidebarState = (): boolean => {
		const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
		return stored === null ? true : stored === "true";
	};

	const [sidebarOpen, setSidebarOpen] = createSignal(getInitialSidebarState());

	createEffect(() => {
		localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen()));
	});

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
				<div class={layout}>
					<Sidebar isOpen={sidebarOpen()} onToggle={setSidebarOpen} />

					{/* Desktop toggle button - outside sidebar */}
					<button
						class={sideToggleButton}
						classList={{
							"sidebar-open": sidebarOpen(),
							"sidebar-closed": !sidebarOpen(),
						}}
						onClick={() => setSidebarOpen(!sidebarOpen())}
					>
						{sidebarOpen() ? "◀" : "▶"}
					</button>

					<div
						class={mainContent}
						classList={{
							"sidebar-closed": !sidebarOpen(),
							"sidebar-open": sidebarOpen(),
						}}
					>
						<div class={pageContent}>{props.component({})}</div>
					</div>
				</div>
			</Show>
		</Show>
	);
};
