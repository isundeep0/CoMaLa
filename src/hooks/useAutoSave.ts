import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { writeNote, saveAsDialog } from "@/lib/vault";

export function useAutoSave() {
  const { content, savedContent, activePath, markSaving, markSaved } = useEditorStore();
  const { autoSave } = useSettingsStore();

  useEffect(() => {
    // Only auto-save files that already have a path on disk
    if (!autoSave || !activePath) return;
    if (content === savedContent) return;
    const handle = setTimeout(async () => {
      try {
        markSaving();
        await writeNote(activePath, content);
        markSaved();
      } catch (e) {
        console.error("auto-save failed", e);
      }
    }, 2000);
    return () => clearTimeout(handle);
  }, [content, savedContent, activePath, autoSave, markSaving, markSaved]);
}

export async function manualSave() {
  const { content, activePath, activeName, markSaving, markSaved } =
    useEditorStore.getState();

  if (activePath) {
    // Existing file → save directly
    try {
      markSaving();
      await writeNote(activePath, content);
      markSaved();
    } catch (e) {
      console.error("save failed", e);
    }
  } else {
    // Untitled tab → open Save As dialog
    const defaultName = (activeName || "Untitled") + ".md";
    const path = await saveAsDialog(defaultName);
    if (!path) return; // user cancelled
    try {
      markSaving();
      await writeNote(path, content);
      const name = path.split(/[\\/]/).pop()?.replace(/\.md$/, "") || activeName;
      markSaved(path, name);
    } catch (e) {
      console.error("save-as failed", e);
    }
  }
}
