import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  const handleMinimize = () => {
    getCurrentWindow().minimize();
  };
  const handleToggleMaximize = async () => {
    const win = getCurrentWindow();
    await win.toggleMaximize();
    setMaximized(await win.isMaximized());
  };
  const handleClose = () => {
    getCurrentWindow().destroy();
  };

  return (
    <div
      className="titlebar flex items-center justify-between select-none"
      data-tauri-drag-region
    >
      {/* Left: App branding */}
      <div className="flex items-center gap-2 pl-3" data-tauri-drag-region>
        <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[var(--accent)] to-[#5b4fcf] flex items-center justify-center shadow-[0_2px_8px_var(--accent-glow)]">
          <span className="text-white text-[9px] font-bold leading-none">C</span>
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)]" data-tauri-drag-region>
          COMALA
        </span>
      </div>

      {/* Right: window control buttons */}
      <div className="flex items-center traffic-lights" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="window-btn window-btn-minimize"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" rx="0.5" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={handleToggleMaximize}
          className="window-btn window-btn-maximize"
          title={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
              <rect x="0" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="var(--bg)" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          className="window-btn window-btn-close"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
