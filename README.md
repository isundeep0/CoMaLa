# COMALA — Code · Markdown · LaTeX

A fast, offline-first desktop markdown editor with live preview, vault-based note organization, and multi-format export. Built with Tauri 2, React 19, and CodeMirror 6.

## Features

- **Live split editor** — Write markdown on the left, see rendered output on the right (or switch to editor-only / preview-only mode)
- **Vault system** — Organize notes into notebooks (folders). Root-level files auto-group into an "Inbox"
- **Wiki-links** — Link between notes with `[[Note Name]]` syntax
- **LaTeX math** — Inline and block math via KaTeX (`$...$` and `$$...$$`)
- **Mermaid diagrams** — Render diagrams from fenced code blocks
- **Syntax-highlighted code** — With copy-to-clipboard buttons on every code block
- **GitHub Flavored Markdown** — Tables, task lists, strikethrough, and more
- **Auto-save** — Saves 2 seconds after you stop typing (configurable)
- **HTML export** — Self-contained HTML files with embedded styles, math, and syntax highlighting
- **Plain `.md` files** — Human-readable, version-control friendly. No lock-in
- **Recent vaults** — Quickly switch between your last 5 vaults
- **Customizable** — Font family, font size, tab size, word wrap, and more

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop runtime | [Tauri 2](https://tauri.app/) (Rust) |
| Frontend | [React 19](https://react.dev/) + TypeScript |
| Bundler | [Vite](https://vitejs.dev/) |
| Editor | [CodeMirror 6](https://codemirror.net/) |
| Markdown pipeline | [Unified](https://unifiedjs.com/) / Remark / Rehype |
| Math rendering | [KaTeX](https://katex.org/) |
| Diagrams | [Mermaid](https://mermaid.js.org/) |
| Syntax highlighting | [Highlight.js](https://highlightjs.org/) |
| State management | [Zustand](https://zustand.docs.pmnd.rs/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [MSVC Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows) — includes the Windows SDK

## Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/Comala.git
cd Comala

# Install frontend dependencies
npm install

# Run in development mode (opens the app with hot-reload)
npm run tauri dev
```

## Building for Production

### Quick build (Windows)

```powershell
.\build.ps1
```

This sets the required environment variables and produces an NSIS installer at:

```
src-tauri\target\release\bundle\nsis\COMALA_0.1.0_x64-setup.exe
```

### Manual build

```powershell
# Required on Windows to avoid Rust compiler stack overflows with large crates
$env:RUST_MIN_STACK = "67108864"    # 64 MB
$env:CARGO_BUILD_JOBS = "2"

npx tauri build
```

The standalone executable is at `src-tauri\target\release\comala.exe`.

## Usage

1. **Open or create a vault** — A vault is just a folder on disk. Pick any empty or existing folder.
2. **Create notebooks** — Right-click in the sidebar to add folders (notebooks).
3. **Create notes** — Click the + button or press `Ctrl+N`.
4. **Write markdown** — The editor supports GFM, LaTeX math, Mermaid diagrams, and wiki-links.
5. **Export** — Press `Ctrl+Shift+X` to export the current note as a self-contained HTML file.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save |
| `Ctrl+N` | New note |
| `Ctrl+O` | Open vault |
| `Ctrl+,` | Settings |
| `Ctrl+\` | Toggle sidebar |
| `Ctrl+F` | Find in editor |
| `Ctrl+Shift+X` | Export note |
| `Ctrl+Shift+E` | Editor view |
| `Ctrl+Shift+P` | Preview view |
| `Ctrl+Shift+B` | Split view |

## Settings

Settings are accessible via `Ctrl+,` and persist to `.comala/settings.json` inside your vault.

| Option | Default |
|--------|---------|
| Editor font family | JetBrains Mono |
| Editor font size | 14 px |
| Preview font size | 15 px |
| Tab size | 2 |
| Word wrap | On |
| Auto-save | On |
| Open last note on startup | On |

## Project Structure

```
src/                  # React frontend
  components/         # UI components (editor, preview, sidebar, settings, etc.)
  hooks/              # Custom hooks (auto-save, hotkeys)
  lib/                # Core logic (renderer, exporters, vault I/O)
  store/              # Zustand stores (editor, settings, vault state)
  styles/             # Global CSS / Tailwind
src-tauri/            # Tauri / Rust backend
  src/                # Rust source
  tauri.conf.json     # App config (window size, bundle targets, etc.)
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

MIT
