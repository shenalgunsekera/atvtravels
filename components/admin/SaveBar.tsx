"use client";

import { Save, RotateCcw } from "lucide-react";
import { Button } from "./ui";
import { cn } from "@/lib/utils";

// Sticky bar that slides up whenever there are unsaved changes.
export default function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:left-64 transition-all duration-300",
        dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-navy px-4 py-3 shadow-2xl sm:px-5 mx-4 sm:mx-auto">
        <div className="flex items-center gap-2.5 text-sm text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <span className="font-medium">Unsaved changes</span>
          <span className="hidden text-white/40 sm:inline">· Ctrl+S to save</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white" onClick={onDiscard} icon={<RotateCcw size={13} />} disabled={saving}>
            Discard
          </Button>
          <Button size="sm" variant="gold" onClick={onSave} loading={saving} icon={<Save size={13} />}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
