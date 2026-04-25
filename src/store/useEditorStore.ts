import { create } from "zustand";

export type ViewMode = "editor" | "split" | "preview";

interface EditorState {
  activeNoteId: string | null;
  activePath: string | null;
  activeName: string;
  content: string;
  savedContent: string;
  viewMode: ViewMode;
  saveStatus: "saved" | "saving" | "dirty" | "idle";
  cursor: { line: number; col: number };

  openNote: (id: string, path: string, name: string, content: string) => void;
  setContent: (c: string) => void;
  markSaving: () => void;
  markSaved: () => void;
  setViewMode: (m: ViewMode) => void;
  setCursor: (line: number, col: number) => void;
  closeNote: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeNoteId: null,
  activePath: null,
  activeName: "",
  content: "",
  savedContent: "",
  viewMode: "split",
  saveStatus: "idle",
  cursor: { line: 1, col: 1 },

  openNote: (id, path, name, content) =>
    set({
      activeNoteId: id,
      activePath: path,
      activeName: name,
      content,
      savedContent: content,
      saveStatus: "saved",
    }),

  setContent: (c) =>
    set((s) => ({
      content: c,
      saveStatus: c === s.savedContent ? "saved" : "dirty",
    })),

  markSaving: () => set({ saveStatus: "saving" }),
  markSaved: () => set((s) => ({ saveStatus: "saved", savedContent: s.content })),

  setViewMode: (m) => set({ viewMode: m }),
  setCursor: (line, col) => set({ cursor: { line, col } }),

  closeNote: () =>
    set({
      activeNoteId: null,
      activePath: null,
      activeName: "",
      content: "",
      savedContent: "",
      saveStatus: "idle",
    }),
}));
