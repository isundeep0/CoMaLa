import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="glass-modal rounded-xl p-5 min-w-[320px] max-w-md shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold">{title}</h3>
          <button onClick={onClose} className="glass-btn glass-btn-icon">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface PromptDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
}

export function PromptDialog({
  open,
  onClose,
  onConfirm,
  title,
  placeholder = "",
  defaultValue = "",
  confirmLabel = "Create",
}: PromptDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Small delay to let the dialog mount before focus
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const submit = () => {
    const val = inputRef.current?.value.trim();
    if (val) {
      onConfirm(val);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="glass-input w-full px-3 py-2 rounded-lg text-[13px] mb-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onClose();
        }}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="glass-btn text-[12px] px-3 py-1.5">
          Cancel
        </button>
        <button onClick={submit} className="accent-btn glass-btn text-[12px] px-3 py-1.5">
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-[13px] text-[var(--text-muted)] mb-5 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="glass-btn text-[12px] px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`glass-btn text-[12px] px-3 py-1.5 ${danger ? "text-[var(--error)] hover:bg-[var(--error)]/10" : "accent-btn"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

interface SelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  options: { label: string; value: string }[];
}

export function SelectDialog({ open, onClose, onSelect, title, options }: SelectDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onSelect(opt.value);
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-white/[0.06] transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="glass-btn text-[12px] px-3 py-1.5">
          Cancel
        </button>
      </div>
    </Dialog>
  );
}
