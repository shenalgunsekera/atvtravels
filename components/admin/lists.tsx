"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, GripVertical, Plus, Trash2, X } from "lucide-react";
import { Button, Field, IconButton, inputBase } from "./ui";
import { cn } from "@/lib/utils";

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Drag-and-drop reordering for any vertical list.
export function useDragSort<T>(items: T[], onChange: (next: T[]) => void) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const handlers = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDragging(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (e: React.DragEvent) => {
      if (dragging === null) return;
      e.preventDefault();
      setOver(index);
    },
    onDrop: (e: React.DragEvent) => {
      if (dragging === null) return;
      e.preventDefault();
      onChange(move(items, dragging, index));
      setDragging(null);
      setOver(null);
    },
    onDragEnd: () => {
      setDragging(null);
      setOver(null);
    },
  });
  return { handlers, dragging, over };
}

// ── List of short texts (highlights, features, paragraphs…) ────────────

export function StringList({
  label,
  hint,
  items,
  onChange,
  placeholder = "Add an item…",
  multiline = false,
  addLabel = "Add",
}: {
  label?: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  const { handlers, dragging, over } = useDragSort(items, onChange);

  const add = (text: string) => {
    // Pasting several lines adds one item per line.
    const parts = multiline ? [text.trim()] : text.split(/\r?\n/).map((s) => s.trim());
    const clean = parts.filter(Boolean);
    if (clean.length) onChange([...items, ...clean]);
    setDraft("");
  };

  return (
    <Field label={label} hint={hint ?? (multiline ? undefined : "Press Enter to add. Paste several lines to add many at once. Drag to reorder.")}>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              {...handlers(i)}
              className={cn(
                "group flex items-start gap-1.5 rounded-lg transition-all",
                dragging === i && "opacity-40",
                over === i && dragging !== i && "ring-2 ring-gold/40"
              )}
            >
              <span className="mt-2 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing" title="Drag to reorder">
                <GripVertical size={15} />
              </span>
              {multiline ? (
                <textarea
                  value={item}
                  rows={3}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                  className={cn(inputBase, "resize-y leading-relaxed")}
                />
              ) : (
                <input
                  value={item}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                  className={inputBase}
                />
              )}
              <IconButton label="Remove" tone="danger" className="mt-1" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <X size={15} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-start gap-2 pl-[21px]">
        {multiline ? (
          <textarea
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className={cn(inputBase, "resize-y border-dashed")}
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (text.includes("\n")) {
                e.preventDefault();
                add(text);
              }
            }}
            placeholder={placeholder}
            className={cn(inputBase, "border-dashed")}
          />
        )}
        <Button onClick={() => add(draft)} disabled={!draft.trim()} icon={<Plus size={14} />}>
          {addLabel}
        </Button>
      </div>
    </Field>
  );
}

// ── List of structured items (testimonials, FAQs, stats…) ──────────────

export function ObjectList<T>({
  label,
  items,
  onChange,
  create,
  itemTitle,
  renderItem,
  addLabel = "Add item",
  max,
}: {
  label?: string;
  items: T[];
  onChange: (next: T[]) => void;
  create: () => T;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel?: string;
  max?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { handlers, dragging, over } = useDragSort(items, (next) => {
    setOpenIndex(null);
    onChange(next);
  });
  const update = (i: number) => (patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={i}
              onDragOver={handlers(i).onDragOver}
              onDrop={handlers(i).onDrop}
              className={cn(
                "rounded-xl border bg-white transition-all",
                open ? "border-gold/50 shadow-sm" : "border-gray-200",
                dragging === i && "opacity-40",
                over === i && dragging !== i && "ring-2 ring-gold/40"
              )}
            >
              <div className="flex items-center gap-1 px-2 py-1.5">
                <span
                  draggable
                  onDragStart={handlers(i).onDragStart}
                  onDragEnd={handlers(i).onDragEnd}
                  className="cursor-grab p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={15} />
                </span>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-500">{i + 1}</span>
                  <span className={cn("truncate text-sm", itemTitle(item, i) ? "font-medium text-gray-800" : "italic text-gray-400")}>
                    {itemTitle(item, i) || "Untitled"}
                  </span>
                  <ChevronDown size={15} className={cn("ml-auto flex-shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
                </button>
                <div className="flex items-center">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => { onChange(move(items, i, i - 1)); setOpenIndex(null); }}>
                    <ArrowUp size={14} />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => { onChange(move(items, i, i + 1)); setOpenIndex(null); }}>
                    <ArrowDown size={14} />
                  </IconButton>
                  <IconButton
                    label="Duplicate"
                    disabled={max !== undefined && items.length >= max}
                    className="hidden sm:inline-flex"
                    onClick={() => {
                      const next = [...items];
                      next.splice(i + 1, 0, structuredClone(item));
                      onChange(next);
                      setOpenIndex(i + 1);
                    }}
                  >
                    <Copy size={14} />
                  </IconButton>
                  <IconButton label="Delete" tone="danger" onClick={() => { onChange(items.filter((_, j) => j !== i)); setOpenIndex(null); }}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
              {open && <div className="space-y-4 border-t border-gray-100 px-4 py-4">{renderItem(item, update(i), i)}</div>}
            </div>
          );
        })}
        <Button
          variant="secondary"
          className="w-full border-dashed"
          icon={<Plus size={15} />}
          disabled={max !== undefined && items.length >= max}
          onClick={() => {
            onChange([...items, create()]);
            setOpenIndex(items.length);
          }}
        >
          {addLabel}
        </Button>
      </div>
    </Field>
  );
}
