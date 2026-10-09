"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Film, ImageIcon, Link2, Search, Upload, X, Loader2 } from "lucide-react";
import { Button, Field, Modal, inputBase } from "./ui";
import { api, errorMessage } from "./api";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/media";

export type { MediaItem };

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const ACCEPT_ALL = `${ACCEPT_IMAGES},video/mp4,video/webm`;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm)($|\?)/i.test(url);
}

// A small, fast preview via Next's image optimizer (width must be one of Next's default sizes).
export function thumb(url: string, width: 128 | 256 | 384 | 640 | 1080 = 384) {
  if (!url || /\.(gif|mp4|webm)($|\?)/i.test(url)) return url;
  if (url.startsWith("/") || url.startsWith("https://images.unsplash.com/")) {
    return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
  }
  return url;
}

// ── Upload hook shared by the picker, the library page and drop zones ──

export function useUploader(onUploaded: (items: MediaItem[]) => void) {
  const toast = useToast();
  const [uploading, setUploading] = useState(0);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setUploading((n) => n + list.length);
      try {
        const form = new FormData();
        list.forEach((f) => form.append("files", f));
        const res = await api<{ items: MediaItem[]; errors: string[] }>("/api/admin/media", { method: "POST", body: form });
        res.errors.forEach((e) => toast.error(e));
        if (res.items.length) {
          toast.success(res.items.length === 1 ? "File uploaded" : `${res.items.length} files uploaded`);
          onUploaded(res.items);
        }
      } catch (err) {
        const body = (err as { body?: { errors?: string[] } }).body;
        if (body?.errors?.length) body.errors.forEach((e) => toast.error(e));
        else toast.error(errorMessage(err));
      } finally {
        setUploading((n) => n - list.length);
      }
    },
    [onUploaded, toast]
  );

  return { upload, uploading: uploading > 0 };
}

export function DropZone({
  onFiles,
  uploading,
  accept = ACCEPT_ALL,
  multiple = true,
  compact,
}: {
  onFiles: (files: FileList) => void;
  uploading: boolean;
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
}) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        compact ? "px-4 py-5" : "px-6 py-10",
        over ? "border-gold bg-gold/5" : "border-gray-200 bg-gray-50/60 hover:border-gold/60 hover:bg-gold/5"
      )}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {uploading ? (
        <Loader2 className="mb-2 animate-spin text-gold" size={compact ? 20 : 26} />
      ) : (
        <Upload className="mb-2 text-gold" size={compact ? 20 : 26} />
      )}
      <p className="text-sm font-medium text-gray-800">
        {uploading ? "Uploading…" : over ? "Drop to upload" : "Drag & drop files here, or click to browse"}
      </p>
      {!compact && (
        <p className="mt-1 text-xs text-gray-500">
          Images are resized and compressed automatically (JPG, PNG, WebP, GIF{accept.includes("video") ? " · MP4, WebM video" : ""})
        </p>
      )}
    </div>
  );
}

