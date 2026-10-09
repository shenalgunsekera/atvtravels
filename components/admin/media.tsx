"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Film, ImageIcon, Link2, Search, Upload, X, Loader2 } from "lucide-react";
import { Button, Field, Modal, inputBase } from "./ui";
import { api, errorMessage } from "./api";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";
import { cloudinaryImage, cloudinaryVideoPoster, isCloudinaryUrl } from "@/lib/cloudinary-url";
import type { MediaItem } from "@/lib/media";

export type { MediaItem };

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const ACCEPT_VIDEOS = "video/mp4,video/webm,video/quicktime";
const ACCEPT_ALL = `${ACCEPT_IMAGES},${ACCEPT_VIDEOS}`;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function isVideoUrl(url: string) {
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)($|\?)/i.test(url);
}

// A small, fast preview. Cloudinary resizes its own files; Unsplash and local files go through
// Next's optimizer (width must be one of Next's default sizes).
export function thumb(url: string, width: 128 | 256 | 384 | 640 | 1080 = 384) {
  if (!url || isVideoUrl(url) || /\.gif($|\?)/i.test(url)) return url;
  if (isCloudinaryUrl(url)) return cloudinaryImage(url, width);
  if (url.startsWith("/") || url.startsWith("https://images.unsplash.com/")) {
    return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
  }
  return url;
}

// ── Upload hook shared by the picker, the library page and drop zones ──

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 100 * 1024 * 1024; // Cloudinary's limit for a single (non-chunked) upload
const DIRECT_LIMIT = 4 * 1024 * 1024; // stay under Vercel's 4.5 MB request limit

export type UploadTarget = "cloudinary" | "database" | "local" | "none";

// Where uploads go, fetched once per page load.
let targetPromise: Promise<UploadTarget> | null = null;
export function getUploadTarget(): Promise<UploadTarget> {
  targetPromise ??= api<{ upload: UploadTarget }>("/api/admin/media?target=1")
    .then((r) => r.upload)
    .catch((err) => {
      targetPromise = null;
      throw err;
    });
  return targetPromise;
}

// POST a form with upload progress (0–1); resolves with the parsed JSON response.
function xhrUpload<T>(url: string, form: FormData, fileName: string, onProgress: (p: number) => void) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) return resolve(body as T);
      if (xhr.status === 401) window.location.reload();
      const err = body.error as string | { message?: string } | undefined;
      const msg = typeof err === "string" ? err : err?.message ?? "upload failed";
      reject(new Error(msg.includes(fileName) ? msg : `"${fileName}": ${msg}`));
    };
    xhr.onerror = () => reject(new Error(`"${fileName}": network error — check your connection and try again.`));
    xhr.send(form);
  });
}

// Shrink big photos in the browser (≤2000px WebP) so they fit through Vercel's request limit.
async function shrinkForUpload(file: File): Promise<File> {
  if (file.size <= DIRECT_LIMIT || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.85, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob && blob.size <= DIRECT_LIMIT) return new File([blob], file.name.replace(/.[^.]+$/, ".webp"), { type: "image/webp" });
  }
  throw new Error(`"${file.name}" is too large — try a smaller photo.`);
}

type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
};

async function uploadOne(file: File, target: UploadTarget, onProgress: (p: number) => void): Promise<MediaItem> {
  const kind = file.type.startsWith("video/") ? "video" : "image";
  if (target === "none") throw new Error("Uploads are off until the database is connected (see the banner at the top).");

  if (target === "cloudinary") {
    const sig = await api<{ uploadUrl: string; fields: Record<string, string> }>("/api/admin/media", {
      method: "POST",
      body: JSON.stringify({ kind }),
    });
    const form = new FormData();
    Object.entries(sig.fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);
    const r = await xhrUpload<CloudinaryUploadResult>(sig.uploadUrl, form, file.name, onProgress);
    return {
      id: r.public_id,
      url: r.secure_url,
      name: `${r.public_id.split("/").pop()}${r.format ? `.${r.format}` : ""}`,
      kind: r.resource_type === "video" ? "video" : "image",
      size: r.bytes,
      createdAt: r.created_at,
      builtIn: false,
      width: r.width,
      height: r.height,
    };
  }

  // Neon / local disk: images only.
  if (kind === "video") {
    throw new Error(`"${file.name}": video uploads need Cloudinary. You can paste a video link instead.`);
  }
  const form = new FormData();
  form.append("file", await shrinkForUpload(file));
  const res = await xhrUpload<{ item: MediaItem }>("/api/admin/media", form, file.name, onProgress);
  return res.item;
}

