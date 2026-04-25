import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { common } from "lowlight";
import DOMPurify from "dompurify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeHighlight, {
    detect: true,
    ignoreMissing: true,
    languages: common,
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

let lastInput = "";
let lastOutput = "";

export async function renderMarkdown(markdown: string): Promise<string> {
  if (markdown === lastInput) return lastOutput;
  const file = await processor.process(markdown);
  const html = String(file);
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["math", "annotation", "semantics", "mrow", "mi", "mo", "mn", "msup", "msub", "mfrac", "msqrt", "munder", "mover", "munderover", "mtable", "mtr", "mtd"],
    ADD_ATTR: ["target", "rel", "class", "style", "data-language"],
  });
  lastInput = markdown;
  lastOutput = clean;
  return clean;
}
