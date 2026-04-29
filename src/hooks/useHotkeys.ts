import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { manualSave } from "./useAutoSave";

interface Handlers {
  onNewNote: () => void;
  onOpenFile: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  onFind: () => void;
  onExport: () => void;
  onHelp?: () => void;
}

export function useHotkeys({ onNewNote, onOpenFile, onOpenSettings, onToggleSidebar, onFind, onExport, onHelp }: Handlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // F1 for help (no modifier needed)
      if (e.key === "F1") {
        e.preventDefault();
        onHelp?.();
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      // Tab switching: Ctrl+Tab / Ctrl+Shift+Tab
      if (e.key === "Tab") {
        e.preventDefault();
        const { nextTab, prevTab } = useEditorStore.getState();
        if (e.shiftKey) {
          prevTab();
        } else {
          nextTab();
        }
        return;
      }

      const k = e.key.toLowerCase();

      if (k === "s" && !e.shiftKey) {
        e.preventDefault();
        manualSave();
      } else if (k === "n" && !e.shiftKey) {
        e.preventDefault();
        onNewNote();
      } else if (k === "o") {
        e.preventDefault();
        onOpenFile();
      } else if (k === ",") {
        e.preventDefault();
        onOpenSettings();
      } else if (k === "\\") {
        e.preventDefault();
        onToggleSidebar();
      } else if (k === "f" && !e.shiftKey) {
        e.preventDefault();
        onFind();
      } else if (e.shiftKey && k === "x") {
        e.preventDefault();
        onExport();
      } else if (e.shiftKey && k === "e") {
        e.preventDefault();
        useEditorStore.getState().setViewMode("editor");
      } else if (e.shiftKey && k === "p") {
        e.preventDefault();
        useEditorStore.getState().setViewMode("preview");
      } else if (e.shiftKey && k === "b") {
        e.preventDefault();
        useEditorStore.getState().setViewMode("split");
      } else if (k === "w" && !e.shiftKey) {
        e.preventDefault();
        // Close active tab
        const { activeTabId, closeTab } = useEditorStore.getState();
        if (activeTabId) closeTab(activeTabId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNewNote, onOpenFile, onOpenSettings, onToggleSidebar, onFind, onExport, onHelp]);
}
