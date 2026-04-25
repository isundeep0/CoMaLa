import mermaid from "mermaid";

let initialized = false;

export function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      darkMode: true,
      background: "transparent",
      primaryColor: "#7c6ef7",
      primaryTextColor: "#f0f0f5",
      primaryBorderColor: "#9585ff",
      lineColor: "#8888a0",
      secondaryColor: "rgba(124,110,247,0.15)",
      tertiaryColor: "rgba(255,255,255,0.04)",
      fontFamily: "-apple-system, system-ui, sans-serif",
    },
    securityLevel: "strict",
  });
  initialized = true;
}

let counter = 0;

export async function renderMermaidBlocks(root: HTMLElement) {
  initMermaid();
  const blocks = root.querySelectorAll<HTMLElement>("pre code.language-mermaid, pre code.hljs.language-mermaid");
  for (const code of Array.from(blocks)) {
    const pre = code.closest("pre");
    if (!pre || pre.dataset.mermaidRendered === "true") continue;
    const source = (code.textContent || "").trim();
    if (!source) continue;
    const id = `mermaid-${++counter}`;
    try {
      const { svg } = await mermaid.render(id, source);
      const wrapper = document.createElement("div");
      wrapper.className = "mermaid-diagram";
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (e) {
      console.error("mermaid render failed", e);
      pre.dataset.mermaidRendered = "error";
    }
  }
}
