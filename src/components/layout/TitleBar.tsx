import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  const handleMinimize = () => appWindow.minimize();
  const handleToggleMaximize = async () => {
    await appWindow.toggleMaximize();
    setMaximized(await appWindow.isMaximized());
  };
  const handleClose = () => appWindow.close();

  return (
    <div
      className="titlebar flex items-center justify-between select-none"
      data-tauri-drag-region
    >
      {/* Left: App branding */}
      <div className="flex items-center gap-2 pl-3 pointer-events-none" data-tauri-drag-region>
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent)] to-[#5b4fcf] flex items-center justify-center shadow-[0_2px_8px_var(--accent-glow)]">
          <span className="text-white text-[10px] font-bold leading-none">C</span>
        </div>
        <span className="text-[11px] font-semibold tracking-wide text-[var(--text-muted)]" data-tauri-drag-region>
          COMALA
        </span>
        <span className="text-[9px] text-[var(--text-dim)] hidden sm:inline" data-tauri-drag-region>
          Code · Markdown · LaTeX
        </span>
      </div>

      {/* Right: macOS-style traffic light buttons */}
      <div className="flex items-center gap-2 pr-3 traffic-lights">
        <button
          onClick={handleMinimize}
          className="traffic-btn traffic-yellow"
          title="Minimize"
        >
          <svg width="6" height="1" viewBox="0 0 6 1" className="traffic-icon">
            <rect width="6" height="1" rx="0.5" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={handleToggleMaximize}
          className="traffic-btn traffic-green"
          title={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? (
            <svg width="6" height="6" viewBox="0 0 6 6" className="traffic-icon">
              <path d="M1.5 0.5L4.5 3.5M4.5 0.5L1.5 3.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="6" height="6" viewBox="0 0 6 6" className="traffic-icon">
              <path d="M0.5 3.5L3 0.5L5.5 3.5M0.5 5.5L3 2.5L5.5 5.5" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          className="traffic-btn traffic-red"
          title="Close"
        >
          <svg width="6" height="6" viewBox="0 0 6 6" className="traffic-icon">
            <path d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
