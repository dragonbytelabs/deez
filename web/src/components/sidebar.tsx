import { css } from "@linaria/core";
import { useLocation } from "@solidjs/router";
import { type Component, For } from "solid-js";

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
  overflow-x: hidden;
  overflow-y: auto;
  
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
  width: 32px;
  height: 32px;
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

export const Sidebar: Component = () => {
  const location = useLocation();
  const coreMenuLinks = [
    { title: "Home", icon: "🏠", link: "/_/admin" },
    { title: "Database", icon: "🗄️", link: "/_/admin/tables" },
    { title: "Media", icon: "🖼️", link: "/_/admin/media" },
    { title: "Posts", icon: "📝", link: "/_/admin/posts" },
    { title: "Themes", icon: "🎨", link: "/_/admin/themes" },
    { title: "Plugins", icon: "🔌", link: "/_/admin/plugins" },
  ];

  const isActive = (link: string) => {
    return location.pathname === link;
  };

  return (
    <>
      {/* Sidebar */}
      <div class={sidebar} classList={{ closed: false}}>
        <div class={menuHeader}>
          <img src="/favicon-32.png" alt="Deez logo" class={logoIcon} />
          <span class={logoText}>Deez</span>
        </div>

        <nav>
          <ul class={menuList}>
            {/* Core Menu Items */}
            <For each={coreMenuLinks}>
              {(menu) => (
                <li class={menuItem}>
                  <a
                    href={menu.link}
                    class={menuLink}
                    classList={{
                      active: isActive(menu.link),
                    }}
                    title={menu.title}
                  >
                    <span class={menuIcon}>{menu.icon}</span>
                    <span class={menuText}>{menu.title}</span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </div>
    </>
  );
};
