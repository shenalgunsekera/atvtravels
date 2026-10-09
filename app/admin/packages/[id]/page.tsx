"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, ExternalLink, Save, Trash2 } from "lucide-react";
import { Badge, Button, Card, Field, LoadError, Section, Spinner, TextArea, TextField, Toggle, inputBase, useConfirm } from "@/components/admin/ui";
import { MediaField } from "@/components/admin/media";
import { StringList } from "@/components/admin/lists";
import SaveBar from "@/components/admin/SaveBar";
import { useDoc, useUnsavedGuard } from "@/components/admin/useDoc";
import { DURATION_PRESETS, INCLUSION_SUGGESTIONS, blankPackage, newPackageId } from "@/components/admin/package-utils";
import PackageCard from "@/components/packages/PackageCard";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";
import type { Package, PackagesData } from "@/lib/site-types";

type Editing = { countryId: string; pkg: Package };

function locate(data: PackagesData, id: string): Editing | null {
  for (const c of Object.values(data)) {
    const pkg = c.packages.find((p) => p.id === id);
    if (pkg) return { countryId: c.id, pkg };
  }
  return null;
}

export default function PackageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const doc = useDoc("packages");
  const { confirm, dialog } = useConfirm();
  const isNew = id === "new";

  const [original, setOriginal] = useState<Editing | null>(null);
  const [edit, setEdit] = useState<Editing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const initialised = useRef(false);

  // Set up the form once the data has loaded.
  useEffect(() => {
    const data = doc.saved;
    if (!data || initialised.current) return;
    initialised.current = true;
    if (isNew) {
      const ids = Object.keys(data);
      const countryId = ids.includes(search.get("country") ?? "") ? search.get("country")! : ids[0];
      if (!countryId) return setNotFound(true);
      const start = { countryId, pkg: blankPackage("") };
      setOriginal(start);
      setEdit(start);
    } else {
      const found = locate(data, id);
      if (!found) return setNotFound(true);
      setOriginal(found);
      setEdit(found);
    }
  }, [doc.saved, id, isNew, search]);

  const dirty = !!edit && !!original && JSON.stringify(edit) !== JSON.stringify(original);
  const set = (patch: Partial<Package>) => setEdit((e) => (e ? { ...e, pkg: { ...e.pkg, ...patch } } : e));

  async function save() {
    if (!edit || !doc.saved || busy) return false;
    if (!edit.pkg.name.trim()) {
      toast.error("Please give the package a name first.");
      return false;
    }
    if (!isNew && !dirty) return true;
    setBusy(true);
    const next = structuredClone(doc.saved);
    const pkg: Package = { ...edit.pkg, name: edit.pkg.name.trim(), id: edit.pkg.id || newPackageId(edit.countryId, edit.pkg.name) };
    const prev = locate(next, pkg.id);
    if (prev && prev.countryId === edit.countryId) {
      // Same destination: replace in place to keep its position.
      const list = next[edit.countryId].packages;
      list[list.findIndex((p) => p.id === pkg.id)] = pkg;
    } else {
      if (prev) next[prev.countryId].packages = next[prev.countryId].packages.filter((p) => p.id !== pkg.id);
      next[edit.countryId].packages.push(pkg);
    }
    const ok = await doc.commit(next, isNew ? "Package created" : pkg.published ? "Saved — live on the website" : "Saved as draft");
    setBusy(false);
    if (ok) {
      const saved = { countryId: edit.countryId, pkg };
      setOriginal(saved);
      setEdit(saved);
      if (isNew) router.replace(`/admin/packages/${pkg.id}`);
    }
    return ok;
  }

  useUnsavedGuard(dirty || (isNew && !!edit?.pkg.name), save);

  async function remove() {
    if (!edit || !doc.saved) return;
    const ok = await confirm({
      title: `Delete "${edit.pkg.name || "this package"}"?`,
      message: "It will be removed from the website. You can restore it later from Backups.",
      confirmLabel: "Delete package",
      danger: true,
    });
    if (!ok) return;
    const next = structuredClone(doc.saved);
    next[original!.countryId].packages = next[original!.countryId].packages.filter((p) => p.id !== edit.pkg.id);
    setOriginal(edit); // suppress the unsaved-changes prompt
    if (await doc.commit(next, "Package deleted")) router.push("/admin/packages");
  }

  async function duplicate() {
    if (!edit || !doc.saved) return;
    if (dirty && !(await save())) return;
    const copy: Package = { ...structuredClone(edit.pkg), id: newPackageId(edit.countryId, edit.pkg.name), name: `${edit.pkg.name} (copy)`, published: false };
    const next = structuredClone(doc.saved);
    const list = next[edit.countryId].packages;
    list.splice(list.findIndex((p) => p.id === edit.pkg.id) + 1, 0, copy);
    if (await doc.commit(next, "Duplicated as a draft — you're now editing the copy")) router.push(`/admin/packages/${copy.id}`);
  }

  if (doc.loadError) return <LoadError message={doc.loadError} onRetry={doc.reload} />;
  if (notFound) {
    return (
      <div className="py-24 text-center">
        <p className="mb-4 text-gray-600">{isNew ? "Create a destination before adding packages." : "This package doesn't exist anymore."}</p>
        <Link href={isNew ? "/admin/destinations" : "/admin/packages"}><Button>Go back</Button></Link>
      </div>
    );
  }
  if (!edit || !doc.saved) return <Spinner />;

  const countries = Object.values(doc.saved);
  const countryName = doc.saved[edit.countryId]?.name ?? "";
  const p = edit.pkg;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/packages" className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-navy">
          <ArrowLeft size={14} /> All packages
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-gray-900">
              {isNew ? "New package" : p.name || "Untitled package"}
            </h1>
            {!isNew && (p.published ? <Badge tone="green">Live</Badge> : <Badge tone="amber">Draft</Badge>)}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <Button variant="ghost" icon={<Trash2 size={14} />} onClick={remove} className="text-red-600 hover:bg-red-50 hover:text-red-700" aria-label="Delete">
                  <span className="hidden sm:inline">Delete</span>
                </Button>
                <Button icon={<Copy size={14} />} onClick={duplicate} aria-label="Duplicate">
                  <span className="hidden sm:inline">Duplicate</span>
                </Button>
                <a href={`/packages?country=${original?.countryId}`} target="_blank" rel="noopener noreferrer">
                  <Button icon={<ExternalLink size={14} />} aria-label="View on website">
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </a>
              </>
            )}
            <Button variant="primary" icon={<Save size={14} />} loading={busy} onClick={save} disabled={!isNew && !dirty} className="ml-auto sm:ml-0">
              {isNew ? "Create package" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Form */}
        <div className="space-y-6">
          <Section title="Basics">
            <TextField label="Package name" placeholder="e.g. Bangkok & Pattaya Dream Tour" value={p.name} onChange={(v) => set({ name: v })} autoFocus={isNew} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Destination">
                <select value={edit.countryId} onChange={(e) => setEdit({ ...edit, countryId: e.target.value })} className={inputBase}>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <TextField label="Duration" placeholder="e.g. 5 Days / 4 Nights" value={p.duration} onChange={(v) => set({ duration: v })} />
            </div>
            <div className="-mt-2 flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set({ duration: d })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    p.duration === d ? "border-gold bg-gold/10 text-gold-dark" : "border-gray-200 text-gray-500 hover:border-gold/50 hover:text-gray-800"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <TextArea label="Short description" maxLength={180} value={p.description} onChange={(v) => set({ description: v })} placeholder="One or two sentences that sell the trip." />
          </Section>

          <Section title="Photo" description="Shown at the top of the package card. Landscape photos look best.">
            <MediaField value={p.image} onChange={(v) => set({ image: v })} aspect="aspect-[16/9]" />
          </Section>

          <Section title="Highlights" description="Places and experiences, shown as tags on the card.">
            <StringList items={p.highlights} onChange={(v) => set({ highlights: v })} placeholder="e.g. Floating Market" />
          </Section>

          <Section title="What's included">
            <StringList items={p.inclusions} onChange={(v) => set({ inclusions: v })} placeholder="e.g. Airport transfers" />
            {INCLUSION_SUGGESTIONS.some((s) => !p.inclusions.includes(s)) && (
              <div>
                <p className="mb-1.5 text-xs text-gray-400">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {INCLUSION_SUGGESTIONS.filter((s) => !p.inclusions.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set({ inclusions: [...p.inclusions, s] })}
                      className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold-dark"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar: status + live preview */}
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="p-5">
            <Toggle
              label="Published"
              description={p.published ? "Visible on the website after saving." : "Draft — hidden from the website."}
              checked={p.published}
              onChange={(v) => set({ published: v })}
            />
          </Card>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Live preview</p>
            <div className={cn("pointer-events-none mx-auto max-w-[360px] transition-opacity", !p.published && "opacity-60")}>
              <PackageCard pkg={{ ...p, name: p.name || "Package name" }} country={countryName} whatsappNumber="" />
            </div>
          </div>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={busy}
        onSave={save}
        onDiscard={() => (isNew ? router.push("/admin/packages") : setEdit(original))}
      />
      {dialog}
    </>
  );
}