export function MediaThumb({ item, className }: { item: Pick<MediaItem, "url" | "kind">; className?: string }) {
  if (item.kind === "video") {
    return (
      <div className={cn("relative bg-navy", className)}>
        <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
        <Film size={16} className="absolute left-2 top-2 text-white drop-shadow" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={thumb(item.url)} alt="" loading="lazy" className={cn("object-cover bg-gray-100", className)} />;
}

// ── Picker modal ───────────────────────────────────────────────────────

export function MediaPicker({
  open,
  onClose,
  onSelect,
  kind = "image",
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  kind?: "image" | "video";
  multiple?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<"library" | "url">("library");
  const [url, setUrl] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setUrl("");
    setTab("library");
    api<{ items: MediaItem[] }>("/api/admin/media")
      .then((r) => setItems(r.items))
      .catch((e) => toast.error(errorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { upload, uploading } = useUploader(
    useCallback(
      (uploaded: MediaItem[]) => {
        setItems((prev) => [...uploaded, ...(prev ?? [])]);
        const matching = uploaded.filter((u) => u.kind === kind).map((u) => u.url);
        if (!multiple && matching[0]) {
          onSelect([matching[0]]);
          onClose();
        } else {
          setSelected((s) => [...s, ...matching]);
        }
      },
      [kind, multiple, onSelect, onClose]
    )
  );

  const visible = (items ?? []).filter(
    (i) => i.kind === kind && (!query || i.name.toLowerCase().includes(query.toLowerCase()))
  );

  const toggle = (u: string) => {
    if (!multiple) {
      onSelect([u]);
      onClose();
      return;
    }
    setSelected((s) => (s.includes(u) ? s.filter((x) => x !== u) : [...s, u]));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={multiple ? `Choose ${kind}s` : `Choose ${kind === "video" ? "a video" : "an image"}`}
      description="Upload something new or pick from your library."
      footer={
        tab === "url" ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!/^(https?:\/\/|\/)/.test(url.trim())}
              onClick={() => {
                onSelect([url.trim()]);
                onClose();
              }}
            >
              Use this URL
            </Button>
          </>
        ) : multiple ? (
          <>
            <span className="mr-auto text-sm text-gray-500">{selected.length} selected</span>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!selected.length}
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
            >
              Add {selected.length || ""} {selected.length === 1 ? kind : `${kind}s`}
            </Button>
          </>
        ) : null
      }
    >
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 text-sm font-medium w-fit">
        {(["library", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("rounded-md px-3 py-1.5 transition-colors", tab === t ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-gray-800")}
          >
            {t === "library" ? "Upload / Library" : "Paste a link"}
          </button>
        ))}
      </div>

      {tab === "url" ? (
        <Field label={`${kind === "video" ? "Video" : "Image"} URL`} hint="A full link (https://…) or a site path like /images/gallery/photo-001.webp">
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={inputBase} />
        </Field>
      ) : (
        <>
          <DropZone
            compact
            uploading={uploading}
            onFiles={upload}
            accept={kind === "video" ? "video/mp4,video/webm" : ACCEPT_IMAGES}
            multiple={multiple}
          />
          <div className="relative my-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by file name…" className={cn(inputBase, "pl-9")} />
          </div>
          {items === null ? (
            <div className="flex justify-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No {kind}s found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
              {visible.map((item) => {
                const on = selected.includes(item.url);
                return (
                  <button
                    key={item.url}
                    onClick={() => toggle(item.url)}
                    title={item.name}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg ring-2 ring-offset-1 transition-all focus-visible:outline-none",
                      on ? "ring-gold" : "ring-transparent hover:ring-gray-300 focus-visible:ring-gold/60"
                    )}
                  >
                    <MediaThumb item={item} className="h-full w-full transition-transform group-hover:scale-105" />
                    {on && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    {!item.builtIn && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Uploaded</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ── Single image / video field ─────────────────────────────────────────

export function MediaField({
  label,
  hint,
  value,
  onChange,
  kind = "image",
  aspect = "aspect-video",
  allowEmpty = true,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  kind?: "image" | "video";
  aspect?: string;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);
  const { upload, uploading } = useUploader(
    useCallback((items: MediaItem[]) => items[0] && onChange(items[0].url), [onChange])
  );

  return (
    <Field label={label} hint={hint}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) upload([e.dataTransfer.files[0]]);
        }}
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-gray-50 transition-colors",
          aspect,
          over ? "border-gold ring-2 ring-gold/30" : "border-gray-200"
        )}
      >
        {value ? (
          kind === "video" || isVideoUrl(value) ? (
            <video key={value} src={value} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(value, 1080)} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gold">
            {kind === "video" ? <Film size={26} /> : <ImageIcon size={26} />}
            <span className="text-xs font-medium">Click or drop to add {kind === "video" ? "a video" : "an image"}</span>
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="animate-spin text-gold" />
          </div>
        )}
        {value && !uploading && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)} icon={<Upload size={12} />}>
              Change
            </Button>
            {allowEmpty && (
              <Button size="sm" variant="secondary" onClick={() => onChange("")} icon={<X size={12} />}>
                Remove
              </Button>
            )}
          </div>
        )}
      </div>
      {value && (
        <p className="flex items-center gap-1 truncate text-[11px] text-gray-400" title={value}>
          <Link2 size={11} className="flex-shrink-0" /> <span className="truncate">{value}</span>
        </p>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(urls) => urls[0] && onChange(urls[0])} kind={kind} />
    </Field>
  );
}
