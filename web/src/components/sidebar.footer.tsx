import { css } from "@linaria/core";
import { useNavigate } from "@solidjs/router";
import { type Component, Show, createSignal, For } from "solid-js";
import { api } from "../server/api";
import { useDz } from "../dz-context";

const menuIcon = css`
  font-size: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const sidebarFooter = css`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--gray700);
  position: relative;
`;

const teamSection = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  position: relative;
  z-index: 201;
  
  &:hover {
    background: var(--gray700);
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

const teamAvatar = css`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const teamName = css`
  color: var(--white);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
  transition: opacity 0.2s;
  text-align: left;
  
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

const menuOverlay = css`
  position: fixed;
  inset: 0;
  z-index: 199;
  background: transparent;
`;

const popupMenu = css`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 200;
  
  .closed & {
    left: 0;
    right: auto;
    min-width: 150px;
  }
`;

const popupMenuItem = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--gray500);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  font-size: 14px;
  text-align: left;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
`;

const teamMenuItem = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--gray500);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  font-size: 14px;
  text-align: left;
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    background: var(--gray700);
    color: var(--white);
  }
`;

const teamMenuAvatar = css`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const menuDivider = css`
  height: 1px;
  background: var(--gray700);
  margin: 4px 0;
`;

export const SidebarFooter: Component = () => {
  const { store, actions } = useDz();
  const [showTeamMenu, setShowTeamMenu] = createSignal(false);
  const navigate = useNavigate();

  const toggleMenu = (event: MouseEvent) => {
    event.stopPropagation();
    setShowTeamMenu(!showTeamMenu());
  };

  const closeMenu = () => {
    setShowTeamMenu(false);
  };

  const logout = async () => {
    try {
      const response = await api.logout();

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data);
        if (data.redirect) {
          navigate(data.redirect);
        } else {
          navigate("/login");
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

  const handleProfileClick = (event: MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    navigate("/_/admin/user/profile");
  };

  const handleLogoutClick = (event: MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    logout();
  };

  const handleTeamSelect = (teamId: number) => {
    const team = store.teams.find((t) => t.id === teamId);
    if (team) {
      actions.setCurrentTeam(team);
    }
    closeMenu();
  };

  const getInitial = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <Show when={showTeamMenu()}>
        <div class={menuOverlay} onClick={closeMenu} />
      </Show>

      <div class={sidebarFooter}>
        <Show when={store.currentTeam}>
          {(team) => (
            <>
              <Show when={showTeamMenu()}>
                <div class={popupMenu}>
                  <Show when={store.teams.length > 0}>
                    <For each={store.teams}>
                      {(t) => (
                        <button
                          class={teamMenuItem}
                          classList={{ active: t.id === team().id }}
                          onClick={() => handleTeamSelect(t.id)}
                        >
                          <span class={teamMenuAvatar}>
                            <Show
                              when={t.avatar_url}
                              fallback={getInitial(t.name)}
                            >
                              <img
                                src={t.avatar_url}
                                alt={`${t.name} avatar`}
                              />
                            </Show>
                          </span>
                          <span>{t.name}</span>
                        </button>
                      )}
                    </For>
                    <div class={menuDivider} />
                  </Show>
                  <button
                    class={popupMenuItem}
                    onClick={handleProfileClick}
                  >
                    <span class={menuIcon}>👤</span>
                    <span>Profile</span>
                  </button>
                  <button
                    class={popupMenuItem}
                    onClick={handleLogoutClick}
                  >
                    <span class={menuIcon}>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </Show>
              <button
                class={teamSection}
                onClick={toggleMenu}
                title={!store.settings.sidebarOpen ? team().name : undefined}
              >
                <div class={teamAvatar}>
                  <Show
                    when={team().avatar_url}
                    fallback={getInitial(team().name)}
                  >
                    <img
                      src={team().avatar_url}
                      alt={`${team().name} avatar`}
                    />
                  </Show>
                </div>
                <span class={teamName}>{team().name}</span>
              </button>
            </>
          )}
        </Show>
        <Show when={!store.currentTeam && store.user}>
          {(user) => (
            <>
              <Show when={showTeamMenu()}>
                <div class={popupMenu}>
                  <button
                    class={popupMenuItem}
                    onClick={handleProfileClick}
                  >
                    <span class={menuIcon}>👤</span>
                    <span>Profile</span>
                  </button>
                  <button
                    class={popupMenuItem}
                    onClick={handleLogoutClick}
                  >
                    <span class={menuIcon}>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </Show>
              <button
                class={teamSection}
                onClick={toggleMenu}
                title={!store.settings.sidebarOpen ? user().display_name : undefined}
              >
                <div class={teamAvatar}>
                  <Show
                    when={user().avatar_url}
                    fallback={getInitial(user().display_name || user().email)}
                  >
                    <img
                      src={user().avatar_url}
                      alt={`${user().display_name}'s avatar`}
                    />
                  </Show>
                </div>
                <span class={teamName}>{user().display_name}</span>
              </button>
            </>
          )}
        </Show>
      </div>
    </>
  );
};