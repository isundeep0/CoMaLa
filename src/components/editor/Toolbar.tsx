import { EditorView } from "@codemirror/view";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Sigma,
  FileCode,
  Table as TableIcon,
  Highlighter,
  Superscript,
  Subscript,
  Footprints,
  GitBranch,
  MessageSquareQuote,
  Smile,
  Undo2,
  Redo2,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { openImageFile, copyImageToVault } from "@/lib/vault";
import { useVaultStore } from "@/store/useVaultStore";

import { undo, redo } from "@codemirror/commands";

interface Props {
  view: EditorView | null;
}

function dispatch(view: EditorView | null, transform: (sel: string) => { text: string; cursorOffset?: number }) {
  if (!view) return;
  const sel = view.state.selection.main;
  const selectedText = view.state.sliceDoc(sel.from, sel.to);
  const { text, cursorOffset } = transform(selectedText);
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: {
      anchor: cursorOffset !== undefined ? sel.from + cursorOffset : sel.from + text.length,
    },
  });
  view.focus();
}

function wrap(view: EditorView | null, prefix: string, suffix = prefix, placeholder = "") {
  dispatch(view, (sel) => {
    const inner = sel || placeholder;
    return {
      text: `${prefix}${inner}${suffix}`,
      cursorOffset: prefix.length + inner.length,
    };
  });
}

function prefixLines(view: EditorView | null, prefix: string) {
  if (!view) return;
  const sel = view.state.selection.main;
  const fromLine = view.state.doc.lineAt(sel.from);
  const toLine = view.state.doc.lineAt(sel.to);
  const changes: { from: number; to: number; insert: string }[] = [];
  for (let n = fromLine.number; n <= toLine.number; n++) {
    const line = view.state.doc.line(n);
    changes.push({ from: line.from, to: line.from, insert: prefix });
  }
  view.dispatch({ changes });
  view.focus();
}

function insertBlock(view: EditorView | null, block: string) {
  if (!view) return;
  const sel = view.state.selection.main;
  const before = sel.from > 0 && view.state.doc.sliceString(sel.from - 1, sel.from) !== "\n" ? "\n" : "";
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: before + block },
    selection: { anchor: sel.from + before.length + block.length },
  });
  view.focus();
}

