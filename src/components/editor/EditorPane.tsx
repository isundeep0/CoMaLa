import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { search, searchKeymap } from "@codemirror/search";
import { keymap } from "@codemirror/view";
import { indentWithTab, history, historyKeymap, defaultKeymap } from "@codemirror/commands";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const cmTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "transparent",
      color: "var(--text)",
    },
    ".cm-content": {
      caretColor: "var(--accent)",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "1px solid var(--border)",
      color: "var(--text-dim)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(255,255,255,0.03)",
      color: "var(--text-muted)",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(124,110,247,0.25)",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--accent)",
      borderLeftWidth: "2px",
    },
  },
  { dark: true },
);

interface Props {
  onReady?: (view: EditorView) => void;
}

export default function EditorPane({ onReady }: Props) {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const setCursor = useEditorStore((s) => s.setCursor);
  const fontSize = useSettingsStore((s) => s.editorFontSize);
  const fontFamily = useSettingsStore((s) => s.editorFontFamily);
  const wordWrap = useSettingsStore((s) => s.wordWrap);
  const tabSize = useSettingsStore((s) => s.tabSize);

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      history(),
      search({ top: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
      cmTheme,
      EditorState.tabSize.of(tabSize),
      ...(wordWrap ? [EditorView.lineWrapping] : []),
      EditorView.updateListener.of((u) => {
        if (u.selectionSet || u.docChanged) {
          const head = u.state.selection.main.head;
          const line = u.state.doc.lineAt(head);
          setCursor(line.number, head - line.from + 1);
        }
      }),
    ],
    [wordWrap, tabSize, setCursor],
  );

  return (
    <div className="h-full overflow-hidden glass-editor">
      <CodeMirror
        value={content}
        height="100%"
        extensions={extensions}
        onChange={setContent}
        onCreateEditor={(view) => onReady?.(view)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          foldGutter: false,
          dropCursor: true,
          indentOnInput: true,
        }}
        style={{
          height: "100%",
          fontSize: `${fontSize}px`,
          fontFamily: `'${fontFamily}', var(--font-mono)`,
        }}
      />
    </div>
  );
}
