import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show, type Component } from "solid-js";
import { api } from "../server/api";
import { css } from "@linaria/core";
import { Sidebar } from "./sidebar";

const layout = css`
  display: flex;
  min-height: 100vh;
`;

const mainContent = css`
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.sidebar-closed {
    margin-left: 0;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const topBar = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: var(--gray800);
  border-bottom: 1px solid var(--gray700);
  position: sticky;
  top: 0;
  z-index: 50;
`;

const navLinks = css`
  display: flex;
  gap: 30px;
  align-items: center;
  
  a {
    color: var(--gray500);
    text-decoration: none;
    font-size: 16px;
    transition: color 0.2s;
    
    &:hover {
      color: var(--white);
    }
    
    &.active {
      color: var(--primary);
      font-weight: 600;
    }
  }
  
  @media (max-width: 768px) {
    gap: 20px;
    
    a {
      font-size: 14px;
    }
  }
`;

const logoutButton = css`
  background: transparent;
  border: 1px solid var(--gray600);
  color: var(--white);
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--gray700);
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const pageContent = css`
  flex: 1;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const ProtectedRoute: Component<{ component: Component }> = (props) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(true);

  onMount(async () => {
    const authenticated = await api.me();
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      navigate("/login", { replace: true });
    }
  });

  const logout = async () => {
    try {
      const response = await api.logout();

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data);
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = "/login";
        }
      } else {
        const error = await response.text();
        console.error("Logout failed:", error);
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Network error during logout.");
    }
  };

  return (
    <Show when={isAuthenticated() !== null} fallback={<div>Loading...</div>}>
      <Show when={isAuthenticated()} fallback={null}>
        <div class={layout}>
          <Sidebar isOpen={sidebarOpen()} onToggle={setSidebarOpen} />
          
          <div class={`${mainContent} ${!sidebarOpen() ? 'sidebar-closed' : ''}`}>
            <div class={topBar}>
              <nav class={navLinks}>
                <a href="/">Home</a>
                <a href="/game">Game</a>
                <a href="/profile">Profile</a>
                <a href="/settings">Settings</a>
              </nav>
              
              <button class={logoutButton} onClick={logout}>
                Logout
              </button>
            </div>
            
            <div class={pageContent}>
              {props.component({})}
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
};