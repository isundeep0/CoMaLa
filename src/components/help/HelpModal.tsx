import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  Keyboard,
  Type,
  Sigma,
  GitBranch,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "shortcuts" | "markdown" | "latex" | "mermaid" | "about";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={13} /> },
  { id: "markdown", label: "Markdown", icon: <Type size={13} /> },
  { id: "latex", label: "LaTeX", icon: <Sigma size={13} /> },
  { id: "mermaid", label: "Diagrams", icon: <GitBranch size={13} /> },
  { id: "about", label: "About", icon: <Info size={13} /> },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] border border-[var(--border)] text-[var(--text-muted)]">
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  const parts = keys.split("+").map((k) => k.trim());
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-dim)]">
      <span className="text-[12px] text-[var(--text-muted)]">{desc}</span>
      <div className="flex items-center gap-1">
        {parts.map((p, i) => (
          <span key={i}>
            <Kbd>{p}</Kbd>
            {i < parts.length - 1 && <span className="text-[var(--text-dim)] mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShortcutsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-2">File</h4>
        <ShortcutRow keys="Ctrl + N" desc="New note" />
        <ShortcutRow keys="Ctrl + O" desc="Open file" />
        <ShortcutRow keys="Ctrl + S" desc="Save" />
        <ShortcutRow keys="Ctrl + Shift + X" desc="Export to HTML" />
      </div>
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-2">View</h4>
        <ShortcutRow keys="Ctrl + \\" desc="Toggle sidebar" />
        <ShortcutRow keys="Ctrl + Shift + E" desc="Editor only" />
        <ShortcutRow keys="Ctrl + Shift + B" desc="Split view" />
        <ShortcutRow keys="Ctrl + Shift + P" desc="Preview only" />
        <ShortcutRow keys="Ctrl + ," desc="Settings" />
      </div>
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-2">Edit</h4>
        <ShortcutRow keys="Ctrl + F" desc="Find & replace" />
        <ShortcutRow keys="Ctrl + B" desc="Bold" />
        <ShortcutRow keys="Ctrl + I" desc="Italic" />
        <ShortcutRow keys="Ctrl + K" desc="Insert link" />
        <ShortcutRow keys="Ctrl + Z" desc="Undo" />
        <ShortcutRow keys="Ctrl + Shift + Z" desc="Redo" />
      </div>
    </div>
  );
}

function MarkdownTab() {
  const examples = [
    { syntax: "# Heading 1", desc: "Heading level 1" },
    { syntax: "## Heading 2", desc: "Heading level 2" },
    { syntax: "### Heading 3", desc: "Heading level 3" },
    { syntax: "**bold text**", desc: "Bold" },
    { syntax: "*italic text*", desc: "Italic" },
    { syntax: "~~strikethrough~~", desc: "Strikethrough" },
    { syntax: "`inline code`", desc: "Inline code" },
    { syntax: "[link text](url)", desc: "Hyperlink" },
    { syntax: "![alt](image-url)", desc: "Image" },
    { syntax: "- item", desc: "Unordered list" },
    { syntax: "1. item", desc: "Ordered list" },
    { syntax: "- [ ] task", desc: "Task list" },
    { syntax: "> quote", desc: "Blockquote" },
    { syntax: "---", desc: "Horizontal rule" },
    { syntax: "```lang\\ncode\\n```", desc: "Code block" },
    { syntax: "| H1 | H2 |\\n|---|---|\\n| A | B |", desc: "Table" },
    { syntax: "==highlight==", desc: "Highlight" },
    { syntax: "^superscript^", desc: "Superscript" },
    { syntax: "~subscript~", desc: "Subscript" },
    { syntax: "[^1]: footnote", desc: "Footnote" },
  ];

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-[var(--text-dim)] mb-3">
        COMALA supports full Markdown syntax. Here's a quick reference:
      </p>
      {examples.map((ex, i) => (
        <div key={i} className="flex items-start justify-between py-1 border-b border-[var(--border-dim)]">
          <span className="text-[12px] text-[var(--text-muted)]">{ex.desc}</span>
          <code className="text-[11px] font-mono text-[var(--accent-hover)] bg-white/[0.04] px-1.5 py-0.5 rounded max-w-[200px] text-right">
            {ex.syntax}
          </code>
        </div>
      ))}
    </div>
  );
}

function LatexTab() {
  const examples = [
    { syntax: "$x^2 + y^2 = z^2$", desc: "Inline math" },
    { syntax: "$$\\\\int_0^\\\\infty e^{-x}\\\\,dx$$", desc: "Block math" },
    { syntax: "\\\\frac{a}{b}", desc: "Fraction" },
    { syntax: "\\\\sqrt{x}", desc: "Square root" },
    { syntax: "\\\\sum_{i=1}^{n}", desc: "Summation" },
    { syntax: "\\\\prod_{i=1}^{n}", desc: "Product" },
    { syntax: "\\\\lim_{x \\\\to 0}", desc: "Limit" },
    { syntax: "\\\\alpha, \\\\beta, \\\\gamma", desc: "Greek letters" },
    { syntax: "\\\\begin{matrix}...\\\\end{matrix}", desc: "Matrix" },
    { syntax: "\\\\vec{v}, \\\\hat{x}", desc: "Vectors & hats" },
    { syntax: "\\\\left( ... \\\\right)", desc: "Auto-sized parens" },
    { syntax: "\\\\mathbb{R}, \\\\mathcal{L}", desc: "Special fonts" },
  ];

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-[var(--text-dim)] mb-3">
        Use KaTeX syntax for math. Wrap inline math in <code className="text-[var(--accent-hover)]">$...$</code> and display math in <code className="text-[var(--accent-hover)]">$$...$$</code>.
      </p>
      {examples.map((ex, i) => (
        <div key={i} className="flex items-start justify-between py-1 border-b border-[var(--border-dim)]">
          <span className="text-[12px] text-[var(--text-muted)]">{ex.desc}</span>
          <code className="text-[11px] font-mono text-[var(--accent-hover)] bg-white/[0.04] px-1.5 py-0.5 rounded max-w-[220px] text-right break-all">
            {ex.syntax}
          </code>
        </div>
      ))}
    </div>
  );
}

