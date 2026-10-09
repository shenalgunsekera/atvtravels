"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Buttons ────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "gold" | "secondary" | "ghost" | "danger";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy-light shadow-sm",
  gold: "bg-gold text-navy hover:bg-gold-light shadow-sm",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-navy",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        buttonVariants[variant],
        className
      )}
      {...rest}
    >
      {loading ? <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function IconButton({
  label,
  className,
  children,
  tone = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-30 disabled:pointer-events-none",
        tone === "danger" ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-gray-100 hover:text-navy",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Form fields ────────────────────────────────────────────────────────

export const inputBase =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
  counter,
}: {
  label?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  counter?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || counter) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label htmlFor={htmlFor} className="block text-[13px] font-medium text-gray-700">
              {label}
            </label>
          )}
          {counter}
        </div>
      )}
      {children}
      {hint && <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return <span className={cn("text-[11px] tabular-nums", over ? "text-amber-600" : "text-gray-400")}>{value.length}/{max}</span>;
}

type TextFieldProps = {
  label?: string;
  hint?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number; // soft limit: shows a counter, doesn't block typing
  type?: string;
  autoFocus?: boolean;
  prefix?: React.ReactNode;
};

export function TextField({ label, hint, value, onChange, placeholder, className, maxLength, type = "text", autoFocus, prefix }: TextFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id} counter={maxLength ? <CharCount value={value} max={maxLength} /> : null}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(inputBase, prefix && "pl-9")}
        />
      </div>
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, placeholder, className, maxLength, rows = 3 }: TextFieldProps & { rows?: number }) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  // Grow with content so long text is always fully visible.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id} counter={maxLength ? <CharCount value={value} max={maxLength} /> : null}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputBase, "resize-none leading-relaxed")}
      />
    </Field>
  );
}

export function NumberField({ label, hint, value, onChange, className }: { label?: string; hint?: string; value: number; onChange: (v: number) => void; className?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className={inputBase}
      />
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md";
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-emerald-500" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block transform rounded-full bg-white shadow transition-transform duration-200",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          checked ? (size === "sm" ? "translate-x-[18px]" : "translate-x-[22px]") : "translate-x-0.5"
        )}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {sw}
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────

export function Card({ className, children, id }: { className?: string; children: React.ReactNode; id?: string }) {
  return <div id={id} className={cn("rounded-xl border border-gray-200/80 bg-white shadow-sm", className)}>{children}</div>;
}

// A titled card used to group fields. `visible`/`onVisibleChange` adds a show/hide switch.
export function Section({
  id,
  title,
  description,
  children,
  visible,
  onVisibleChange,
  actions,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  visible?: boolean;
  onVisibleChange?: (v: boolean) => void;
  actions?: React.ReactNode;
}) {
  const hidden = visible === false;
  return (
    <Card id={id} className="scroll-mt-24 overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
            {hidden && <Badge tone="gray">Hidden</Badge>}
          </div>
          {description && <p className="mt-0.5 text-[13px] text-gray-500">{description}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {actions}
          {onVisibleChange && (
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="hidden sm:inline">{hidden ? "Hidden" : "Shown"} on site</span>
              <Toggle size="sm" checked={!hidden} onChange={onVisibleChange} />
            </label>
          )}
        </div>
      </div>
      <div className={cn("space-y-5 px-5 py-5 sm:px-6 transition-opacity", hidden && "opacity-50")}>{children}</div>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: "gray" | "green" | "amber" | "gold" | "blue" | "red"; children: React.ReactNode }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    gold: "bg-gold/15 text-gold-dark",
    blue: "bg-sky-50 text-sky-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">{icon}</div>
      <p className="font-semibold text-gray-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-gray-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
      <Loader2 size={18} className="animate-spin" /> {label}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <TriangleAlert className="text-amber-500" />
      <p className="text-sm text-gray-600">{message}</p>
      <Button size="sm" onClick={onRetry}>Try again</Button>
    </div>
  );
}

// ── Modal & confirm ────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return createPortal(
    <div className="admin-ui fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-[2px] animate-[fadeIn_.15s_ease]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl animate-[popIn_.18s_ease]",
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3.5 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

type ConfirmOptions = { title: string; message?: React.ReactNode; confirmLabel?: string; danger?: boolean };

// Promise-based confirm dialog: `if (await confirm({...})) doIt()`
export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...opts, resolve }));
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={state?.title ?? ""}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
          <Button variant={state?.danger ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
            {state?.confirmLabel ?? "Confirm"}
          </Button>
        </>
      }
    >
      <div className="text-sm text-gray-600 leading-relaxed">{state?.message}</div>
    </Modal>
  );
  return { confirm, dialog };
}
