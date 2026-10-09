"use client";

import { ExternalLink } from "lucide-react";
import { Button, LoadError, PageHeader, Spinner } from "./ui";
import SaveBar from "./SaveBar";
import { useDoc } from "./useDoc";
import type { SiteContent } from "@/lib/site-types";

export type SiteUpdate = (fn: (d: SiteContent) => void) => void;

// Shared frame for every editor that edits data/site.json.
export default function EditorFrame({
  title,
  description,
  viewHref,
  sections,
  children,
}: {
  title: string;
  description?: string;
  viewHref?: string;
  sections?: { id: string; label: string }[];
  children: (site: SiteContent, update: SiteUpdate) => React.ReactNode;
}) {
  const doc = useDoc("site");

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          viewHref && (
            <a href={viewHref} target="_blank" rel="noopener noreferrer">
              <Button icon={<ExternalLink size={14} />}>View page</Button>
            </a>
          )
        }
      />

      {sections && sections.length > 1 && (
        <nav className="sticky top-14 z-10 -mx-4 mb-6 overflow-x-auto border-b border-gray-200 bg-[#F5F6F8]/95 px-4 backdrop-blur lg:top-0 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <ul className="flex gap-1 py-2 text-[13px] font-medium">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-md px-3 py-1.5 text-gray-500 transition-colors hover:bg-white hover:text-navy">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {doc.loadError ? (
        <LoadError message={doc.loadError} onRetry={doc.reload} />
      ) : !doc.data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">{children(doc.data, doc.update)}</div>
      )}

      <SaveBar dirty={doc.dirty} saving={doc.saving} onSave={doc.save} onDiscard={doc.discard} />
    </>
  );
}
