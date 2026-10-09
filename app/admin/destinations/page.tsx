"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, IconButton, LoadError, Modal, PageHeader, Spinner, TextArea, TextField, Toggle, useConfirm } from "@/components/admin/ui";
import { MediaField, thumb } from "@/components/admin/media";
import { useDoc } from "@/components/admin/useDoc";
import { useToast } from "@/components/admin/toast";
import { slugify } from "@/lib/site-normalize";
import type { Country, PackagesData } from "@/lib/site-types";

const blankCountry = (): Country => ({
  id: "",
  name: "",
  tagline: "",
  description: "",
  shortDescription: "",
  heroImage: "",
  cardImage: "",
  visible: true,
  packages: [],
});

// Rebuild the object with keys in the given order (object key order = display order).
function reorder(data: PackagesData, ids: string[]): PackagesData {
  return Object.fromEntries(ids.map((id) => [id, data[id]]));
}

export default function DestinationsPage() {
  const doc = useDoc("packages");
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<{ country: Country; isNew: boolean } | null>(null);

  const data = doc.saved;
  const list = Object.values(data ?? {});

  async function saveCountry() {
    if (!editing || !data) return;
    const c = { ...editing.country, name: editing.country.name.trim() };
    if (!c.name) return toast.error("Please enter a destination name.");
    let next: PackagesData;
    if (editing.isNew) {
      const id = slugify(c.id || c.name);
      if (!id) return toast.error("Please enter a valid name.");
      if (data[id]) return toast.error(`A destination with the link "${id}" already exists.`);
      next = { ...structuredClone(data), [id]: { ...c, id } };
    } else {
      next = structuredClone(data);
      next[c.id] = c;
    }
    if (await doc.commit(next, editing.isNew ? "Destination added" : "Destination saved")) setEditing(null);
  }

  async function remove(c: Country) {
    if (!data) return;
    const ok = await confirm({
      title: `Delete ${c.name}?`,
      message:
        c.packages.length > 0 ? (
          <>This also deletes its <strong>{c.packages.length} package{c.packages.length === 1 ? "" : "s"}</strong>. Tip: hide the destination instead if you might need it again.</>
        ) : (
          "It will be removed from the website."
        ),
      confirmLabel: "Delete destination",
      danger: true,
    });
    if (!ok) return;
    const next = structuredClone(data);
    delete next[c.id];
    await doc.commit(next, `${c.name} deleted`, data);
  }

  function shift(index: number, delta: number) {
    if (!data) return;
    const ids = Object.keys(data);
    const to = index + delta;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    void doc.commit(reorder(data, ids), "Order updated");
  }

  if (doc.loadError) return <LoadError message={doc.loadError} onRetry={doc.reload} />;

  const e = editing?.country;
  const setE = (patch: Partial<Country>) => setEditing((s) => (s ? { ...s, country: { ...s.country, ...patch } } : s));

  return (
    <>
      <PageHeader
        title="Destinations"
        description="Countries you offer tours to. They appear as tiles on the home page and as filters on the packages page."
        actions={
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setEditing({ country: blankCountry(), isNew: true })}>
            Add destination
          </Button>
        }
      />

      {!data ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<MapPin size={22} />}
          title="No destinations yet"
          text="Add your first destination, like Thailand or Bali."
          action={<Button variant="primary" icon={<Plus size={15} />} onClick={() => setEditing({ country: blankCountry(), isNew: true })}>Add destination</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((c, i) => {
            const live = c.packages.filter((p) => p.published).length;
            return (
              <Card key={c.id} className="group overflow-hidden">
                <button onClick={() => setEditing({ country: structuredClone(c), isNew: false })} className="relative block aspect-[16/8] w-full overflow-hidden bg-gray-100 text-left">
                  {c.heroImage || c.cardImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(c.heroImage || c.cardImage, 640)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : null}
                  <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
                  <span className="absolute bottom-3 left-4 right-4">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{c.tagline}</span>
                    <span className="block font-serif text-xl text-white">{c.name}</span>
                  </span>
                  {!c.visible && (
                    <span className="absolute right-3 top-3"><Badge tone="gray">Hidden</Badge></span>
                  )}
                </button>
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <Link href={`/admin/packages?country=${c.id}`} className="text-[13px] text-gray-500 hover:text-navy">
                    <span className="font-semibold text-gray-800">{c.packages.length}</span> package{c.packages.length === 1 ? "" : "s"}
                    {c.packages.length !== live && <span className="text-gray-400"> · {live} live</span>}
                  </Link>
                  <div className="flex items-center">
                    <IconButton label="Move earlier" disabled={i === 0} onClick={() => shift(i, -1)}><ArrowUp size={15} /></IconButton>
                    <IconButton label="Move later" disabled={i === list.length - 1} onClick={() => shift(i, 1)}><ArrowDown size={15} /></IconButton>
                    <IconButton
                      label={c.visible ? "Hide from website" : "Show on website"}
                      onClick={() => {
                        const next = structuredClone(data);
                        next[c.id].visible = !c.visible;
                        void doc.commit(next, c.visible ? `${c.name} hidden from the website` : `${c.name} is now visible`);
                      }}
                    >
                      {c.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </IconButton>
                    <IconButton label="Edit" onClick={() => setEditing({ country: structuredClone(c), isNew: false })}><Pencil size={15} /></IconButton>
                    <IconButton label="Delete" tone="danger" onClick={() => remove(c)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing?.isNew ? "Add destination" : `Edit ${editing?.country.name || "destination"}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={doc.saving} onClick={saveCountry}>
              {editing?.isNew ? "Add destination" : "Save changes"}
            </Button>
          </>
        }
      >
        {e && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" placeholder="e.g. Sri Lanka" value={e.name} onChange={(v) => setE({ name: v })} autoFocus={editing?.isNew} />
              <TextField label="Tagline" placeholder="e.g. Pearl of the Indian Ocean" value={e.tagline} onChange={(v) => setE({ tagline: v })} />
            </div>
            {editing?.isNew ? (
              <Field label="Link name" hint="Used in the web address. Can't be changed later.">
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                  <span className="pl-3 text-sm text-gray-400">/packages?country=</span>
                  <input
                    value={e.id || slugify(e.name)}
                    onChange={(ev) => setE({ id: slugify(ev.target.value) })}
                    className="flex-1 bg-transparent px-1 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </Field>
            ) : null}
            <TextArea label="Short description" hint="Shown when hovering the destination tile on the home page." value={e.shortDescription} onChange={(v) => setE({ shortDescription: v })} rows={2} />
            <TextArea label="Full description" hint="Shown above this destination's packages." value={e.description} onChange={(v) => setE({ description: v })} rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MediaField label="Home page tile" hint="Portrait photo works best." aspect="aspect-video" value={e.heroImage} onChange={(v) => setE({ heroImage: v })} />
              <MediaField label="Packages page thumbnail" hint="Small square next to the destination name." aspect="aspect-video" value={e.cardImage} onChange={(v) => setE({ cardImage: v })} />
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <Toggle label="Show on website" description="Hidden destinations and their packages are not shown anywhere on the site." checked={e.visible} onChange={(v) => setE({ visible: v })} />
            </div>
          </div>
        )}
      </Modal>
      {dialog}
    </>
  );
}
