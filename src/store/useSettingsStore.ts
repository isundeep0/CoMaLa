import { create } from "zustand";
import { readSettings, writeSettings } from "@/lib/vault";

export interface Settings {
  vaultPath: string;
  recentVaults: string[];
  editorFontSize: number;
  editorFontFamily: string;
  previewFontSize: number;
  tabSize: 2 | 4;
  wordWrap: boolean;
  autoSave: boolean;
  openLastNote: boolean;
  lastNotePath: string | null;
  sidebarWidth: number;
  editorPaneRatio: number; // 0..1 — width of editor in split mode
}

const DEFAULTS: Settings = {
  vaultPath: "",
  recentVaults: [],
  editorFontSize: 14,
  editorFontFamily: "JetBrains Mono",
  previewFontSize: 15,
  tabSize: 2,
  wordWrap: true,
  autoSave: true,
  openLastNote: true,
  lastNotePath: null,
  sidebarWidth: 260,
  editorPaneRatio: 0.5,
};

const LS_KEY = "comala.settings.v1";

interface SettingsState extends Settings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setVault: (vaultPath: string) => Promise<void>;
}

function persistLocal(s: Settings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

function loadLocal(): Partial<Settings> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  ...loadLocal(),
  hydrated: false,

  hydrate: async () => {
    const local = loadLocal();
    const merged = { ...DEFAULTS, ...local };
    if (merged.vaultPath) {
      try {
        const fromVault = await readSettings<Settings>(merged.vaultPath, merged);
        set({ ...fromVault, hydrated: true });
        persistLocal(fromVault);
        return;
      } catch {}
    }
    set({ ...merged, hydrated: true });
  },

  set: (key, value) => {
    set({ [key]: value } as Partial<Settings>);
    const next = { ...DEFAULTS, ...get(), [key]: value };
    persistLocal(next);
    if (next.vaultPath) {
      writeSettings(next.vaultPath, next).catch(() => {});
    }
  },

  setVault: async (vaultPath) => {
    const state = get();
    const recentVaults = [vaultPath, ...(state.recentVaults || []).filter((v: string) => v !== vaultPath)].slice(0, 5);
    set({ vaultPath, recentVaults });
    const next = { ...state, vaultPath, recentVaults };
    persistLocal(next);
    try {
      await writeSettings(vaultPath, next);
    } catch {}
  },
}));
