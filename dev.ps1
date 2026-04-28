# ── Comala Dev Mode ──────────────────────────────────────────────────
# Runs the app in development mode with HOT RELOAD.
# Frontend changes (React/CSS) update INSTANTLY — no rebuild needed.
# Only Rust backend changes require a recompile (but even that is fast
# because the dev profile uses incremental compilation).
#
# Usage:  .\dev.ps1
# Stop:   Ctrl+C in the terminal

$env:RUST_MIN_STACK = "134217728"
$env:CARGO_BUILD_JOBS = "1"

Write-Host "`n=== Starting Comala Dev Mode ===" -ForegroundColor Cyan
Write-Host "Frontend changes will hot-reload automatically." -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor DarkGray

npx tauri dev
