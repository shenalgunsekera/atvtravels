"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, FolderOpen, Loader2, Search, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState, LoadError, Modal, PageHeader, Spinner, inputBase, useConfirm } from "@/components/admin/ui";
import { DropZone, UploadsOffNotice, MediaThumb, formatBytes, useUploader, type MediaItem, type UploadTarget } from "@/components/admin/media";
import { api, errorMessage } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

type Filter = "all" | "uploads" | "builtin" | "video";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "uploads", label: "Uploaded" },
  { id: "builtin", label: "Built-in" },
  { id: "video", label: "Videos" },
];

export default function MediaPage() {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [usages, setUsages] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [canUpload, setCanUpload] = useState(true);

  const load = useCallback(() => {
    setError(null);
    api<{ items: MediaItem[]; upload: UploadTarget }>("/api/admin/media")
      .then((r) => {
        setItems(r.items);
        setCanUpload(r.upload !== "none");
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const { upload, uploading, progress } = useUploader(useCallback((uploaded: MediaItem[]) => setItems((prev) => [...uploaded, ...(prev ?? [])]), []));

  useEffect(() => {
    setUsages(null);
    setCopied(false);
    if (!selected) return;
    api<{ usages: string[] }>(`/api/admin/media?usage=${encodeURIComponent(selected.url)}`)
      .then((r) => setUsages(r.usages))
      .catch(() => setUsages([]));
  }, [selected]);

  const visible = useMemo(
    () =>
      (items ?? []).filter((i) => {
        if (filter === "uploads" && i.builtIn) return false;
        if (filter === "builtin" && !i.builtIn) return false;
        if (filter === "video" && i.kind !== "video") return false;
        return !query || i.name.toLowerCase().includes(query.toLowerCase());
      }),
    [items, filter, query]
  );

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function remove(item: MediaItem) {
    const inUse = usages && usages.length > 0;
    const ok = await confirm({
      title: `Delete ${item.name}?`,
      message: inUse ? (
        <>
          This file is still used in <strong>{usages!.length} place{usages!.length === 1 ? "" : "s"}</strong>. Those spots will show an empty image until you choose a new one.
        </>
      ) : (
        "This permanently deletes the file."
      ),
      confirmLabel: "Delete file",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api("/api/admin/media", { method: "DELETE", body: JSON.stringify({ id: item.id, kind: item.kind, url: item.url, force: true }) });
      setItems((prev) => prev?.filter((i) => i.url !== item.url) ?? null);
      setSelected(null);
      toast.success("File deleted");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  const uploadsCount = items?.filter((i) => !i.builtIn).length ?? 0;

  return (
    <>
      <PageHeader title="Media library" description="Upload photos and videos once, then use them anywhere on the site." />

      {canUpload ? <DropZone onFiles={upload} uploading={uploading} progress={progress} /> : <UploadsOffNotice />}

      <div className="my-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-lg bg-gray-200/60 p-1 text-[13px] font-medium">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn("rounded-md px-3 py-1.5 transition-colors", filter === f.id ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-gray-800")}
            >
              {f.label}
              {f.id === "uploads" && uploadsCount > 0 && <span className="ml-1 text-gray-400">{uploadsCount}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by file name…" className={cn(inputBase, "pl-9")} />
        </div>
      </div>

      {error ? (
        <LoadError message={error} onRetry={load} />
      ) : items === null ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState icon={<FolderOpen size={22} />} title="Nothing here yet" text="Drag files into the box above to upload them." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((item) => (
            <button
              key={item.url}
              onClick={() => setSelected(item)}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <MediaThumb item={item} className="aspect-[4/3] w-full" />
              <div className="px-2.5 py-2">
                <p className="truncate text-xs font-medium text-gray-800" title={item.name}>{item.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                  {formatBytes(item.size)}
                  {item.builtIn && <span className="rounded bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">Built-in</span>}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected?.name ?? ""}
        footer={
          selected && (
            <>
              {!selected.builtIn && (
                <Button variant="ghost" className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700" icon={<Trash2 size={14} />} loading={deleting} onClick={() => remove(selected)}>
                  Delete
                </Button>
              )}
              <a href={selected.url} target="_blank" rel="noopener noreferrer">
                <Button icon={<ExternalLink size={14} />}>Open</Button>
              </a>
              <Button variant="primary" icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={() => copyUrl(selected.url)}>
                {copied ? "Copied" : "Copy link"}
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl bg-gray-900">
              {selected.kind === "video" ? (
                <video src={selected.url} controls className="max-h-[50vh] w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} alt="" className="mx-auto max-h-[50vh] object-contain" />
              )}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-400">Size</dt>
                <dd className="font-medium text-gray-800">{formatBytes(selected.size)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Type</dt>
                <dd className="font-medium capitalize text-gray-800">{selected.kind}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Source</dt>
                <dd>{selected.builtIn ? <Badge>Built-in (read-only)</Badge> : <Badge tone="gold">{selected.url.startsWith("/media/") ? "Uploaded" : "Cloudinary"}</Badge>}</dd>
              </div>
            </dl>
            <div>
              <p className="mb-1.5 text-xs text-gray-400">Used in</p>
              {usages === null ? (
                <Loader2 size={15} className="animate-spin text-gray-400" />
              ) : usages.length === 0 ? (
                <p className="text-sm text-gray-500">Not used anywhere yet.</p>
              ) : (
                <ul className="space-y-1">
                  {usages.map((u) => (
                    <li key={u} className="rounded-md bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700">{u}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
      {dialog}
    </>
  );
}
