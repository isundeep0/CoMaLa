import {
  readTextFile,
  writeTextFile,
  mkdir,
  readDir,
  remove,
  rename,
  exists,
  stat,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { slugifyFilename } from "./utils";

export interface Notebook {
  id: string;
  name: string;
  path: string;
}
export interface NoteFile {
  id: string;
  name: string;
  path: string;
  notebookId: string;
  notebookName: string;
  mtime: number;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  mtime?: number;
}

const SETTINGS_DIR = ".comala";
const SETTINGS_FILE = "settings.json";

function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/[\\/]+$/, "") : p.replace(/^[\\/]+|[\\/]+$/g, "")))
    .filter(Boolean)
    .join("/")
    .replace(/\\/g, "/");
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function basename(p: string): string {
  const parts = p.split(/[\\/]/);
  return parts[parts.length - 1] || p;
}

export async function pickVaultDir(): Promise<string | null> {
  const dir = await open({ directory: true, multiple: false, title: "Choose your COMALA vault" });
  if (typeof dir === "string") return normalizePath(dir);
  return null;
}

export async function ensureSettingsDir(vaultPath: string): Promise<void> {
  const settingsPath = joinPath(vaultPath, SETTINGS_DIR);
  if (!(await exists(settingsPath))) {
    await mkdir(settingsPath, { recursive: true });
  }
}

export async function readSettings<T>(vaultPath: string, defaults: T): Promise<T> {
  try {
    const path = joinPath(vaultPath, SETTINGS_DIR, SETTINGS_FILE);
    if (!(await exists(path))) return defaults;
    const raw = await readTextFile(path);
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export async function writeSettings(vaultPath: string, settings: unknown): Promise<void> {
  await ensureSettingsDir(vaultPath);
  const path = joinPath(vaultPath, SETTINGS_DIR, SETTINGS_FILE);
  await writeTextFile(path, JSON.stringify(settings, null, 2));
}

export async function scanVault(
  vaultPath: string,
): Promise<{ notebooks: Notebook[]; notes: NoteFile[] }> {
  const notebooks: Notebook[] = [];
  const notes: NoteFile[] = [];
  if (!(await exists(vaultPath))) return { notebooks, notes };

  const entries = await readDir(vaultPath);
  for (const entry of entries) {
    if (entry.name?.startsWith(".")) continue;
    if (entry.isDirectory) {
      const nbPath = joinPath(vaultPath, entry.name);
      const nb: Notebook = { id: entry.name, name: entry.name, path: nbPath };
      notebooks.push(nb);
      try {
        const subEntries = await readDir(nbPath);
        for (const sub of subEntries) {
          if (!sub.isFile || !sub.name?.endsWith(".md")) continue;
          const filePath = joinPath(nbPath, sub.name);
          let mtime = 0;
          try {
            const s = await stat(filePath);
            mtime = s.mtime ? new Date(s.mtime).getTime() : 0;
          } catch {}
          notes.push({
            id: filePath,
            name: sub.name.replace(/\.md$/, ""),
            path: filePath,
            notebookId: nb.id,
            notebookName: nb.name,
            mtime,
          });
        }
      } catch {}
    } else if (entry.isFile && entry.name?.endsWith(".md")) {
      // top-level note → "Inbox"
      const filePath = joinPath(vaultPath, entry.name);
      let mtime = 0;
      try {
        const s = await stat(filePath);
        mtime = s.mtime ? new Date(s.mtime).getTime() : 0;
      } catch {}
      notes.push({
        id: filePath,
        name: entry.name.replace(/\.md$/, ""),
        path: filePath,
        notebookId: "__inbox__",
        notebookName: "Inbox",
        mtime,
      });
    }
  }

  if (notes.some((n) => n.notebookId === "__inbox__") &&
      !notebooks.some((nb) => nb.id === "__inbox__")) {
    notebooks.unshift({ id: "__inbox__", name: "Inbox", path: vaultPath });
  }

  notebooks.sort((a, b) => a.name.localeCompare(b.name));
  notes.sort((a, b) => b.mtime - a.mtime);
  return { notebooks, notes };
}

export async function scanVaultTree(dirPath: string): Promise<FileTreeNode[]> {
  const nodes: FileTreeNode[] = [];
  try {
    if (!(await exists(dirPath))) return nodes;
  } catch {
    return nodes;
  }

  let entries;
  try {
    entries = await readDir(dirPath);
  } catch {
    return nodes;
  }

  for (const entry of entries) {
    if (!entry.name || entry.name.startsWith(".")) continue;
    const fullPath = joinPath(dirPath, entry.name);

    if (entry.isDirectory) {
      let children: FileTreeNode[] = [];
      try {
        children = await scanVaultTree(fullPath);
      } catch {}
      nodes.push({
        id: fullPath,
        name: entry.name,
        path: fullPath,
        isDirectory: true,
        children,
      });
    } else if (entry.isFile) {
      let mtime = 0;
      try {
        const s = await stat(fullPath);
        mtime = s.mtime ? new Date(s.mtime).getTime() : 0;
      } catch {}
      nodes.push({
        id: fullPath,
        name: entry.name,
        path: fullPath,
        isDirectory: false,
        mtime,
      });
    }
  }

  // Directories first, then alphabetical
  nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export async function createNotebook(vaultPath: string, name: string): Promise<Notebook> {
  const safe = slugifyFilename(name);
  const path = joinPath(vaultPath, safe);
  if (!(await exists(path))) await mkdir(path, { recursive: true });
  return { id: safe, name: safe, path };
}

export async function createNote(
  notebookPath: string,
  filename: string,
  initialContent = "# Untitled\n\n",
): Promise<NoteFile> {
  let safe = slugifyFilename(filename);
  if (!safe.endsWith(".md")) safe += ".md";
  let target = joinPath(notebookPath, safe);
  let i = 1;
  try {
    while (await exists(target)) {
      const base = safe.replace(/\.md$/, "");
      target = joinPath(notebookPath, `${base}-${i}.md`);
      i++;
      if (i > 100) break; // safety valve
    }
  } catch {
    // exists() failed — proceed with the current target
  }
  await writeTextFile(target, initialContent);
  return {
    id: target,
    name: basename(target).replace(/\.md$/, ""),
    path: target,
    notebookId: basename(notebookPath),
    notebookName: basename(notebookPath),
    mtime: Date.now(),
  };
}

export async function readNote(path: string): Promise<string> {
  return await readTextFile(path);
}

export async function writeNote(path: string, content: string): Promise<void> {
  await writeTextFile(path, content);
}

export async function deleteNote(path: string): Promise<void> {
  await remove(path);
}

export async function deleteFolder(path: string): Promise<void> {
  await remove(path, { recursive: true });
}

export async function renameNote(oldPath: string, newName: string): Promise<string> {
  const dir = oldPath.substring(0, oldPath.lastIndexOf("/")) || oldPath.substring(0, oldPath.lastIndexOf("\\"));
  let safe = slugifyFilename(newName);
  if (!safe.endsWith(".md")) safe += ".md";
  const newPath = joinPath(dir, safe);
  await rename(oldPath, newPath);
  return newPath;
}

export async function openExternalFile(): Promise<string | null> {
  const path = await open({
    multiple: false,
    title: "Open Markdown file",
    filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
  });
  return typeof path === "string" ? path : null;
}

export async function saveAsDialog(defaultName = "untitled.md"): Promise<string | null> {
  const path = await save({
    defaultPath: defaultName,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  return path;
}

export { BaseDirectory };
