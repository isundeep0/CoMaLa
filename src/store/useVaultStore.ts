import { create } from "zustand";
import type { Notebook, NoteFile, FileTreeNode } from "@/lib/vault";
import {
  scanVault,
  scanVaultTree,
  createNotebook as fsCreateNotebook,
  createNote as fsCreateNote,
  deleteNote as fsDeleteNote,
  renameNote as fsRenameNote,
} from "@/lib/vault";

interface VaultState {
  vaultPath: string | null;
  notebooks: Notebook[];
  notes: NoteFile[];
  tree: FileTreeNode[];
  loading: boolean;
  setVaultPath: (p: string) => void;
  reload: () => Promise<void>;
  createNotebook: (name: string) => Promise<Notebook | null>;
  createNote: (notebookPath: string, name: string) => Promise<NoteFile | null>;
  deleteNote: (path: string) => Promise<void>;
  renameNote: (oldPath: string, newName: string) => Promise<string | null>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaultPath: null,
  notebooks: [],
  notes: [],
  tree: [],
  loading: false,

  setVaultPath: (p) => set({ vaultPath: p }),

  reload: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    set({ loading: true });

    let notebooks: Notebook[] = [];
    let notes: NoteFile[] = [];
    let tree: FileTreeNode[] = [];

    try {
      const result = await scanVault(vaultPath);
      notebooks = result.notebooks;
      notes = result.notes;
    } catch (e) {
      console.error("vault scan (flat) failed", e);
    }

    try {
      tree = await scanVaultTree(vaultPath);
    } catch (e) {
      console.error("vault scan (tree) failed", e);
    }

    set({ notebooks, notes, tree, loading: false });
  },

  createNotebook: async (name) => {
    const { vaultPath, reload } = get();
    if (!vaultPath) return null;
    const nb = await fsCreateNotebook(vaultPath, name);
    await reload();
    return nb;
  },

  createNote: async (notebookPath, name) => {
    try {
      const note = await fsCreateNote(notebookPath, name);
      try {
        await get().reload();
      } catch (e) {
        console.error("reload after createNote failed", e);
      }
      return note;
    } catch (e) {
      console.error("createNote failed", e);
      // Still try to reload so the tree stays fresh
      try { await get().reload(); } catch {}
      return null;
    }
  },

  deleteNote: async (path) => {
    await fsDeleteNote(path);
    await get().reload();
  },

  renameNote: async (oldPath, newName) => {
    const newPath = await fsRenameNote(oldPath, newName);
    await get().reload();
    return newPath;
  },
}));
