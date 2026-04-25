import { useEditorStore } from "@/store/useEditorStore";
import { wordCount, readTime } from "@/lib/utils";
import { Circle, CheckCircle2, Loader2 } from "lucide-react";

export default function StatusBar() {
  const { content, cursor, saveStatus, activeName } = useEditorStore();
  const wc = wordCount(content);
  const rt = readTime(content);

  const StatusIcon = () => {
    if (saveStatus === "saving") return <Loader2 size={11} className="animate-spin text-[var(--accent)]" />;
    if (saveStatus === "saved") return <CheckCircle2 size={11} className="text-[var(--success)]" />;
    if (saveStatus === "dirty") return <Circle size={11} className="text-[var(--warning)] fill-[var(--warning)]" />;
    return <Circle size={11} className="text-[var(--text-dim)]" />;
  };

  return (
    <div className="glass-statusbar h-7 flex items-center px-3 gap-4 text-[11px] text-[var(--text-muted)] select-none">
      <div className="flex items-center gap-1.5">
        <StatusIcon />
        <span>
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "dirty"
            ? "Unsaved"
            : saveStatus === "saved"
            ? "Saved"
            : "—"}
        </span>
      </div>
      <span className="text-[var(--text-dim)]">|</span>
      <span className="truncate max-w-xs">{activeName || "No file"}</span>
      <div className="flex-1" />
      <span>Ln {cursor.line}, Col {cursor.col}</span>
      <span className="text-[var(--text-dim)]">·</span>
      <span>{wc} words</span>
      <span className="text-[var(--text-dim)]">·</span>
      <span>{rt} min read</span>
    </div>
  );
}
