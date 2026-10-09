"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Field, TextField, inputBase } from "./ui";
import { ICONS, ICON_NAMES, getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/lib/site-types";

export function IconPicker({ label = "Icon", value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Current = getIcon(value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <Field label={label}>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className={cn(inputBase, "flex items-center gap-2.5 text-left")}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
            <Current size={15} />
          </span>
          <span className="flex-1">{ICONS[value] ? value.replace(/([a-z])([A-Z0-9])/g, "$1 $2") : "Choose…"}</span>
          <ChevronDown size={15} className="text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1.5 grid w-full min-w-[260px] grid-cols-6 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            {ICON_NAMES.map((name) => {
              const Icon = ICONS[name];
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg transition-colors",
                    name === value ? "bg-gold text-navy" : "text-gray-600 hover:bg-gold/10 hover:text-gold-dark"
                  )}
                >
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Field>
  );
}

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Tour Packages" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function LinkField({ label, value, onChange }: { label: string; value: LinkItem; onChange: (v: LinkItem) => void }) {
  const isPage = PAGES.some((p) => p.href === value.href);
  const [custom, setCustom] = useState(!isPage && value.href !== "");
  return (
    <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:grid-cols-2">
      <TextField label={`${label} text`} value={value.label} onChange={(v) => onChange({ ...value, label: v })} hint="Leave empty to hide this button." />
      <Field label="Links to">
        <select
          value={custom ? "__custom" : value.href}
          onChange={(e) => {
            if (e.target.value === "__custom") {
              setCustom(true);
            } else {
              setCustom(false);
              onChange({ ...value, href: e.target.value });
            }
          }}
          className={inputBase}
        >
          {PAGES.map((p) => (
            <option key={p.href} value={p.href}>{p.label}</option>
          ))}
          <option value="__custom">Custom link…</option>
        </select>
        {custom && (
          <input
            value={value.href}
            onChange={(e) => onChange({ ...value, href: e.target.value })}
            placeholder="https://… or /packages?country=bali"
            className={cn(inputBase, "mt-2")}
          />
        )}
      </Field>
    </div>
  );
}
