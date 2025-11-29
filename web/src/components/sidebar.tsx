import { css } from "@linaria/core";
import { useLocation } from "@solidjs/router";
import { type Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { SidebarFooter } from "./sidebar.footer";
import { useDz } from "../dz-context";
import { api, type PluginSubMenuItem } from "../server/api";

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
  overflow-y: auto;
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

const dropdownTrigger = css`
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
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  
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

const dropdownArrow = css`
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
  
  &.open {
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

const dropdownMenu = css`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
  background: var(--gray850, #1a1d21);
  border-radius: 8px;
  margin-top: 4px;
  
  &.open {
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

const dropdownItem = css`
  margin: 0;
`;

const dropdownLink = css`
  display: flex;
  align-items: center;
  padding: 10px 16px 10px 44px;
  color: var(--gray500);
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    color: var(--primary);
  }
`;

const dropdownHeader = css`
  display: block;
  padding: 12px 16px 8px 16px;
  color: var(--white);
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`;

// Type for menu items with optional submenu
type MenuItem = {
  title: string;
  icon: string;
  link: string;
  submenu?: PluginSubMenuItem[];
};

export const Sidebar: Component = () => {
  const {store, actions} = useDz();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = createSignal<Set<string>>(new Set());

  const coreMenuLinks: MenuItem[] = [
    { title: "Home", icon: "🏠", link: "/_/admin" },
    { title: "Database", icon: "🗄️", link: "/_/admin/tables" },
    { title: "Media", icon: "🖼️", link: "/_/admin/media" },
    { title: "Themes", icon: "🎨", link: "/_/admin/themes" },
    { title: "Plugins", icon: "🔌", link: "/_/admin/plugins" },
    { title: "Appearance", icon: "✨", link: "/_/admin/appearance" },
    { title: "Settings", icon: "⚙️", link: "/_/admin/settings" },
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

  // DragonByteForms submenu items
  const dzformsSubmenu: PluginSubMenuItem[] = [
    { title: "Forms", link: "", isHeader: true },
    { title: "New Form", link: "/_/admin/plugins/dzforms/new" },
    { title: "Entries", link: "/_/admin/plugins/dzforms/entries" },
    { title: "Settings", link: "/_/admin/plugins/dzforms/settings" },
    { title: "Import/Export", link: "/_/admin/plugins/dzforms/import-export" },
    { title: "Add-Ons", link: "/_/admin/plugins/dzforms/addons" },
    { title: "System Status", link: "/_/admin/plugins/dzforms/status" },
    { title: "Help", link: "/_/admin/plugins/dzforms/help" },
  ];

  // Combine core menu with active plugin menu items
  const sidebarMenuLinks = createMemo(() => {
    const pluginLinks: MenuItem[] = store.plugins
      .filter(p => p.sidebar_link && p.sidebar_title)
      .map(p => {
        // Inject submenu for DragonByteForms plugin
        const submenu = p.name === "dzforms" ? dzformsSubmenu : p.sidebar_submenu;
        return {
          title: p.sidebar_title!,
          icon: p.sidebar_icon || "🔌",
          link: p.sidebar_link!,
          submenu,
        };
      });
    
    // Insert plugin links after "Plugins" menu item
    const pluginsIndex = coreMenuLinks.findIndex(item => item.link === "/_/admin/plugins");
    const result = [...coreMenuLinks];
    if (pluginsIndex !== -1 && pluginLinks.length > 0) {
      result.splice(pluginsIndex + 1, 0, ...pluginLinks);
    }
    return result;
  });

  const isActive = (link: string) => {
    return location.pathname === link;
  };

  const isDropdownActive = (menu: MenuItem) => {
    if (!menu.submenu) return false;
    return menu.submenu.some(item => location.pathname === item.link);
  };

  const toggleDropdown = (link: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(link)) {
        newSet.delete(link);
      } else {
        newSet.add(link);
      }
      return newSet;
    });
  };

  const isDropdownOpen = (link: string) => openDropdowns().has(link);

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
          <span class={logoIcon}>🎮</span>
          <span class={logoText}>Deez</span>
        </div>

        <nav>
          <ul class={menuList}>
            <For each={sidebarMenuLinks()}>
              {(menu) => (
                <li class={menuItem}>
                  <Show 
                    when={menu.submenu && menu.submenu.length > 0}
                    fallback={
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
                    }
                  >
                    {/* Dropdown menu */}
                    <button
                      class={dropdownTrigger}
                      classList={{
                        active: isDropdownActive(menu),
                      }}
                      onClick={() => toggleDropdown(menu.link)}
                      title={!store.settings.sidebarOpen ? menu.title : undefined}
                    >
                      <span class={menuIcon}>{menu.icon}</span>
                      <span class={menuText}>{menu.title}</span>
                      <span class={dropdownArrow} classList={{ open: isDropdownOpen(menu.link) }}>▼</span>
                    </button>
                    <ul class={dropdownMenu} classList={{ open: isDropdownOpen(menu.link) }}>
                      <For each={menu.submenu}>
                        {(subItem) => (
                          <li class={dropdownItem}>
                            <Show 
                              when={subItem.isHeader}
                              fallback={
                                <a
                                  href={subItem.link}
                                  class={dropdownLink}
                                  classList={{
                                    active: isActive(subItem.link),
                                  }}
                                >
                                  {subItem.title}
                                </a>
                              }
                            >
                              <span class={dropdownHeader}>{subItem.title}</span>
                            </Show>
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
