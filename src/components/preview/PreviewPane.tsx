import { useEffect, useState } from "react";
import { renderMarkdown } from "@/lib/renderer";
import { renderMermaidBlocks } from "@/lib/mermaid";
import { useEditorStore } from "@/store/useEditorStore";
import { useVaultStore } from "@/store/useVaultStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { readNote } from "@/lib/vault";
import { debounce } from "@/lib/utils";

export default function PreviewPane() {
  const content = useEditorStore((s) => s.content);
  const openNote = useEditorStore((s) => s.openNote);
  const notes = useVaultStore((s) => s.notes);
  const fontSize = useSettingsStore((s) => s.previewFontSize);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const update = debounce(async (md: string) => {
      const out = await renderMarkdown(md);
      setHtml(out);
    }, 150);
    update(content);
  }, [content]);

  // Click handler: code-copy + wiki-link navigation
  useEffect(() => {
    const handler = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest<HTMLButtonElement>("button[data-copy]");
      if (copyBtn) {
        const pre = copyBtn.closest("pre");
        if (!pre) return;
        const code = pre.querySelector("code")?.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
        } catch {}
        return;
      }
      const wikiLink = target.closest<HTMLAnchorElement>("a[data-wikilink]");
      if (wikiLink) {
        e.preventDefault();
        const name = wikiLink.dataset.wikilink!;
        const note = notes.find(
          (n) => n.name.toLowerCase() === name.toLowerCase(),
        );
        if (note) {
          try {
            const c = await readNote(note.path);
            openNote(note.id, note.path, note.name, c);
          } catch {}
        } else {
          alert(`Note "${name}" not found in vault.`);
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [notes, openNote]);

  // Inject copy buttons + render mermaid + transform [[wikilinks]]
  useEffect(() => {
    const root = document.getElementById("preview-root");
    if (!root) return;
    // Copy buttons
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector("button[data-copy]")) return;
      const btn = document.createElement("button");
      btn.dataset.copy = "true";
      btn.textContent = "Copy";
      btn.className =
        "absolute top-2 right-2 px-2 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors";
      pre.style.position = "relative";
      pre.appendChild(btn);
    });
    // Mermaid blocks
    renderMermaidBlocks(root);
    // Wiki links: replace [[Note Name]] occurrences in text nodes
    transformWikiLinks(root);
  }, [html]);

  return (
    <div className="h-full overflow-y-auto glass-panel">
      <div
        id="preview-root"
        className="article max-w-3xl mx-auto px-8 py-8"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function transformWikiLinks(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (["code", "pre", "a", "script", "style"].includes(tag))
        return NodeFilter.FILTER_REJECT;
      return /\[\[[^\]]+\]\]/.test(node.nodeValue || "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) targets.push(n as Text);
  for (const text of targets) {
    const parts = (text.nodeValue || "").split(/(\[\[[^\]]+\]\])/g);
    if (parts.length === 1) continue;
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      const m = part.match(/^\[\[([^\]]+)\]\]$/);
      if (m) {
        const a = document.createElement("a");
        a.href = "#";
        a.dataset.wikilink = m[1].trim();
        a.textContent = m[1].trim();
        a.className =
          "text-[var(--accent-hover)] underline decoration-dotted decoration-[var(--accent)] underline-offset-2";
        frag.appendChild(a);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }
    text.replaceWith(frag);
  }
}
