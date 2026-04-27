import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  FileText,
  FolderPlus,
  FilePlus,
  Search,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  Settings as SettingsIcon,
  FolderOpen,
  Folder,
  File,
  Check,
  X,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useVaultStore } from "@/store/useVaultStore";
import { useEditorStore } from "@/store/useEditorStore";
import { readNote } from "@/lib/vault";
import type { FileTreeNode } from "@/lib/vault";
import { ConfirmDialog } from "@/components/ui/Dialog";

interface Props {
  onOpenSettings: () => void;
  onPickVault: () => void;
}

/* ─── Inline input row used for creating notebooks & notes ─── */
function InlineInput({
  placeholder,
  onSubmit,
  onCancel,
  icon,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  icon: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const doSubmit = useCallback(() => {
    if (doneRef.current) return;
    const v = value.trim();
    if (v) {
      doneRef.current = true;
      onSubmit(v);
    }
  }, [value, onSubmit]);

  const doCancel = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCancel();
  }, [onCancel]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-[var(--accent)]/30 animate-fade-in">
      {icon}
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-[var(--text-dim)] min-w-0"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            doSubmit();
          }
          if (e.key === "Escape") doCancel();
        }}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          doSubmit();
        }}
        className="text-[var(--accent)] hover:text-[var(--text)] shrink-0"
        title="Confirm"
      >
        <Check size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          doCancel();
        }}
        className="text-[var(--text-dim)] hover:text-[var(--text)] shrink-0"
        title="Cancel"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export interface SidebarHandle {
  startCreateNote: () => void;
  startCreateNotebook: () => void;
}

/* ─── Recursive tree node for the file explorer ─── */
function matchesSearch(node: FileTreeNode, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (node.name.toLowerCase().includes(q)) return true;
  if (node.isDirectory && node.children) {
    return node.children.some((c) => matchesSearch(c, q));
  }
  return false;
}

function countChildren(node: FileTreeNode): number {
  if (!node.isDirectory || !node.children) return 0;
  return node.children.reduce(
    (sum, c) => sum + (c.isDirectory ? countChildren(c) : 1),
    0,
  );
}

interface TreeNodeProps {
  node: FileTreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  search: string;
  activeNoteId: string | null;
  editingId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  creatingNoteIn: string | null;
  setCreatingNoteIn: (p: string | null) => void;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenNote: (path: string, id: string, name: string) => void;
  onCreateNote: (dirPath: string, name: string) => void;
  onStartRename: (id: string, name: string) => void;
  onCommitRename: (oldPath: string) => void;
  onCancelRename: () => void;
  onDeleteTarget: (t: { path: string; name: string }) => void;
}

function RecursiveTreeNode({
  node,
  depth,
  expanded,
  toggle,
  search,
  activeNoteId,
  editingId,
  editValue,
  setEditValue,
  creatingNoteIn,
  setCreatingNoteIn,
  setExpanded,
  onOpenNote,
  onCreateNote,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDeleteTarget,
}: TreeNodeProps) {
  if (search && !matchesSearch(node, search)) return null;

  if (node.isDirectory) {
    const isOpen = expanded.has(node.id) || !!search;
    const isCreatingHere = creatingNoteIn === node.path;
    const childCount = countChildren(node);

    return (
      <div className="mb-0.5">
        <button
          onClick={() => toggle(node.id)}
          className="group w-full flex items-center gap-1 px-2 py-1.5 rounded-md text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.03] transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Folder size={12} className="shrink-0 text-[var(--accent)]" />
          <span className="flex-1 text-left font-medium tracking-tight truncate">{node.name}</span>
          <span className="text-[10px] text-[var(--text-dim)]">{childCount}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setCreatingNoteIn(node.path);
              setExpanded((prev) => new Set([...prev, node.id]));
            }}
            className="opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition-opacity cursor-pointer"
            title="New note here"
          >
            <FilePlus size={12} />
          </span>
        </button>
        {isOpen && (
          <div className="border-l border-[var(--border)] ml-4" style={{ marginLeft: `${depth * 12 + 16}px` }}>
            {isCreatingHere && (
              <div className="my-0.5 pl-1">
                <InlineInput
                  placeholder="Note name…"
                  onSubmit={(name) => onCreateNote(node.path, name)}
                  onCancel={() => setCreatingNoteIn(null)}
                  icon={<FileText size={11} className="text-[var(--accent)] shrink-0" />}
                />
              </div>
            )}
            {node.children?.map((child) => (
              <RecursiveTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                toggle={toggle}
                search={search}
                activeNoteId={activeNoteId}
                editingId={editingId}
                editValue={editValue}
                setEditValue={setEditValue}
                creatingNoteIn={creatingNoteIn}
                setCreatingNoteIn={setCreatingNoteIn}
                setExpanded={setExpanded}
                onOpenNote={onOpenNote}
                onCreateNote={onCreateNote}
                onStartRename={onStartRename}
                onCommitRename={onCommitRename}
                onCancelRename={onCancelRename}
                onDeleteTarget={onDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  const displayName = node.name.replace(/\.md$/, "");
  const isMd = node.name.endsWith(".md");

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 py-1.5 rounded-md cursor-pointer text-[12px] transition-all",
        activeNoteId === node.id
          ? "bg-[var(--accent-glow)] text-[var(--text)] shadow-[inset_0_0_0_1px_var(--accent-glow-strong)]"
          : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]",
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
      onClick={() => isMd && onOpenNote(node.path, node.id, displayName)}
    >
      {isMd ? (
        <FileText size={11} className="shrink-0" />
      ) : (
        <File size={11} className="shrink-0 text-[var(--text-dim)]" />
      )}
      {editingId === node.id ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onCommitRename(node.path)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitRename(node.path);
            if (e.key === "Escape") onCancelRename();
          }}
          className="flex-1 bg-transparent outline-none border-b border-[var(--accent)] text-[12px] min-w-0"
        />
      ) : (
        <>
          <span className={cn("flex-1 truncate", !isMd && "text-[var(--text-dim)]")}>
            {isMd ? displayName : node.name}
          </span>
          {isMd && node.mtime ? (
            <span className="text-[9px] text-[var(--text-dim)] opacity-0 group-hover:opacity-100">
              {formatDate(node.mtime)}
            </span>
          ) : null}
          {isMd && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename(node.id, displayName);
                }}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-dim)] hover:text-[var(--accent)]"
                title="Rename"
              >
                <Pencil size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTarget({ path: node.path, name: displayName });
                }}
                className="opacity-0 group-hover:opacity-100 text-[var(--text-dim)] hover:text-[var(--error)]"
                title="Delete"
              >
                <Trash2 size={10} />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

