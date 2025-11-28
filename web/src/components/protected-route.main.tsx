import { css } from "@linaria/core";
import {
    type ParentComponent,
} from "solid-js";
import { useDz} from "../dz-context";

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


export const ProtectedRouteMain: ParentComponent = (props) => {
    const { store} = useDz();
    return (
        <div
            class={mainContent}
            classList={{
                "sidebar-closed": !store.settings.sidebarOpen,
                "sidebar-open": store.settings.sidebarOpen,
            }}
        >
            <div class={pageContent}>
                {props.children}
            </div>
        </div>
    );
};
