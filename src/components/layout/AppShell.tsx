import { useCallback, useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import {
  PanelLeft,
  Eye,
  EyeOff,
  Columns2,
  Save,
  FileUp,
  Download,
  Search,
  FilePlus,
  HelpCircle,
  PenTool,
} from "lucide-react";
import Sidebar, { type SidebarHandle } from "@/components/sidebar/Sidebar";
import EditorPane from "@/components/editor/EditorPane";
import PreviewPane from "@/components/preview/PreviewPane";
import DrawingCanvas from "@/components/editor/DrawingCanvas";
import Toolbar from "@/components/editor/Toolbar";
import TabBar from "@/components/editor/TabBar";
import StatusBar from "@/components/layout/StatusBar";
import TitleBar from "@/components/layout/TitleBar";
import SettingsModal from "@/components/settings/SettingsModal";
import HelpModal from "@/components/help/HelpModal";
import WelcomeScreen from "@/components/welcome/WelcomeScreen";
import { useEditorStore } from "@/store/useEditorStore";
import { useVaultStore } from "@/store/useVaultStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAutoSave, manualSave } from "@/hooks/useAutoSave";
import { useHotkeys } from "@/hooks/useHotkeys";
import { openExternalFile, pickVaultDir, readNote, normalizePath } from "@/lib/vault";
import { exportHtml } from "@/lib/exporters";
import { openSearchPanel } from "@codemirror/search";
import { cn } from "@/lib/utils";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const sidebarRef = useRef<SidebarHandle>(null);

  const settings = useSettingsStore();
  const { vaultPath, setVaultPath, reload } = useVaultStore();
  const { activeNoteId, viewMode, setViewMode, openNote, saveStatus, activeName, newTab } = useEditorStore();

  // Hydrate settings on mount
  useEffect(() => {
    settings.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When vault path becomes available, scan it
  useEffect(() => {
    if (settings.vaultPath) {
      const normalized = normalizePath(settings.vaultPath);
      if (normalized !== vaultPath) {
        setVaultPath(normalized);
      }
    }
  }, [settings.vaultPath, vaultPath, setVaultPath]);

  useEffect(() => {
    if (vaultPath) reload();
  }, [vaultPath, reload]);

  useAutoSave();

  // Track last opened note
  useEffect(() => {
    if (activeNoteId) settings.set("lastNotePath", activeNoteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId]);

  const handlePickVault = useCallback(async () => {
    const path = await pickVaultDir();
    if (path) {
      await settings.setVault(path);
      setVaultPath(path);
    }
  }, [settings, setVaultPath]);

  const handleNewNote = useCallback(() => {
    newTab();
  }, [newTab]);

  const handleOpenRecent = useCallback(async (path: string) => {
    const normalized = normalizePath(path);
    await settings.setVault(normalized);
    setVaultPath(normalized);
  }, [settings, setVaultPath]);

  const handleOpenFile = useCallback(async () => {
    const path = await openExternalFile();
    if (!path) return;
    const c = await readNote(path);
    const name = path.split(/[\\/]/).pop()?.replace(/\.md$/, "") || "Untitled";
    openNote(path, path, name, c);
  }, [openNote]);

  useHotkeys({
    onNewNote: handleNewNote,
    onOpenFile: handleOpenFile,
    onOpenSettings: () => setSettingsOpen(true),
    onToggleSidebar: () => setSidebarOpen((s) => !s),
    onFind: () => {
      if (editorViewRef.current) openSearchPanel(editorViewRef.current);
    },
    onExport: () => handleExport(),
    onHelp: () => setHelpOpen(true),
  });

  const handleExport = useCallback(async () => {
    const { activeName, content } = useEditorStore.getState();
    if (!content) return;
    try {
      const path = await exportHtml(activeName || "untitled", content);
      if (path) console.log("exported to", path);
    } catch (e) {
      console.error("export failed", e);
    }
  }, []);

  // Open last note on startup
  const lastNoteOpened = useRef(false);
  useEffect(() => {
    if (lastNoteOpened.current) return;
    if (!settings.hydrated || !settings.openLastNote || !settings.lastNotePath) return;
    if (!vaultPath) return;
    lastNoteOpened.current = true;
    (async () => {
      try {
        const notePath = normalizePath(settings.lastNotePath!);
        const c = await readNote(notePath);
        const name =
          notePath.split("/").pop()?.replace(/\.md$/, "") || "Untitled";
        openNote(notePath, notePath, name, c);
      } catch {}
    })();
  }, [settings.hydrated, settings.openLastNote, settings.lastNotePath, vaultPath, openNote]);

  if (!settings.hydrated) {
    return (
      <div className="h-full flex flex-col">
        <TitleBar />
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (!settings.vaultPath) {
    return (
      <div className="h-full flex flex-col">
        <TitleBar />
        <div className="flex-1 min-h-0">
          <WelcomeScreen onPickVault={handlePickVault} onOpenSettings={() => setSettingsOpen(true)} onOpenRecent={handleOpenRecent} />
        </div>
      </div>
    );
  }

  const showEditor = viewMode === "editor" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split";
  const showDraw = viewMode === "draw";
  const splitRatio = settings.editorPaneRatio;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "transition-[width] duration-200 ease-out h-full overflow-hidden",
          sidebarOpen ? "" : "w-0",
        )}
        style={sidebarOpen ? { width: settings.sidebarWidth } : undefined}
      >
        {sidebarOpen && (
          <Sidebar
            ref={sidebarRef}
            onOpenSettings={() => setSettingsOpen(true)}
            onPickVault={handlePickVault}
          />
        )}
      </div>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Top bar */}
        <div className="glass-toolbar flex items-center justify-between px-3 py-2 fluid-highlight">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="glass-btn glass-btn-icon"
              title="Toggle sidebar (Ctrl+\\)"
            >
              <PanelLeft size={14} />
            </button>
            <span className="ml-2 text-[12px] text-[var(--text-muted)] truncate max-w-md">
              {activeName || "No file open"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenFile}
              className="glass-btn text-[11px]"
              title="Open file (Ctrl+O)"
            >
              <FileUp size={12} /> Open
            </button>
            <button
              onClick={manualSave}
              disabled={!activeNoteId}
              className={cn("glass-btn text-[11px]", saveStatus === "dirty" && "active")}
              title="Save (Ctrl+S)"
            >
              <Save size={12} /> Save
            </button>
            <button
              onClick={handleExport}
              disabled={!activeNoteId}
              className="glass-btn text-[11px]"
              title="Export to HTML (Ctrl+Shift+X)"
            >
              <Download size={12} /> Export
            </button>
            <button
              onClick={() => editorViewRef.current && openSearchPanel(editorViewRef.current)}
              disabled={!activeNoteId}
              className="glass-btn glass-btn-icon"
              title="Find (Ctrl+F)"
            >
              <Search size={13} />
            </button>
            <span className="w-px h-5 bg-white/8 mx-1" />
            <button
              onClick={() => setViewMode("editor")}
              className={cn("glass-btn glass-btn-icon", viewMode === "editor" && "active")}
              title="Editor only (Ctrl+Shift+E)"
            >
              <EyeOff size={13} />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={cn("glass-btn glass-btn-icon", viewMode === "split" && "active")}
              title="Split view (Ctrl+Shift+B)"
            >
              <Columns2 size={13} />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={cn("glass-btn glass-btn-icon", viewMode === "preview" && "active")}
              title="Preview only (Ctrl+Shift+P)"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() => setViewMode("draw")}
              className={cn("glass-btn glass-btn-icon", viewMode === "draw" && "active")}
              title="Drawing canvas"
            >
              <PenTool size={13} />
            </button>
            <span className="w-px h-5 bg-white/8 mx-1" />
            <button
              onClick={() => setHelpOpen(true)}
              className="glass-btn glass-btn-icon"
              title="Help (F1)"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>

        {/* Toolbar (only when editor visible) */}
        {showEditor && <Toolbar view={editorViewRef.current} />}

        {/* Tab bar */}
        {!showDraw && <TabBar />}

        {/* Editor + Preview */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {showDraw ? (
            <div className="flex-1 h-full overflow-hidden">
              <DrawingCanvas />
            </div>
          ) : !activeNoteId ? (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] animate-fade-in">
              <div className="text-center space-y-4">
                <div className="text-[14px] mb-1">No note open</div>
                <div className="space-y-1">
                  <button
                    onClick={handleNewNote}
                    className="w-56 flex items-center gap-3 px-3 py-2 mx-auto rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <FilePlus size={15} className="text-[var(--accent)] shrink-0" />
                    <span className="flex-1">New Note</span>
                    <kbd className="text-[10px] text-[var(--text-dim)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--border)]">Ctrl+N</kbd>
                  </button>
                  <button
                    onClick={handleOpenFile}
                    className="w-56 flex items-center gap-3 px-3 py-2 mx-auto rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <FileUp size={15} className="text-[var(--accent)] shrink-0" />
                    <span className="flex-1">Open File</span>
                    <kbd className="text-[10px] text-[var(--text-dim)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--border)]">Ctrl+O</kbd>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {showEditor && (
                <div
                  className="h-full overflow-hidden"
                  style={{
                    width: showPreview ? `${splitRatio * 100}%` : "100%",
                  }}
                >
                  <EditorPane onReady={(v) => (editorViewRef.current = v)} />
                </div>
              )}
              {showEditor && showPreview && (
                <ResizeHandle
                  onResize={(delta, containerWidth) => {
                    const next = Math.max(
                      0.2,
                      Math.min(0.8, splitRatio + delta / containerWidth),
                    );
                    settings.set("editorPaneRatio", next);
                  }}
                />
              )}
              {showPreview && (
                <div className="flex-1 h-full overflow-hidden">
                  <PreviewPane />
                </div>
              )}
            </>
          )}
        </div>

        <StatusBar />
      </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onVaultChange={(p) => {
          settings.setVault(p);
          setVaultPath(p);
        }}
      />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function ResizeHandle({
  onResize,
}: {
  onResize: (delta: number, containerWidth: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    let lastX: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (lastX === null) {
        lastX = e.clientX;
        return;
      }
      const delta = e.clientX - lastX;
      lastX = e.clientX;
      const container = document.querySelector(".flex-1.flex.overflow-hidden") as HTMLElement | null;
      const width = container?.clientWidth || window.innerWidth;
      onResize(delta, width);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onResize]);

  return (
    <div
      className={cn("resize-handle", dragging && "dragging")}
      onMouseDown={() => setDragging(true)}
    />
  );
}
