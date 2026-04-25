import { useEffect } from "react";
import { X } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { pickVaultDir } from "@/lib/vault";

interface Props {
  open: boolean;
  onClose: () => void;
  onVaultChange: (path: string) => void;
}

export default function SettingsModal({ open, onClose, onVaultChange }: Props) {
  const settings = useSettingsStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
      <div>
        <div className="text-[13px] font-medium text-[var(--text)]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--text-dim)] mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const handlePickVault = async () => {
    const path = await pickVaultDir();
    if (path) onVaultChange(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-modal rounded-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold tracking-tight">Settings</h2>
          <button onClick={onClose} className="glass-btn glass-btn-icon">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-0">
          <Row label="Vault path" hint={settings.vaultPath || "Not set"}>
            <button onClick={handlePickVault} className="glass-btn text-[12px]">
              Choose…
            </button>
          </Row>

          <Row label="Editor font size" hint="12 – 22 px">
            <input
              type="number"
              min={12}
              max={22}
              value={settings.editorFontSize}
              onChange={(e) => settings.set("editorFontSize", Number(e.target.value))}
              className="glass-input w-20 px-2 py-1 rounded-md text-[12px] text-right"
            />
          </Row>

          <Row label="Editor font family">
            <select
              value={settings.editorFontFamily}
              onChange={(e) => settings.set("editorFontFamily", e.target.value)}
              className="glass-input px-2 py-1 rounded-md text-[12px]"
            >
              <option>JetBrains Mono</option>
              <option>Fira Code</option>
              <option>Cascadia Code</option>
              <option>Consolas</option>
              <option>Courier New</option>
            </select>
          </Row>

          <Row label="Preview font size">
            <input
              type="number"
              min={12}
              max={22}
              value={settings.previewFontSize}
              onChange={(e) => settings.set("previewFontSize", Number(e.target.value))}
              className="glass-input w-20 px-2 py-1 rounded-md text-[12px] text-right"
            />
          </Row>

          <Row label="Tab size">
            <select
              value={settings.tabSize}
              onChange={(e) => settings.set("tabSize", Number(e.target.value) as 2 | 4)}
              className="glass-input px-2 py-1 rounded-md text-[12px]"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </Row>

          <Row label="Word wrap">
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => settings.set("wordWrap", e.target.checked)}
              className="accent-[var(--accent)] w-4 h-4"
            />
          </Row>

          <Row label="Auto-save" hint="Save 2 seconds after last keystroke">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => settings.set("autoSave", e.target.checked)}
              className="accent-[var(--accent)] w-4 h-4"
            />
          </Row>

          <Row label="Open last note on startup">
            <input
              type="checkbox"
              checked={settings.openLastNote}
              onChange={(e) => settings.set("openLastNote", e.target.checked)}
              className="accent-[var(--accent)] w-4 h-4"
            />
          </Row>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-end">
          <button onClick={onClose} className="accent-btn glass-btn px-4 text-[12px]">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
