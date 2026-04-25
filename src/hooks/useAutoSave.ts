import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { writeNote } from "@/lib/vault";

export function useAutoSave() {
  const { content, savedContent, activePath, markSaving, markSaved } = useEditorStore();
  const { autoSave } = useSettingsStore();

  useEffect(() => {
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
  const { content, activePath, markSaving, markSaved } = useEditorStore.getState();
  if (!activePath) return;
  try {
    markSaving();
    await writeNote(activePath, content);
    markSaved();
  } catch (e) {
    console.error("save failed", e);
  }
}