export function useUploader(onUploaded: (items: MediaItem[]) => void) {
  const toast = useToast();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const valid = list.filter((f) => {
        const ok = IMAGE_TYPES.includes(f.type) || VIDEO_TYPES.includes(f.type);
        if (!ok) toast.error(`"${f.name}" isn't a supported file. Use JPG, PNG, WebP, AVIF, GIF, MP4, MOV or WebM.`);
        else if (f.size > MAX_BYTES) toast.error(`"${f.name}" is too large (max 100 MB).`);
        return ok && f.size <= MAX_BYTES;
      });
      if (valid.length === 0) return;

      setActive((n) => n + valid.length);
      const totals = valid.map((f) => f.size);
      const done = valid.map(() => 0);
      const report = () => setProgress(done.reduce((s, d, i) => s + d * totals[i], 0) / totals.reduce((a, b) => a + b, 0));

      let target: UploadTarget;
      try {
        target = await getUploadTarget();
      } catch (err) {
        toast.error(errorMessage(err));
        setActive((n) => n - valid.length);
        return;
      }

      const results = await Promise.allSettled(
        valid.map((file, i) =>
          uploadOne(file, target, (p) => {
            done[i] = p;
            report();
          })
        )
      );

      const items = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
      results.forEach((r) => r.status === "rejected" && toast.error(errorMessage(r.reason)));
      if (items.length) {
        toast.success(items.length === 1 ? "Uploaded" : `${items.length} files uploaded`);
        onUploaded(items);
      }
      setActive((n) => n - valid.length);
      setProgress(0);
    },
    [onUploaded, toast]
  );

  return { upload, uploading: active > 0, progress };
}

export function DropZone({
  onFiles,
  uploading,
  progress = 0,
  accept = ACCEPT_ALL,
  multiple = true,
  compact,
}: {
  onFiles: (files: FileList) => void;
  uploading: boolean;
  progress?: number;
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
        {uploading ? `Uploading… ${Math.round(progress * 100)}%` : over ? "Drop to upload" : "Drag & drop files here, or click to browse"}
      </p>
      {uploading ? (
        <div className="mt-2.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-gold transition-[width] duration-200" style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
      ) : (
        !compact && (
          <p className="mt-1 text-xs text-gray-500">
            Big photos are resized and compressed automatically (JPG, PNG, WebP, GIF
            {accept.includes("video") ? " · MP4, MOV, WebM video" : ""})
          </p>
        )
      )}
    </div>
  );
}

export function UploadsOffNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
      <strong>Uploads are off:</strong> the database isn&apos;t connected yet. In Vercel open <strong>Storage → Create Database → Neon</strong>,
      connect it to this project, then redeploy. Until then you can pick built-in images or paste an image link.
    </div>
  );
}

export function MediaThumb({ item, className }: { item: Pick<MediaItem, "url" | "kind">; className?: string }) {
  if (item.kind === "video") {
    const poster = cloudinaryVideoPoster(item.url, 384);
    return (
      <div className={cn("relative bg-navy", className)}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
        )}
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
  const [canUpload, setCanUpload] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setUrl("");
    setTab("library");
    api<{ items: MediaItem[]; upload: UploadTarget }>("/api/admin/media")
      .then((r) => {
        setItems(r.items);
        setCanUpload(r.upload !== "none");
      })
      .catch((e) => toast.error(errorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { upload, uploading, progress } = useUploader(
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
          {canUpload ? (
            <DropZone
              compact
              uploading={uploading}
              progress={progress}
              onFiles={upload}
              accept={kind === "video" ? ACCEPT_VIDEOS : ACCEPT_IMAGES}
              multiple={multiple}
            />
          ) : (
            <UploadsOffNotice />
          )}
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
  const { upload, uploading, progress } = useUploader(
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85">
            <Loader2 className="animate-spin text-gold" />
            <span className="text-xs font-semibold tabular-nums text-gray-700">{Math.round(progress * 100)}%</span>
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
