import { css } from "@linaria/core";
import { For, Show, type Component } from "solid-js";

const sidebar = css`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background: var(--gray800);
  border-right: 1px solid var(--gray700);
  padding: 20px;
  transform: translateX(0);
  transition: transform 0.3s ease;
  z-index: 100;
  
  &.closed {
    transform: translateX(-100%);
  }
`;

const menuHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray700);
`;

const logo = css`
  font-size: 24px;
  font-weight: bold;
  color: var(--primary);
`;

const toggleButton = css`
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: var(--primaryDark);
  }
`;

const menuList = css`
  list-style: none;
  padding: 0;
  margin: 0;
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
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    background: var(--primary);
    color: white;
  }
`;

const overlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const Sidebar: Component<SidebarProps> = (props) => {
  const sidebarMenuLinks = [
    { title: "🏠 Home", link: "/_/admin" },
    { title: "🏠 database", link: "/_/admin/tables" },
  ];

  const isActive = (link: string) => {
    return window.location.pathname === link;
  }

  return (
    <>
      {/* Toggle button */}
      <button class={toggleButton} onClick={() => props.onToggle(!props.isOpen)}>
        {props.isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      <Show when={props.isOpen}>
        <div class={overlay} onClick={() => props.onToggle(false)} />
      </Show>

      {/* Sidebar */}
      <div class={sidebar} classList={{ closed: !props.isOpen }}>

        <div class={menuHeader}>
          <div class={logo}>Admin</div>
        </div>

        <nav>
          <ul class={menuList}>
            <For each={sidebarMenuLinks}>{(menu) =>
              <li class={menuItem}>
                <a href={menu.link}
                  class={menuLink}
                  classList={{
                    active: isActive(menu.link)
                  }}
                >
                  {menu.title}
                </a>
              </li>}
            </For>
          </ul>
        </nav>
      </div>
    </>
  );
};