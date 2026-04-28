# COMALA — UI Layout Guide

This document describes the visual structure of the Comala editor so you know what each part is called.

```
┌─────────────────────────────────────────────────────────┐
│  TITLE BAR  (28px)              [─] [□] [✕]            │  ← Window controls
├────────┬────────────────────────────────────────────────┤
│        │  TOP TOOLBAR  (action bar)                     │  ← Open / Save / Export / View mode
│        ├────────────────────────────────────────────────┤
│        │  FORMATTING TOOLBAR (editor toolbar)           │  ← Bold / Italic / Headings / etc.
│        ├──────────────────────┬─────────────────────────┤
│        │  TAB BAR             │                         │  ← Open file tabs + [+] new tab
│ SIDE-  ├──────────────────────┼─────────────────────────┤
│  BAR   │                      │                         │
│        │   EDITOR PANE        │   PREVIEW PANE          │
│ (file  │   (CodeMirror)       │   (rendered HTML)       │
│  tree) │                      │                         │
│        │                      │                         │
│        │                      │                         │
│        ├──────────────────────┴─────────────────────────┤
│        │  STATUS BAR  (28px)                            │  ← Save status · Ln/Col · Word count
└────────┴────────────────────────────────────────────────┘
```

## Parts Breakdown

### 1. Title Bar (`TitleBar.tsx`)
- **Location**: Very top of the window.
- **Height**: 28 px.
- **Contains**: App logo + name on the left; **Minimize** (─), **Maximize** (□), **Close** (✕) buttons on the right.
- **Draggable**: The entire bar is a drag region (you can move the window by dragging it).

### 2. Sidebar (`Sidebar.tsx`)
- **Location**: Left edge.
- **Width**: Configurable (default ~240 px).
- **Contains**: A file tree showing notebooks (folders) and notes (.md files). Also has buttons to create notebooks/notes, rename, delete, and a search filter.
- **Toggle**: Click the sidebar button in the Top Toolbar, or press `Ctrl+\`.

### 3. Top Toolbar (inside `AppShell.tsx`)
- **Location**: Top of the main area, right of the sidebar.
- **Contains**:
  - **Left group**: Sidebar toggle, current file name.
  - **Right group**: Open, Save, Export, Search, view-mode buttons (Editor / Split / Preview), Help.

### 4. Formatting Toolbar (`Toolbar.tsx`)
- **Location**: Below the Top Toolbar, only visible in Editor or Split view.
- **Contains**: Markdown formatting buttons organized in groups — Undo/Redo, Headings, Bold/Italic/Strike, Links, Lists, Code blocks, Tables, Mermaid, Math, Emoji, etc.

### 5. Tab Bar (`TabBar.tsx`)
- **Location**: Below the Formatting Toolbar.
- **Contains**: One tab per open file. Each tab shows the file name, a dirty indicator (orange dot if unsaved), and a close (✕) button. A **[+]** button at the end creates a new untitled tab.
- **Shortcuts**: `Ctrl+N` = new tab, `Ctrl+W` = close tab.

### 6. Editor Pane (`EditorPane.tsx`)
- **Location**: Left side of the editing area (or full width in Editor-only mode).
- **Contains**: A CodeMirror 6 text editor for Markdown. Shows line numbers, syntax highlighting, active line highlight.

### 7. Preview Pane (`PreviewPane.tsx`)
- **Location**: Right side of the editing area (or full width in Preview-only mode).
- **Contains**: Live-rendered HTML of the Markdown you're typing, including KaTeX math, Mermaid diagrams, syntax-highlighted code, GFM tables, etc.

### 8. Resize Handle
- **Location**: Between the Editor Pane and Preview Pane in Split view.
- **Behavior**: Drag left/right to change the editor/preview ratio.

### 9. Status Bar (`StatusBar.tsx`)
- **Location**: Very bottom of the window.
- **Height**: 28 px.
- **Contains**: Save status icon (● dirty / ✓ saved / ⟳ saving), file name, cursor position (Ln, Col), word count, estimated read time.

### 10. Modals (pop-up dialogs)
- **Settings Modal** (`SettingsModal.tsx`): Opened by `Ctrl+,`. Configure vault path, fonts, tab size, word wrap, auto-save.
- **Help Modal** (`HelpModal.tsx`): Opened by `F1`. Shows keyboard shortcuts, Markdown reference, LaTeX examples, Mermaid diagram types.
- **Welcome Screen** (`WelcomeScreen.tsx`): Shown when no vault is selected. Pick a vault folder or open recent vaults.

## Keyboard Shortcuts (Quick Reference)

| Shortcut | Action |
|---|---|
| `Ctrl+N` | New untitled tab |
| `Ctrl+O` | Open .md file |
| `Ctrl+S` | Save (or Save As for untitled) |
| `Ctrl+W` | Close current tab |
| `Ctrl+\` | Toggle sidebar |
| `Ctrl+F` | Find in editor |
| `Ctrl+Shift+E` | Editor-only view |
| `Ctrl+Shift+B` | Split view |
| `Ctrl+Shift+P` | Preview-only view |
| `Ctrl+Shift+X` | Export to HTML |
| `Ctrl+,` | Settings |
| `F1` | Help |
