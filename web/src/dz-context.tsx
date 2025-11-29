import { createContext, useContext, type ParentComponent } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import type { UserInfo, TeamInfo } from "./server/api";

// Define the shape of your app state
export interface DzStore {
  user: UserInfo | null;
  teams: TeamInfo[];
  currentTeam: TeamInfo | null;
  settings: {
    theme: "dark" | "light";
    sidebarOpen: boolean;
  };
}

// Initial state
const initialState: DzStore = {
  user: null,
  teams: [],
  currentTeam: null,
  settings: {
    theme: "dark",
    sidebarOpen: true,
  },
};

// Context type
interface DzContextType {
  store: DzStore;
  setStore: SetStoreFunction<DzStore>;
  actions: {
    setUser: (user: UserInfo | null) => void;
    updateUserAvatar: (avatarUrl: string) => void;
    updateUserDisplayName: (displayName: string) => void;
    updateUserEmail: (email: string) => void;
    setTeams: (teams: TeamInfo[]) => void;
    setCurrentTeam: (team: TeamInfo | null) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: "dark" | "light") => void;
  };
}

// Create context
const DzContext = createContext<DzContextType>();

// Provider component
export const DzProvider: ParentComponent = (props) => {
  const [store, setStore] = createStore<DzStore>(initialState);

  // Actions for common operations
  const actions = {
    setUser: (user: UserInfo | null) => {
      setStore(produce((draft) => {
        draft.user = user;
      }));
    },

    updateUserAvatar: (avatarUrl: string) => {
      setStore(
        produce((draft) => {
          if (draft.user) {
            draft.user.avatar_url = avatarUrl;
          }
        })
      );
    },

    updateUserDisplayName: (displayName: string) => {
      setStore(
        produce((draft) => {
          if (draft.user) {
            draft.user.display_name = displayName;
          }
        })
      );
    },

    updateUserEmail: (email: string) => {
      setStore(
        produce((draft) => {
          if (draft.user) {
            draft.user.email = email;
          }
        })
      );
    },

    setTeams: (teams: TeamInfo[]) => {
      setStore(
        produce((draft) => {
          draft.teams = teams;
          // If there are teams and no current team is selected, select the first one
          if (teams.length > 0 && !draft.currentTeam) {
            draft.currentTeam = teams[0];
          }
        })
      );
    },

    setCurrentTeam: (team: TeamInfo | null) => {
      setStore(
        produce((draft) => {
          draft.currentTeam = team;
        })
      );
    },

    toggleSidebar: () => {
      setStore(
        produce((draft) => {
          draft.settings.sidebarOpen = !draft.settings.sidebarOpen;
        })
      );
    },

    setSidebarOpen: (open: boolean) => {
      setStore(
        produce((draft) => {
          draft.settings.sidebarOpen = open;
        })
      );

    },

    setTheme: (theme: "dark" | "light") => {
      setStore(
        produce((draft) => {
          draft.settings.theme = theme;
        })
      );
    },
  };

  const contextValue: DzContextType = {
    store,
    setStore,
    actions,
  };

  return (
    <DzContext.Provider value={contextValue}>
      {props.children}
    </DzContext.Provider>
  );
};

// Hook to use the context
export const useDz = () => {
  const context = useContext(DzContext);
  if (!context) {
    throw new Error("useDz must be used within a DzProvider");
  }
  return context;
};