import { css } from "@linaria/core";
import { useLocation } from "@solidjs/router";
import { type Component, For, Show } from "solid-js";
import type { UserInfo } from "../server/api";
import { SidebarFooter } from "./sidebar.footer";
import { useDzSettings } from "../dz-context";

const sidebar = css`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background: var(--gray800);
  border-right: 1px solid var(--gray700);
  padding: 20px;
  transition: width 0.3s ease, padding 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  &.closed {
    width: 80px;
    padding: 20px 10px;
  }
  
  @media (max-width: 768px) {
    transform: translateX(0);
    transition: transform 0.3s ease;
    
    &.closed {
      transform: translateX(-100%);
      width: 250px;
      padding: 20px;
    }
  }
`;

const menuHeader = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray700);
  min-height: 40px;
`;

const logoIcon = css`
  font-size: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const logoText = css`
  font-size: 24px;
  font-weight: bold;
  color: var(--white);
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s;
  
  .closed & {
    opacity: 0;
    width: 0;
  }
  
  @media (max-width: 768px) {
    .closed & {
      opacity: 1;
      width: auto;
    }
  }
`;

const mobileToggleButton = css`
  position: fixed;
  left: 20px;
  top: 20px;
  z-index: 101;
  background: var(--primary);
  border: none;
  color: white;
  font-size: 24px;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primaryDark);
  }
  
  &.sidebar-open {
    left: 270px; /* 250px sidebar + 20px margin */
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const menuList = css`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const menuItem = css`
  margin-bottom: 10px;
`;

const menuLink = css`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--gray500);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  gap: 12px;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    background: var(--primary);
    color: white;
  }
  
  .closed & {
    padding: 12px;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    .closed & {
      padding: 12px 16px;
      justify-content: flex-start;
    }
  }
`;

const menuIcon = css`
  font-size: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const menuText = css`
  opacity: 1;
  transition: opacity 0.2s;
  
  .closed & {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    .closed & {
      opacity: 1;
      width: auto;
      overflow: visible;
    }
  }
`;

const overlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const Sidebar: Component = () => {
  const {settings, toggleSidebar } = useDzSettings();
  const location = useLocation();

  const sidebarMenuLinks = [
    { title: "Home", icon: "🏠", link: "/_/admin" },
    { title: "Database", icon: "🗄️", link: "/_/admin/tables" },
    { title: "Settings", icon: "⚙️", link: "/_/admin/settings" },
  ];

  const isActive = (link: string) => {
    return location.pathname === link;
  };

  return (
    <>
      {/* Mobile Toggle button - moves to the right when sidebar is open */}
      <button
        class={mobileToggleButton}
        classList={{ "sidebar-open": settings.sidebarOpen}}
        onClick={() => toggleSidebar()}
      >
        {settings.sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      <Show when={settings.sidebarOpen}>
        <div class={overlay} onClick={() => toggleSidebar()} />
      </Show>

      {/* Sidebar */}
      <div class={sidebar} classList={{ closed: !settings.sidebarOpen }}>
        <div class={menuHeader}>
          <span class={logoIcon}>🎮</span>
          <span class={logoText}>Deez</span>
        </div>

        <nav>
          <ul class={menuList}>
            <For each={sidebarMenuLinks}>
              {(menu) => (
                <li class={menuItem}>
                  <a
                    href={menu.link}
                    class={menuLink}
                    classList={{
                      active: isActive(menu.link),
                    }}
                    title={!settings.sidebarOpen ? menu.title : undefined}
                  >
                    <span class={menuIcon}>{menu.icon}</span>
                    <span class={menuText}>{menu.title}</span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>

        {/* User section at bottom */}
        <SidebarFooter />
      </div>
    </>
  );
};
