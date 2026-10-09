"use client";

import { TextArea, TextField } from "../ui";
import { MediaField } from "../media";
import type { PageHero } from "@/lib/site-types";

export default function PageHeroFields({ value, onChange }: { value: PageHero; onChange: (v: PageHero) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
      <MediaField label="Banner image" hint="Wide landscape photo works best." value={value.image} onChange={(v) => onChange({ ...value, image: v })} />
      <div className="space-y-4">
        <TextField label="Small heading" value={value.eyebrow} onChange={(v) => onChange({ ...value, eyebrow: v })} />
        <TextField label="Title" value={value.title} onChange={(v) => onChange({ ...value, title: v })} />
        <TextArea label="Subtitle" value={value.subtitle} onChange={(v) => onChange({ ...value, subtitle: v })} rows={2} />
      </div>
    </div>
  );
}
