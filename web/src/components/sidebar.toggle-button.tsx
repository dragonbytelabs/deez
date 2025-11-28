import { css } from "@linaria/core";
import { type Component } from "solid-js";
import { useDzSettings } from "../dz-context";

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

export const SidebarToggleButton: Component = () => {
    const { settings, toggleSidebar} = useDzSettings();

    return (
        <button
            class={sideToggleButton}
            classList={{
                "sidebar-open": settings.sidebarOpen,
                "sidebar-closed": !settings.sidebarOpen,
            }}
            onClick={() => toggleSidebar()}
        >
            {settings.sidebarOpen ? "◀" : "▶"}
        </button>

    );
};
