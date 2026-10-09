"use client";

import { TextArea, TextField } from "../ui";
import type { Seo } from "@/lib/site-types";

// Title + description with a Google-style preview.
export default function SeoFields({ value, onChange, path = "" }: { value: Seo; onChange: (v: Seo) => void; path?: string }) {
  return (
    <div className="space-y-4">
      <TextField label="Page title" maxLength={60} value={value.title} onChange={(v) => onChange({ ...value, title: v })} />
      <TextArea label="Description" maxLength={160} value={value.description} onChange={(v) => onChange({ ...value, description: v })} rows={2} />
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Google preview</p>
        <p className="truncate text-xs text-gray-500">atvtravels.lk{path}</p>
        <p className="truncate text-lg leading-snug text-[#1a0dab]">{value.title || "Page title"}</p>
        <p className="line-clamp-2 text-sm text-gray-600">{value.description || "Page description…"}</p>
      </div>
    </div>
  );
}
