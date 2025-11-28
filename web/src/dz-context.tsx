import { createContext, useContext, type ParentComponent } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import type { UserInfo } from "./server/api";

// Define the shape of your app state
export interface DzStore {
  user: UserInfo | null;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    timestamp: number;
  }>;
  posts: Array<any>; // Define post type later
  comments: Record<string, Array<any>>; // Comments by post ID
  settings: {
    theme: "dark" | "light";
    sidebarOpen: boolean;
  };
}

// Initial state
const initialState: DzStore = {
  user: null,
  notifications: [],
  posts: [],
  comments: {},
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
    addNotification: (
      type: DzStore["notifications"][0]["type"],
      message: string
    ) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
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
      setStore("user", user);
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

    addNotification: (
      type: DzStore["notifications"][0]["type"],
      message: string
    ) => {
      const id = `notif-${Date.now()}-${Math.random()}`;
      setStore(
        produce((draft) => {
          draft.notifications.push({
            id,
            type,
            message,
            timestamp: Date.now(),
          });
        })
      );

      // Auto-remove after 5 seconds
      setTimeout(() => {
        actions.removeNotification(id);
      }, 5000);
    },

    removeNotification: (id: string) => {
      setStore(
        produce((draft) => {
          const index = draft.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            draft.notifications.splice(index, 1);
          }
        })
      );
    },

    clearNotifications: () => {
      setStore("notifications", []);
    },

    toggleSidebar: () => {
      setStore(
        produce((draft) => {
          draft.settings.sidebarOpen = !draft.settings.sidebarOpen;
        })
      );
    },

    setSidebarOpen: (open: boolean) => {
      setStore("settings", "sidebarOpen", open);
    },

    setTheme: (theme: "dark" | "light") => {
      setStore("settings", "theme", theme);
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

// Convenience hooks for specific parts of state
export const useDzUser = () => {
  const { store } = useDz();
  return store.user;
};

export const useDzNotifications = () => {
  const { store, actions } = useDz();
  return {
    notifications: store.notifications,
    addNotification: actions.addNotification,
    removeNotification: actions.removeNotification,
    clearNotifications: actions.clearNotifications,
  };
};

export const useDzSettings = () => {
  const { store, actions } = useDz();
  return {
    settings: store.settings,
    toggleSidebar: actions.toggleSidebar,
    setSidebarOpen: actions.setSidebarOpen,
    setTheme: actions.setTheme,
  };
};