const Sidebar = forwardRef<SidebarHandle, Props>(function Sidebar({ onOpenSettings, onPickVault }, ref) {
  const { notebooks, tree, vaultPath, loading, createNotebook, createNote, deleteNote, renameNote } =
    useVaultStore();
  const { openNote, activeNoteId } = useEditorStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingName, setEditingName] = useState("");

  // Inline creation states
  const [creatingNotebook, setCreatingNotebook] = useState(false);
  const [creatingNoteIn, setCreatingNoteIn] = useState<string | null>(null); // notebookPath or null

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; name: string } | null>(null);

  useEffect(() => {
    // Auto-expand top-level directories
    const dirs = tree.filter((n) => n.isDirectory).map((n) => n.id);
    setExpanded((prev) => new Set([...prev, ...dirs]));
  }, [tree]);

  // Auto-expand ancestor folders of the active note so it's visible in the tree
  useEffect(() => {
    if (!activeNoteId || !vaultPath) return;
    const normalized = activeNoteId.replace(/\\/g, "/");
    const vaultNorm = vaultPath.replace(/\\/g, "/");
    if (!normalized.startsWith(vaultNorm)) return;
    // Build ancestor paths: e.g. "D:/Vault/a/b/note.md" → ["D:/Vault/a", "D:/Vault/a/b"]
    const relative = normalized.slice(vaultNorm.length + 1); // "a/b/note.md"
    const parts = relative.split("/");
    const ancestors: string[] = [];
    for (let i = 0; i < parts.length - 1; i++) {
      ancestors.push(vaultNorm + "/" + parts.slice(0, i + 1).join("/"));
    }
    if (ancestors.length > 0) {
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const a of ancestors) next.add(a);
        return next;
      });
    }
  }, [activeNoteId, vaultPath]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const handleOpenNote = useCallback(
    async (path: string, id: string, name: string) => {
      try {
        const content = await readNote(path);
        openNote(id, path, name, content);
      } catch (e) {
        console.error("failed to open note", e);
      }
    },
    [openNote],
  );

  const handleCreateNotebook = useCallback(
    async (name: string) => {
      try {
        const nb = await createNotebook(name);
        if (nb) {
          // Auto-expand the new notebook — use nb.path since tree node IDs are full paths
          setExpanded((prev) => new Set([...prev, nb.path]));
        }
      } catch (e) {
        console.error("failed to create notebook", e);
      } finally {
        setCreatingNotebook(false);
      }
    },
    [createNotebook],
  );

  const handleCreateNote = useCallback(
    async (notebookPath: string, name: string) => {
      try {
        const note = await createNote(notebookPath, name);
        setCreatingNoteIn(null);
        if (note) {
          await handleOpenNote(note.path, note.id, note.name);
        }
      } catch (e) {
        console.error("failed to create note", e);
      } finally {
        setCreatingNoteIn(null);
      }
    },
    [createNote, handleOpenNote],
  );

  const handleQuickNewNote = useCallback(() => {
    // Find directories in the tree to create a note in
    const dirs = tree.filter((n) => n.isDirectory);
    if (!dirs.length && !notebooks.length) {
      setCreatingNotebook(true);
      return;
    }
    const expandedDirs = dirs.filter((d) => expanded.has(d.id));
    const target = expandedDirs[0] || dirs[0] || notebooks[0];
    if (target) {
      setCreatingNoteIn(target.path);
      setExpanded((prev) => new Set([...prev, target.path]));
    }
  }, [tree, notebooks, expanded]);

  const handleDelete = useCallback(
    async (path: string) => {
      setDeleteTarget(null);
      try {
        await deleteNote(path);
        if (useEditorStore.getState().activeNoteId === path) {
          useEditorStore.getState().closeNote();
        }
      } catch (e) {
        console.error("failed to delete note", e);
      }
    },
    [deleteNote],
  );

  useImperativeHandle(ref, () => ({
    startCreateNote: () => handleQuickNewNote(),
    startCreateNotebook: () => setCreatingNotebook(true),
  }));

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
    setEditingName(name);
  };

  const commitRename = async (oldPath: string) => {
    if (editValue.trim() && editValue !== editingName) {
      try {
        const newPath = await renameNote(oldPath, editValue);
        if (newPath && useEditorStore.getState().activeNoteId === oldPath) {
          const content = useEditorStore.getState().content;
          useEditorStore.getState().openNote(newPath, newPath, editValue.trim(), content);
        }
      } catch (e) {
        console.error("failed to rename note", e);
      }
    }
    setEditingId(null);
    setEditingName("");
  };

  return (
    <aside className="glass-sidebar h-full flex flex-col w-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between fluid-highlight">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#5b4fcf] flex items-center justify-center fluid-highlight shadow-[0_4px_12px_var(--accent-glow)]">
            <FileText size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight">COMALA</div>
            <div className="text-[10px] text-[var(--text-dim)]">Code · Markdown · LaTeX</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="glass-input w-full pl-7 pr-2 py-1.5 rounded-lg text-[12px] placeholder:text-[var(--text-dim)]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pt-2 pb-2 flex gap-1.5">
        <button
          onClick={() => setCreatingNotebook(true)}
          className="glass-btn flex-1 text-[11px]"
          title="New notebook"
        >
          <FolderPlus size={12} /> Notebook
        </button>
        <button
          onClick={handleQuickNewNote}
          className="accent-btn glass-btn flex-1 text-[11px]"
          title="New note (Ctrl+N)"
        >
          <FilePlus size={12} /> Note
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!vaultPath ? (
          <div className="px-3 py-8 text-center text-[12px] text-[var(--text-muted)]">
            No vault selected.
            <button
              onClick={onPickVault}
              className="block mt-3 mx-auto glass-btn text-[11px]"
            >
              <FolderOpen size={12} /> Choose vault
            </button>
          </div>
        ) : loading ? (
          <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
            Scanning vault…
          </div>
        ) : tree.length === 0 && notebooks.length === 0 && !creatingNotebook ? (
          <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
            Empty vault.
            <button
              onClick={() => setCreatingNotebook(true)}
              className="block mt-3 mx-auto glass-btn text-[11px]"
            >
              <FolderPlus size={12} /> Create notebook
            </button>
          </div>
        ) : (
          <>
            {/* Inline notebook creation at the top of the tree */}
            {creatingNotebook && (
              <div className="mb-1 px-1">
                <InlineInput
                  placeholder="Folder name…"
                  onSubmit={handleCreateNotebook}
                  onCancel={() => setCreatingNotebook(false)}
                  icon={<FolderPlus size={12} className="text-[var(--accent)] shrink-0" />}
                />
              </div>
            )}

            {tree.map((node) => (
              <RecursiveTreeNode
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                toggle={toggle}
                search={search}
                activeNoteId={activeNoteId}
                editingId={editingId}
                editValue={editValue}
                setEditValue={setEditValue}
                creatingNoteIn={creatingNoteIn}
                setCreatingNoteIn={setCreatingNoteIn}
                setExpanded={setExpanded}
                onOpenNote={handleOpenNote}
                onCreateNote={handleCreateNote}
                onStartRename={startRename}
                onCommitRename={commitRename}
                onCancelRename={() => setEditingId(null)}
                onDeleteTarget={setDeleteTarget}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between fluid-highlight">
        <button
          onClick={onPickVault}
          className="text-[10px] text-[var(--text-dim)] hover:text-[var(--text-muted)] truncate flex-1 text-left"
          title={vaultPath || "No vault"}
        >
          <FolderOpen size={10} className="inline mr-1" />
          {vaultPath ? vaultPath.split(/[\\/]/).pop() : "No vault"}
        </button>
        <button
          onClick={onOpenSettings}
          className="glass-btn glass-btn-icon"
          title="Settings (Ctrl+,)"
        >
          <SettingsIcon size={13} />
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.path)}
        title="Delete note"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </aside>
  );
});

export default Sidebar;
