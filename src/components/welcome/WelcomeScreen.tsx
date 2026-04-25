import { FolderOpen, Sparkles, Settings, Clock, Folder } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Props {
  onPickVault: () => void;
  onOpenSettings: () => void;
  onOpenRecent: (path: string) => void;
}

export default function WelcomeScreen({ onPickVault, onOpenSettings, onOpenRecent }: Props) {
  const recentVaults = useSettingsStore((s) => s.recentVaults) || [];

  return (
    <div className="h-full flex items-center justify-center p-8 animate-fade-in">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#5b4fcf] flex items-center justify-center shadow-[0_8px_32px_var(--accent-glow-strong)] animate-pulse-glow">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">COMALA</h1>
            <p className="text-[12px] text-[var(--text-dim)]">Code · Markdown · LaTeX</p>
          </div>
        </div>

        {/* Start */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-dim)] mb-3">
            Start
          </h2>
          <div className="space-y-0.5">
            <button
              onClick={onPickVault}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04] transition-colors text-left"
            >
              <FolderOpen size={16} className="text-[var(--accent)] shrink-0" />
              <span className="flex-1">Open Folder…</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04] transition-colors text-left"
            >
              <Settings size={16} className="text-[var(--accent)] shrink-0" />
              <span className="flex-1">Settings</span>
              <kbd className="text-[10px] text-[var(--text-dim)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--border)]">
                Ctrl+,
              </kbd>
            </button>
          </div>
        </section>

        {/* Recent */}
        {recentVaults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-dim)] mb-3 flex items-center gap-1.5">
              <Clock size={11} />
              Recent
            </h2>
            <div className="space-y-0.5">
              {recentVaults.map((path) => (
                <button
                  key={path}
                  onClick={() => onOpenRecent(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Folder size={15} className="text-[var(--accent)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--text)] truncate">
                      {path.split(/[\\/]/).pop()}
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] truncate">{path}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Footer hint */}
        <p className="text-[10px] text-[var(--text-dim)] mt-6">
          Choose a folder to store your notes as plain{" "}
          <code className="px-1 bg-white/5 rounded">.md</code> files. You can change this later
          in Settings.
        </p>
      </div>
    </div>
  );
}
