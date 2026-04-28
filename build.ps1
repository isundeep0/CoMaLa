# ── Comala Build Script ──────────────────────────────────────────────
# Run this after code changes to build the Tauri app.
# The installer will be at: src-tauri\target\release\bundle\nsis\COMALA_0.1.0_x64-setup.exe

# Ensure Rust doesn't crash on heavy proc-macro crates (windows-sys)
$env:RUST_MIN_STACK = "134217728"
$env:CARGO_BUILD_JOBS = "1"

Write-Host "`n=== Building Comala ===" -ForegroundColor Cyan
Write-Host ""

# Run the full Tauri build (frontend + Rust + NSIS installer)
npx tauri build

if ($LASTEXITCODE -eq 0) {
    $installer = Join-Path $PSScriptRoot "src-tauri\target\release\bundle\nsis\COMALA_0.1.0_x64-setup.exe"
    Write-Host ""
    Write-Host "=== Build Successful ===" -ForegroundColor Green
    Write-Host "Installer: $installer" -ForegroundColor Green
    Write-Host "Executable: $(Join-Path $PSScriptRoot 'src-tauri\target\release\comala.exe')" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== Build Failed ===" -ForegroundColor Red
    exit 1
}