const Btn = ({
  title,
  onClick,
  children,
  active,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <button
    title={title}
    onClick={onClick}
    className={cn("glass-btn glass-btn-icon", active && "active")}
  >
    {children}
  </button>
);

const Sep = () => <span className="w-px h-5 bg-white/8 mx-1" />;

export default function Toolbar({ view }: Props) {
  const vaultPath = useVaultStore((s) => s.vaultPath);

  const insertTable = () => {
    insertBlock(
      view,
      "| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n",
    );
  };
  const insertCodeBlock = () => {
    insertBlock(view, "```language\ncode here\n```\n");
  };
  const insertMermaid = () => {
    insertBlock(view, "```mermaid\ngraph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action]\n  B -->|No| D[End]\n```\n");
  };
  const insertCallout = () => {
    insertBlock(view, "> [!NOTE]\n> Your note content here\n");
  };
  const insertFootnote = () => {
    dispatch(view, (sel) => {
      const label = sel || "1";
      return { text: `[^${label}]`, cursorOffset: 2 + label.length };
    });
  };
  const insertEmoji = () => {
    dispatch(view, () => ({ text: "😀", cursorOffset: 2 }));
  };

  const handleInsertImage = async () => {
    const imagePath = await openImageFile();
    if (!imagePath) return;
    if (vaultPath) {
      try {
        const relativePath = await copyImageToVault(imagePath, vaultPath);
        dispatch(view, (sel) => {
          const alt = sel || "image";
          return { text: `![${alt}](${relativePath})`, cursorOffset: 2 + alt.length };
        });
      } catch {
        // Fallback to absolute path
        dispatch(view, (sel) => {
          const alt = sel || "image";
          return { text: `![${alt}](${imagePath})`, cursorOffset: 2 + alt.length };
        });
      }
    } else {
      dispatch(view, (sel) => {
        const alt = sel || "image";
        return { text: `![${alt}](${imagePath})`, cursorOffset: 2 + alt.length };
      });
    }
  };

  return (
    <div className="glass-toolbar flex items-center gap-1 px-3 py-2 fluid-highlight flex-wrap">
      {/* Undo / Redo */}
      <Btn title="Undo (Ctrl+Z)" onClick={() => view && undo(view)}>
        <Undo2 size={14} />
      </Btn>
      <Btn title="Redo (Ctrl+Shift+Z)" onClick={() => view && redo(view)}>
        <Redo2 size={14} />
      </Btn>
      <Sep />
      <Btn title="Heading 1 (#)" onClick={() => prefixLines(view, "# ")}>
        <Heading1 size={15} />
      </Btn>
      <Btn title="Heading 2 (##)" onClick={() => prefixLines(view, "## ")}>
        <Heading2 size={15} />
      </Btn>
      <Btn title="Heading 3 (###)" onClick={() => prefixLines(view, "### ")}>
        <Heading3 size={15} />
      </Btn>
      <Sep />
      <Btn title="Bold (Ctrl+B)" onClick={() => wrap(view, "**", "**", "bold")}>
        <Bold size={14} />
      </Btn>
      <Btn title="Italic (Ctrl+I)" onClick={() => wrap(view, "*", "*", "italic")}>
        <Italic size={14} />
      </Btn>
      <Btn title="Strikethrough" onClick={() => wrap(view, "~~", "~~", "text")}>
        <Strikethrough size={14} />
      </Btn>
      <Btn title="Highlight" onClick={() => wrap(view, "==", "==", "highlighted")}>
        <Highlighter size={14} />
      </Btn>
      <Btn title="Inline code" onClick={() => wrap(view, "`", "`", "code")}>
        <Code size={14} />
      </Btn>
      <Btn title="Superscript" onClick={() => wrap(view, "^", "^", "sup")}>
        <Superscript size={14} />
      </Btn>
      <Btn title="Subscript" onClick={() => wrap(view, "~", "~", "sub")}>
        <Subscript size={14} />
      </Btn>
      <Sep />
      <Btn title="Link (Ctrl+K)" onClick={() => wrap(view, "[", "](url)", "link text")}>
        <LinkIcon size={14} />
      </Btn>
      <Btn title="Image (markdown syntax)" onClick={() => wrap(view, "![", "](image-url)", "alt")}>
        <ImageIcon size={14} />
      </Btn>
      <Btn title="Insert image from file" onClick={handleInsertImage}>
        <ImagePlus size={14} />
      </Btn>
      <Btn title="Footnote" onClick={insertFootnote}>
        <Footprints size={14} />
      </Btn>
      <Sep />
      <Btn title="Bulleted list" onClick={() => prefixLines(view, "- ")}>
        <List size={14} />
      </Btn>
      <Btn title="Numbered list" onClick={() => prefixLines(view, "1. ")}>
        <ListOrdered size={14} />
      </Btn>
      <Btn title="Task list" onClick={() => prefixLines(view, "- [ ] ")}>
        <ListChecks size={14} />
      </Btn>
      <Btn title="Quote" onClick={() => prefixLines(view, "> ")}>
        <Quote size={14} />
      </Btn>
      <Btn title="Callout / Admonition" onClick={insertCallout}>
        <MessageSquareQuote size={14} />
      </Btn>
      <Btn title="Horizontal rule" onClick={() => insertBlock(view, "\n---\n")}>
        <Minus size={14} />
      </Btn>
      <Sep />
      <Btn title="Table" onClick={insertTable}>
        <TableIcon size={14} />
      </Btn>
      <Btn title="Code block" onClick={insertCodeBlock}>
        <FileCode size={14} />
      </Btn>
      <Btn title="Mermaid diagram" onClick={insertMermaid}>
        <GitBranch size={14} />
      </Btn>
      <Btn title="Inline math $...$" onClick={() => wrap(view, "$", "$", "x")}>
        <Sigma size={14} />
      </Btn>
      <Btn title="Block math $$...$$" onClick={() => insertBlock(view, "$$\n\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}\n$$\n")}>
        <span className="font-serif text-[15px] leading-none">∑∑</span>
      </Btn>
      <Sep />
      <Btn title="Emoji" onClick={insertEmoji}>
        <Smile size={14} />
      </Btn>
    </div>
  );
}
