import { create } from "zustand";

export type ViewMode = "editor" | "split" | "preview";

export interface Tab {
  id: string;
  name: string;
  path: string | null; // null = unsaved (in-memory only)
  content: string;
  savedContent: string;
  saveStatus: "saved" | "saving" | "dirty" | "idle";
}

function flatFromTab(tab: Tab | undefined) {
  if (!tab) {
    return {
      activeNoteId: null as string | null,
      activePath: null as string | null,
      activeName: "",
      content: "",
      savedContent: "",
      saveStatus: "idle" as const,
    };
  }
  return {
    activeNoteId: tab.id,
    activePath: tab.path,
    activeName: tab.name,
    content: tab.content,
    savedContent: tab.savedContent,
    saveStatus: tab.saveStatus,
  };
}

let untitledCounter = 0;

interface EditorState {
  // Multi-tab
  tabs: Tab[];
  activeTabId: string | null;

  // Flat fields synced from active tab (backward compat)
  activeNoteId: string | null;
  activePath: string | null;
  activeName: string;
  content: string;
  savedContent: string;
  saveStatus: "saved" | "saving" | "dirty" | "idle";

  // Global
  viewMode: ViewMode;
  cursor: { line: number; col: number };

  // Tab management
  newTab: () => void;
  openNote: (id: string, path: string, name: string, content: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  // Content (operates on active tab)
  setContent: (c: string) => void;
  markSaving: () => void;
  markSaved: (newPath?: string, newName?: string) => void;

  // View
  setViewMode: (m: ViewMode) => void;
  setCursor: (line: number, col: number) => void;
  closeNote: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  activeNoteId: null,
  activePath: null,
  activeName: "",
  content: "",
  savedContent: "",
  viewMode: "split",
  saveStatus: "idle",
  cursor: { line: 1, col: 1 },

  newTab: () => {
    untitledCounter++;
    const id = `__untitled_${untitledCounter}_${Date.now()}`;
    const tab: Tab = {
      id,
      name: `Untitled ${untitledCounter}`,
      path: null,
      content: "",
      savedContent: "",
      saveStatus: "idle",
    };
    // Persist current active tab content before switching
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.id === s.activeTabId
          ? { ...t, content: s.content, savedContent: s.savedContent, saveStatus: s.saveStatus }
          : t,
      );
      return {
        tabs: [...tabs, tab],
        activeTabId: id,
        ...flatFromTab(tab),
        cursor: { line: 1, col: 1 },
      };
    });
  },

  openNote: (id, path, name, content) => {
    set((s) => {
      // Check if already open
      const existing = s.tabs.find((t) => t.path === path);
      if (existing) {
        // Persist current tab first
        const tabs = s.tabs.map((t) =>
          t.id === s.activeTabId
            ? { ...t, content: s.content, savedContent: s.savedContent, saveStatus: s.saveStatus }
            : t,
        );
        return { tabs, activeTabId: existing.id, ...flatFromTab(existing) };
      }
      const tab: Tab = { id, name, path, content, savedContent: content, saveStatus: "saved" };
      const tabs = s.tabs.map((t) =>
        t.id === s.activeTabId
          ? { ...t, content: s.content, savedContent: s.savedContent, saveStatus: s.saveStatus }
          : t,
      );
      return { tabs: [...tabs, tab], activeTabId: id, ...flatFromTab(tab), cursor: { line: 1, col: 1 } };
    });
  },

  closeTab: (tabId) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === tabId);
      if (idx === -1) return s;
      const tabs = s.tabs.filter((t) => t.id !== tabId);
      let nextActiveId = s.activeTabId;
      if (nextActiveId === tabId) {
        if (tabs.length === 0) {
          nextActiveId = null;
        } else if (idx >= tabs.length) {
          nextActiveId = tabs[tabs.length - 1].id;
        } else {
          nextActiveId = tabs[idx].id;
        }
      }
      const activeTab = tabs.find((t) => t.id === nextActiveId);
      return { tabs, activeTabId: nextActiveId, ...flatFromTab(activeTab) };
    });
  },

  setActiveTab: (tabId) => {
    set((s) => {
      if (tabId === s.activeTabId) return s;
      // Persist current tab
      const tabs = s.tabs.map((t) =>
        t.id === s.activeTabId
          ? { ...t, content: s.content, savedContent: s.savedContent, saveStatus: s.saveStatus }
          : t,
      );
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return s;
      return { tabs, activeTabId: tabId, ...flatFromTab(tab), cursor: { line: 1, col: 1 } };
    });
  },

  setContent: (c) => {
    set((s) => {
      const status = c === s.savedContent ? (s.activePath ? "saved" : (c === "" ? "idle" : "dirty")) : "dirty";
      const tabs = s.tabs.map((t) =>
        t.id === s.activeTabId ? { ...t, content: c, saveStatus: status } : t,
      );
      return { content: c, saveStatus: status, tabs } as Partial<EditorState>;
    });
  },

  markSaving: () => {
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.id === s.activeTabId ? { ...t, saveStatus: "saving" as const } : t,
      );
      return { saveStatus: "saving", tabs };
    });
  },

  markSaved: (newPath, newName) => {
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.id !== s.activeTabId) return t;
        return {
          ...t,
          saveStatus: "saved" as const,
          savedContent: s.content,
          ...(newPath !== undefined ? { path: newPath } : {}),
          ...(newName !== undefined ? { name: newName } : {}),
        };
      });
      return {
        saveStatus: "saved",
        savedContent: s.content,
        tabs,
        ...(newPath !== undefined ? { activePath: newPath } : {}),
        ...(newName !== undefined ? { activeName: newName } : {}),
      };
    });
  },

  setViewMode: (m) => set({ viewMode: m }),
  setCursor: (line, col) => set({ cursor: { line, col } }),

  closeNote: () => {
    const { activeTabId, closeTab } = get();
    if (activeTabId) closeTab(activeTabId);
  },
}));
