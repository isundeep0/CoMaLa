import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  const day = 86400000;
  if (diff < day) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * day) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString();
}

export function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function readTime(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

export function deriveTitle(content: string, fallback = "Untitled"): string {
  const m = content.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim().slice(0, 80);
  const firstLine = content.split("\n").find((l) => l.trim());
  if (firstLine) return firstLine.replace(/^[#>\-*\s]+/, "").trim().slice(0, 80) || fallback;
  return fallback;
}

export function slugifyFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "note"
  );
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}
