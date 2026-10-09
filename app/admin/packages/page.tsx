"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, ExternalLink, GripVertical, ImageIcon, Package as PackageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, IconButton, LoadError, PageHeader, Spinner, Toggle, inputBase, useConfirm } from "@/components/admin/ui";
import { useDoc } from "@/components/admin/useDoc";
import { move } from "@/components/admin/lists";
import { newPackageId } from "@/components/admin/package-utils";
import { thumb } from "@/components/admin/media";
import { cn } from "@/lib/utils";
import type { Package, PackagesData } from "@/lib/site-types";

type Status = "all" | "published" | "draft";

export default function PackagesListPage() {
  const router = useRouter();
  const doc = useDoc("packages");
  const { confirm, dialog } = useConfirm();
  const [query, setQuery] = useState("");
  const params = useSearchParams();
  const [country, setCountry] = useState(params.get("country") ?? "all");
  const [status, setStatus] = useState<Status>("all");
  const [drag, setDrag] = useState<{ country: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const data = doc.saved;
  const countries = useMemo(() => Object.values(data ?? {}), [data]);
  const total = countries.reduce((n, c) => n + c.packages.length, 0);
  const drafts = countries.reduce((n, c) => n + c.packages.filter((p) => !p.published).length, 0);
  const filtering = query.trim() !== "" || status !== "all";

  const matches = (p: Package) =>
    (status === "all" || (status === "published" ? p.published : !p.published)) &&
    (!query.trim() ||
      [p.name, p.description, p.duration, ...p.highlights].join(" ").toLowerCase().includes(query.trim().toLowerCase()));

  const mutate = (fn: (d: PackagesData) => void, message: string, withUndo = false) => {
    if (!data) return;
    const next = structuredClone(data);
    fn(next);
    void doc.commit(next, message, withUndo ? data : undefined);
  };

  async function remove(countryId: string, pkg: Package) {
    const ok = await confirm({
      title: `Delete "${pkg.name || "Untitled package"}"?`,
      message: "It will be removed from the website straight away. You can undo right after, or restore it later from Backups.",
      confirmLabel: "Delete package",
      danger: true,
    });
    if (ok) mutate((d) => { d[countryId].packages = d[countryId].packages.filter((p) => p.id !== pkg.id); }, "Package deleted", true);
  }

  function duplicate(countryId: string, pkg: Package, index: number) {
    const copy: Package = { ...structuredClone(pkg), id: newPackageId(countryId, pkg.name), name: `${pkg.name} (copy)`, published: false };
    mutate((d) => { d[countryId].packages.splice(index + 1, 0, copy); }, "Duplicated as a draft");
  }

  if (doc.loadError) return <LoadError message={doc.loadError} onRetry={doc.reload} />;

  const shown = countries.filter((c) => country === "all" || c.id === country);

  return (
    <>
      <PageHeader
        title="Packages"
        description={data ? `${total} package${total === 1 ? "" : "s"} across ${countries.length} destinations${drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}` : undefined}
        actions={
          <Link href={`/admin/packages/new${country !== "all" ? `?country=${country}` : ""}`}>
            <Button variant="primary" icon={<Plus size={15} />}>New package</Button>
          </Link>
        }
      />

      {!data ? (
        <Spinner />
      ) : countries.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={22} />}
          title="Add a destination first"
          text="Packages are grouped by destination (e.g. Thailand). Create one to get started."
          action={<Link href="/admin/destinations"><Button variant="primary">Go to destinations</Button></Link>}
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search packages, places…" className={cn(inputBase, "h-10 pl-9")} />
            </div>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={cn(inputBase, "h-10 sm:w-48")}>
              <option value="all">All destinations</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.packages.length})</option>
              ))}
            </select>
            <div className="flex rounded-lg bg-gray-200/60 p-1 text-[13px] font-medium">
              {(["all", "published", "draft"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn("rounded-md px-3 py-1.5 capitalize transition-colors", status === s ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-gray-800")}
                >
                  {s === "draft" ? "Drafts" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {shown.map((c) => {
              const list = c.packages.map((p, index) => ({ p, index })).filter(({ p }) => matches(p));
              if (filtering && list.length === 0) return null;
              return (
                <section key={c.id}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <span className="h-4 w-1 rounded-full bg-gold" />
                      {c.name}
                      <span className="font-normal text-gray-400">{c.packages.length}</span>
                      {!c.visible && <Badge>Destination hidden</Badge>}
                    </h2>
                    <Link href={`/admin/packages/new?country=${c.id}`} className="text-xs font-semibold text-gold-dark hover:underline">
                      + Add to {c.name}
                    </Link>
                  </div>

                  {list.length === 0 ? (
                    <Link
                      href={`/admin/packages/new?country=${c.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-6 text-sm text-gray-400 transition-colors hover:border-gold/50 hover:text-gold-dark"
                    >
                      <Plus size={15} /> No packages yet — add the first one
                    </Link>
                  ) : (
                    <Card className="divide-y divide-gray-100 overflow-hidden">
                      {list.map(({ p, index }) => (
                        <div
                          key={p.id}
                          draggable={!filtering}
                          onDragStart={() => setDrag({ country: c.id, index })}
                          onDragOver={(e) => {
                            if (drag?.country !== c.id) return;
                            e.preventDefault();
                            setDragOver(index);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (drag?.country === c.id && drag.index !== index) {
                              mutate((d) => { d[c.id].packages = move(d[c.id].packages, drag.index, index); }, "Order updated");
                            }
                            setDrag(null);
                            setDragOver(null);
                          }}
                          onDragEnd={() => { setDrag(null); setDragOver(null); }}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50/80 sm:px-4",
                            drag?.country === c.id && drag.index === index && "opacity-40",
                            dragOver === index && drag?.country === c.id && drag.index !== index && "bg-gold/5 ring-2 ring-inset ring-gold/40"
                          )}
                        >
                          {!filtering && (
                            <span className="hidden cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing sm:block" title="Drag to reorder">
                              <GripVertical size={16} />
                            </span>
                          )}
                          <button onClick={() => router.push(`/admin/packages/${p.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <span className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={thumb(p.image, 256)} alt="" className="h-full w-full object-cover" loading="lazy" />
                              ) : (
                                <ImageIcon size={16} className="absolute inset-0 m-auto text-gray-300" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-gray-900 group-hover:text-navy">{p.name || "Untitled package"}</span>
                                {!p.published && <Badge tone="amber">Draft</Badge>}
                              </span>
                              <span className="block truncate text-xs text-gray-500">
                                {[p.duration, p.highlights.length ? `${p.highlights.length} highlights` : ""].filter(Boolean).join(" · ") || "No details yet"}
                              </span>
                            </span>
                          </button>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="hidden items-center gap-2 pr-1 text-xs text-gray-500 sm:flex" title={p.published ? "Visible on website" : "Hidden draft"}>
                              <Toggle
                                size="sm"
                                checked={p.published}
                                onChange={(v) => mutate((d) => { d[c.id].packages[index].published = v; }, v ? "Package published" : "Package hidden from website")}
                              />
                            </div>
                            <IconButton label="Edit" onClick={() => router.push(`/admin/packages/${p.id}`)}>
                              <Pencil size={15} />
                            </IconButton>
                            <IconButton label="Duplicate" onClick={() => duplicate(c.id, p, index)} className="hidden sm:inline-flex">
                              <Copy size={15} />
                            </IconButton>
                            <a href={`/packages?country=${c.id}`} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                              <IconButton label="View on website">
                                <ExternalLink size={15} />
                              </IconButton>
                            </a>
                            <IconButton label="Delete" tone="danger" onClick={() => remove(c.id, p)}>
                              <Trash2 size={15} />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}
                </section>
              );
            })}
            {filtering && shown.every((c) => !c.packages.some(matches)) && (
              <p className="py-16 text-center text-sm text-gray-500">No packages match your search.</p>
            )}
          </div>
          {!filtering && total > 1 && <p className="mt-6 text-center text-xs text-gray-400">Tip: drag packages to change the order they appear on the website.</p>}
        </>
      )}
      {dialog}
    </>
  );
}
