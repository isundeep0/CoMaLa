import { useRef, useState, useEffect, useCallback } from "react";
import { Pencil, Eraser, Trash2, Download, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: "pencil" | "eraser";
}

const COLORS = [
  "#ffffff",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb923c",
  "#2dd4bf",
  "#818cf8",
];

const SIZES = [2, 4, 6, 10, 16];

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [undoneStrokes, setUndoneStrokes] = useState<Stroke[]>([]);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.size;
    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentStroke({
      points: [pos],
      color,
      size: tool === "eraser" ? size * 3 : size,
      tool,
    });
    setUndoneStrokes([]);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pos = getPos(e);
    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, pos] } : null,
    );
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  }

  function handleUndo() {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setUndoneStrokes((prev) => [...prev, last]);
  }

  function handleRedo() {
    if (undoneStrokes.length === 0) return;
    const last = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, last]);
  }

  function handleClear() {
    setStrokes([]);
    setUndoneStrokes([]);
  }

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Create a temp canvas with white bg for export
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  }

  const Btn = ({
    title,
    onClick,
    active,
    children,
  }: {
    title: string;
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      title={title}
      onClick={onClick}
      className={cn("glass-btn glass-btn-icon", active && "active")}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Drawing Toolbar */}
      <div className="glass-toolbar flex items-center gap-1 px-3 py-2 fluid-highlight flex-wrap">
        <Btn title="Pencil" onClick={() => setTool("pencil")} active={tool === "pencil"}>
          <Pencil size={14} />
        </Btn>
        <Btn title="Eraser" onClick={() => setTool("eraser")} active={tool === "eraser"}>
          <Eraser size={14} />
        </Btn>
        <span className="w-px h-5 bg-white/8 mx-1" />
        <Btn title="Undo" onClick={handleUndo}>
          <Undo2 size={14} />
        </Btn>
        <Btn title="Redo" onClick={handleRedo}>
          <Redo2 size={14} />
        </Btn>
        <Btn title="Clear canvas" onClick={handleClear}>
          <Trash2 size={14} />
        </Btn>
        <Btn title="Export as PNG" onClick={handleExport}>
          <Download size={14} />
        </Btn>
        <span className="w-px h-5 bg-white/8 mx-1" />

        {/* Brush sizes */}
        <div className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              title={`Size ${s}px`}
              onClick={() => setSize(s)}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                size === s
                  ? "bg-[var(--accent-glow)] border border-[var(--accent)]"
                  : "bg-white/4 border border-white/6 hover:bg-white/8",
              )}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: `${Math.max(4, s)}px`, height: `${Math.max(4, s)}px` }}
              />
            </button>
          ))}
        </div>
        <span className="w-px h-5 bg-white/8 mx-1" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(c); setTool("pencil"); }}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all",
                color === c && tool === "pencil"
                  ? "border-[var(--accent)] scale-125"
                  : "border-white/10 hover:border-white/30",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
