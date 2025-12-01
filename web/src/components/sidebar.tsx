import { css } from "@linaria/core";
import { useLocation, useNavigate } from "@solidjs/router";
import { type Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { SidebarFooter } from "./sidebar.footer";
import { useDz } from "../dz-context";
import { api } from "../server/api";

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

const expandableMenuItem = css`
  margin-bottom: 10px;
`;

const expandableMenuHeader = css`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--gray500);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  gap: 12px;
  cursor: pointer;
  
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

const expandArrow = css`
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
  
  &.expanded {
    transform: rotate(180deg);
  }
  
  .closed & {
    display: none;
  }
  
  @media (max-width: 768px) {
    .closed & {
      display: block;
    }
  }
`;

const subMenuList = css`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
  
  &.expanded {
    max-height: 500px;
  }
  
  .closed & {
    display: none;
  }
  
  @media (max-width: 768px) {
    .closed & {
      display: block;
    }
  }
`;

const subMenuItem = css`
  margin-bottom: 2px;
`;

const subMenuTitle = css`
  padding: 8px 16px 8px 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const subMenuLink = css`
  display: flex;
  align-items: center;
  padding: 10px 16px 10px 48px;
  color: var(--gray500);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    background: rgba(167, 139, 250, 0.2);
    color: var(--primary);
  }
`;

// Define plugin submenu items
interface PluginSubMenu {
  name: string;
  title: string;
  items: { title: string; link: string }[];
}

// Path constant for dynamic routes that need special handling
const DZFORMS_EDIT_PATH = "/_/admin/plugins/dzforms/edit/";

const pluginSubMenus: PluginSubMenu[] = [
  {
    name: "dzforms",
    title: "Forms",
    items: [
      { title: "Forms", link: "/_/admin/plugins/dzforms/forms" },
      { title: "New Form", link: "/_/admin/plugins/dzforms/new" },
      { title: "Entries", link: "/_/admin/plugins/dzforms/entries" },
      { title: "Settings", link: "/_/admin/plugins/dzforms/settings" },
      { title: "Import/Export", link: "/_/admin/plugins/dzforms/import-export" },
      { title: "Add-Ons", link: "/_/admin/plugins/dzforms/addons" },
      { title: "System Status", link: "/_/admin/plugins/dzforms/system-status" },
      { title: "Help", link: "/_/admin/plugins/dzforms/help" },
    ],
  },
];

export const Sidebar: Component = () => {
  const {store, actions} = useDz();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedPlugins, setExpandedPlugins] = createSignal<Set<string>>(new Set());

  const coreMenuLinks = [
    { title: "Home", icon: "🏠", link: "/_/admin" },
    { title: "Database", icon: "🗄️", link: "/_/admin/tables" },
    { title: "Media", icon: "🖼️", link: "/_/admin/media" },
    { title: "Posts", icon: "📝", link: "/_/admin/posts" },
    { title: "Themes", icon: "🎨", link: "/_/admin/themes" },
    { title: "Plugins", icon: "🔌", link: "/_/admin/plugins" },
  ];

  // Fetch active plugins on mount
  onMount(async () => {
    try {
      const response = await api.getActivePlugins();
      if (response.ok) {
        const data = await response.json();
        actions.setPlugins(data.plugins || []);
      }
    } catch (err) {
      console.error("Failed to fetch active plugins:", err);
    }
  });

  // Get active plugins with submenus
  const activePluginsWithSubMenus = createMemo(() => {
    return store.plugins
      .filter(p => p.sidebar_link && p.sidebar_title && p.is_active)
      .map(p => {
        const subMenu = pluginSubMenus.find(sm => 
          p.sidebar_link?.includes(sm.name)
        );
        return {
          name: p.name,
          title: p.sidebar_title!,
          icon: p.sidebar_icon || "🔌",
          link: p.sidebar_link!,
          subMenu: subMenu,
        };
      });
  });

  const isActive = (link: string) => {
    return location.pathname === link;
  };

  const isPluginActive = (plugin: { link: string; subMenu?: PluginSubMenu }) => {
    if (isActive(plugin.link)) return true;
    if (plugin.subMenu) {
      // Check for exact matches or paths that start with a submenu item link (for dynamic routes like edit/:id)
      return plugin.subMenu.items.some(item => isActive(item.link)) ||
        location.pathname.startsWith(DZFORMS_EDIT_PATH);
    }
    return false;
  };

  const togglePlugin = (pluginName: string) => {
    setExpandedPlugins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pluginName)) {
        newSet.delete(pluginName);
      } else {
        newSet.add(pluginName);
      }
      return newSet;
    });
  };

  // Auto-expand plugin if on one of its sub-pages
  createMemo(() => {
    activePluginsWithSubMenus().forEach(plugin => {
      if (plugin.subMenu) {
        const isOnSubPage = plugin.subMenu.items.some(item => 
          location.pathname === item.link
        ) || location.pathname === plugin.link ||
          location.pathname.startsWith(DZFORMS_EDIT_PATH);
        if (isOnSubPage && !expandedPlugins().has(plugin.name)) {
          setExpandedPlugins(prev => {
            const newSet = new Set(prev);
            newSet.add(plugin.name);
            return newSet;
          });
        }
      }
    });
  });

  return (
    <>
      {/* Mobile Toggle button - moves to the right when sidebar is open */}
      <button
        class={mobileToggleButton}
        classList={{ "sidebar-open": store.settings.sidebarOpen}}
        onClick={() => actions.toggleSidebar()}
      >
        {store.settings.sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      <Show when={store.settings.sidebarOpen}>
        <div class={overlay} onClick={() => actions.toggleSidebar()} />
      </Show>

      {/* Sidebar */}
      <div class={sidebar} classList={{ closed: !store.settings.sidebarOpen }}>
        <div class={menuHeader}>
          <img src="/favicon-32.png" alt="Deez" class={logoIcon} />
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
                    title={!store.settings.sidebarOpen ? menu.title : undefined}
                  >
                    <span class={menuIcon}>{menu.icon}</span>
                    <span class={menuText}>{menu.title}</span>
                  </a>
                </li>
              )}
            </For>

            {/* Active Plugins with expandable submenus */}
            <For each={activePluginsWithSubMenus()}>
              {(plugin) => (
                <li class={expandableMenuItem}>
                  <div
                    class={expandableMenuHeader}
                    classList={{
                      active: isPluginActive(plugin),
                    }}
                    onClick={() => plugin.subMenu ? togglePlugin(plugin.name) : navigate(plugin.link)}
                    title={!store.settings.sidebarOpen ? plugin.title : undefined}
                  >
                    <span class={menuIcon}>{plugin.icon}</span>
                    <span class={menuText}>{plugin.title}</span>
                    <Show when={plugin.subMenu}>
                      <span 
                        class={expandArrow}
                        classList={{ expanded: expandedPlugins().has(plugin.name) }}
                      >
                        ▼
                      </span>
                    </Show>
                  </div>
                  
                  <Show when={plugin.subMenu}>
                    <ul
                      class={subMenuList}
                      classList={{ expanded: expandedPlugins().has(plugin.name) }}
                    >
                      <li class={subMenuItem}>
                        <div class={subMenuTitle}>{plugin.subMenu!.title}</div>
                      </li>
                      <For each={plugin.subMenu!.items}>
                        {(item) => (
                          <li class={subMenuItem}>
                            <a
                              href={item.link}
                              class={subMenuLink}
                              classList={{
                                active: isActive(item.link),
                              }}
                            >
                              {item.title}
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
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
