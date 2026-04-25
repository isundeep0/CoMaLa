import { saveAsDialog } from "./vault";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { renderMarkdown } from "./renderer";

const KATEX_CDN = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
const HL_CDN = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark-dimmed.min.css";

const STYLES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px 24px;
    background: #0a0a0c;
    color: #f0f0f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    line-height: 1.7;
  }
  .article { max-width: 760px; margin: 0 auto; font-size: 16px; }
  .article h1 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 1rem; letter-spacing: -0.02em; }
  .article h2 { font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .article h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
  .article a { color: #9585ff; }
  .article blockquote {
    margin: 1rem 0; padding: 0.75rem 1rem;
    border-left: 3px solid #7c6ef7;
    background: rgba(124,110,247,0.08);
    border-radius: 0 8px 8px 0; font-style: italic;
  }
  .article code:not(pre code) {
    background: rgba(124,110,247,0.12);
    color: #c4b5fd;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.875em;
    font-family: 'JetBrains Mono', Consolas, monospace;
  }
  .article pre {
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 13px;
  }
  .article table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  .article th, .article td { border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 0.75rem; }
  .article th { background: rgba(255,255,255,0.04); }
  .article img { max-width: 100%; border-radius: 8px; }
  .katex { font-size: 1.05em !important; }
`;

export async function exportHtml(title: string, markdown: string): Promise<string | null> {
  const body = await renderMarkdown(markdown);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${KATEX_CDN}">
  <link rel="stylesheet" href="${HL_CDN}">
  <style>${STYLES}</style>
</head>
<body>
  <article class="article">
${body}
  </article>
</body>
</html>`;

  const safeName = title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 50) || "note";
  const target = await saveAsDialog(`${safeName}.html`);
  if (!target) return null;
  await writeTextFile(target, html);
  return target;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
