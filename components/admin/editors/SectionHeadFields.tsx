"use client";

import { TextArea, TextField } from "../ui";
import type { SectionHead } from "@/lib/site-types";

// The small label / title / description trio used above most sections.
export default function SectionHeadFields({ value, onChange }: { value: SectionHead; onChange: (v: SectionHead) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Small heading" value={value.label} onChange={(v) => onChange({ ...value, label: v })} />
        <TextField label="Title" value={value.title} onChange={(v) => onChange({ ...value, title: v })} />
      </div>
      <TextArea label="Intro text" value={value.description} onChange={(v) => onChange({ ...value, description: v })} rows={2} />
    </div>
  );
}
