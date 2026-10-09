"use client";

import { useState } from "react";
import { Images, Plus, Trash2, X } from "lucide-react";
import { Button, Card, EmptyState, IconButton, LoadError, PageHeader, Spinner, useConfirm } from "@/components/admin/ui";
import { DropZone, MediaPicker, thumb, useUploader } from "@/components/admin/media";
import { useDragSort } from "@/components/admin/lists";
import { useDoc } from "@/components/admin/useDoc";
import SaveBar from "@/components/admin/SaveBar";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const doc = useDoc("site");
  const [picker, setPicker] = useState(false);
  const { confirm, dialog } = useConfirm();
  const photos = doc.data?.gallery.photos ?? [];
  const setPhotos = (next: string[]) => doc.update((d) => { d.gallery.photos = next; });
  const { handlers, dragging, over } = useDragSort(photos, setPhotos);
  const { upload, uploading } = useUploader((items) =>
    doc.update((d) => {
      d.gallery.photos = [...items.filter((i) => i.kind === "image").map((i) => i.url), ...d.gallery.photos];
    })
  );

  return (
    <>
      <PageHeader
        title="Photo gallery"
        description="The scrolling traveller photos on the Home and About pages. Drag photos to change their order."
        actions={
          <>
            {photos.length > 0 && (
              <Button
                variant="ghost"
                icon={<Trash2 size={14} />}
                onClick={async () => {
                  if (await confirm({ title: "Remove all photos from the gallery?", message: "The files stay in your media library. You can undo this by clicking Discard before saving.", confirmLabel: "Remove all", danger: true }))
                    setPhotos([]);
                }}
              >
                Clear
              </Button>
            )}
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setPicker(true)}>
              Add from library
            </Button>
          </>
        }
      />

      {doc.loadError ? (
        <LoadError message={doc.loadError} onRetry={doc.reload} />
      ) : !doc.data ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <DropZone onFiles={upload} uploading={uploading} accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />

          {photos.length === 0 ? (
            <EmptyState icon={<Images size={22} />} title="No photos yet" text="Upload photos above or add them from your media library." />
          ) : (
            <Card className="p-4">
              <p className="mb-3 text-[13px] text-gray-500">
                <span className="font-semibold text-gray-800">{photos.length}</span> photos · they alternate between the top and bottom rows.
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                {photos.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    {...handlers(i)}
                    className={cn(
                      "group relative aspect-[4/3] cursor-grab overflow-hidden rounded-lg bg-gray-100 ring-2 ring-transparent transition-all active:cursor-grabbing",
                      dragging === i && "opacity-40",
                      over === i && dragging !== i && "ring-gold"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(url)} alt="" loading="lazy" className="pointer-events-none h-full w-full object-cover" />
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 text-[10px] font-semibold text-white">{i + 1}</span>
                    <IconButton
                      label="Remove from gallery"
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 h-7 w-7 bg-white/90 text-gray-700 opacity-100 shadow sm:opacity-0 sm:group-hover:opacity-100"
                      tone="danger"
                    >
                      <X size={14} />
                    </IconButton>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        multiple
        onSelect={(urls) => setPhotos([...photos, ...urls.filter((u) => !photos.includes(u))])}
      />
      {dialog}
      <SaveBar dirty={doc.dirty} saving={doc.saving} onSave={doc.save} onDiscard={doc.discard} />
    </>
  );
}