function MermaidTab() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[var(--text-dim)] mb-3">
        Create diagrams using Mermaid syntax inside fenced code blocks with the <code className="text-[var(--accent-hover)]">mermaid</code> language tag.
      </p>
      <div>
        <h4 className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Flowchart</h4>
        <pre className="text-[11px] font-mono bg-white/[0.03] border border-[var(--border-dim)] rounded-lg p-2.5 text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[End]
\`\`\``}
        </pre>
      </div>
      <div>
        <h4 className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Sequence Diagram</h4>
        <pre className="text-[11px] font-mono bg-white/[0.03] border border-[var(--border-dim)] rounded-lg p-2.5 text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi!
\`\`\``}
        </pre>
      </div>
      <div>
        <h4 className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Pie Chart</h4>
        <pre className="text-[11px] font-mono bg-white/[0.03] border border-[var(--border-dim)] rounded-lg p-2.5 text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
pie title Pets
  "Dogs" : 40
  "Cats" : 35
  "Birds" : 25
\`\`\``}
        </pre>
      </div>
      <div>
        <h4 className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Gantt Chart</h4>
        <pre className="text-[11px] font-mono bg-white/[0.03] border border-[var(--border-dim)] rounded-lg p-2.5 text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
gantt
  title Project
  section Tasks
    Design :a1, 2024-01-01, 7d
    Develop :a2, after a1, 14d
\`\`\``}
        </pre>
      </div>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#5b4fcf] flex items-center justify-center shadow-[0_4px_16px_var(--accent-glow)]">
          <span className="text-white text-[16px] font-bold">C</span>
        </div>
        <div>
          <h3 className="text-[15px] font-bold">COMALA</h3>
          <p className="text-[11px] text-[var(--text-dim)]">Code · Markdown · LaTeX</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold">Features</h4>
        <ul className="text-[12px] text-[var(--text-muted)] space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Full Markdown editing with live preview</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>KaTeX math rendering (inline & display)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Mermaid diagram support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Syntax-highlighted code blocks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Vault-based file management</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Auto-save & manual save</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>HTML export</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            <span>Split view (editor / preview / both)</span>
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold">Tips</h4>
        <ul className="text-[12px] text-[var(--text-muted)] space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="text-[var(--success)] mt-0.5">→</span>
            <span>Create folders (notebooks) to organize notes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--success)] mt-0.5">→</span>
            <span>Use the toolbar for quick formatting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--success)] mt-0.5">→</span>
            <span>Toggle between editor, split, and preview modes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--success)] mt-0.5">→</span>
            <span>Drag the divider to resize editor/preview panes</span>
          </li>
        </ul>
      </div>

      <p className="text-[10px] text-[var(--text-dim)] pt-2 border-t border-[var(--border-dim)]">
        Version 0.1.0 · Built with Tauri, React & CodeMirror
      </p>
    </div>
  );
}

export default function HelpModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("shortcuts");

  return (
    <Dialog open={open} onClose={onClose} title="Help & Reference" wide>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-[var(--accent-glow)] text-[var(--accent-hover)] border border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-white/[0.04] border border-transparent",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-1 help-scroll">
        {activeTab === "shortcuts" && <ShortcutsTab />}
        {activeTab === "markdown" && <MarkdownTab />}
        {activeTab === "latex" && <LatexTab />}
        {activeTab === "mermaid" && <MermaidTab />}
        {activeTab === "about" && <AboutTab />}
      </div>
    </Dialog>
  );
}
