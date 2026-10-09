"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CircleCheck, DatabaseBackup, FolderOpen, House, Images, MapPin, Package, Plus, Settings, TriangleAlert, Upload,
} from "lucide-react";
import { Badge, Card, LoadError, PageHeader, Spinner } from "@/components/admin/ui";
import { api, errorMessage } from "@/components/admin/api";
import { timeAgo } from "@/components/admin/format";
import { thumb, type MediaItem } from "@/components/admin/media";
import type { BackupInfo } from "@/lib/store";
import type { PackagesData, SiteContent } from "@/lib/site-types";

type Overview = { site: SiteContent; packages: PackagesData; media: MediaItem[]; backups: BackupInfo[] };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([
      api<{ data: SiteContent }>("/api/admin/content/site"),
      api<{ data: PackagesData }>("/api/admin/content/packages"),
      api<{ items: MediaItem[] }>("/api/admin/media").catch(() => ({ items: [] as MediaItem[] })),
      api<{ backups: BackupInfo[] }>("/api/admin/backups"),
    ])
      .then(([s, p, m, b]) => setData({ site: s.data, packages: p.data, media: m.items, backups: b.backups }))
      .catch((e) => setError(errorMessage(e)));
  };
  useEffect(load, []);

  if (error) return <LoadError message={error} onRetry={load} />;
  if (!data) return <Spinner />;

  const countries = Object.values(data.packages);
  const packages = countries.flatMap((c) => c.packages.map((p) => ({ ...p, countryId: c.id, countryName: c.name })));
  const live = packages.filter((p) => p.published).length;
  const drafts = packages.length - live;
  const uploads = data.media.filter((m) => !m.builtIn).length;
  const lastBackup = data.backups[0];

  // Things worth fixing, in priority order.
  const issues: { text: string; href: string }[] = [];
  const s = data.site.settings;
  if (!/^\d{9,15}$/.test(s.whatsappNumber)) issues.push({ text: "WhatsApp number looks incomplete — enquiries won't reach you", href: "/admin/settings#contact" });
  for (const c of countries) {
    if (c.visible && !c.packages.some((p) => p.published)) issues.push({ text: `${c.name} has no published packages yet`, href: `/admin/packages/new?country=${c.id}` });
  }
  for (const p of packages) {
    if (!p.image) issues.push({ text: `"${p.name || "Untitled"}" has no photo`, href: `/admin/packages/${p.id}` });
    else if (!p.description) issues.push({ text: `"${p.name}" has no description`, href: `/admin/packages/${p.id}` });
  }
  if (!Object.values(s.socials).some(Boolean)) issues.push({ text: "Add your social media links so they show in the footer", href: "/admin/settings#social" });

  const stats = [
    { label: "Live packages", value: live, sub: drafts ? `${drafts} draft${drafts === 1 ? "" : "s"}` : "No drafts", icon: Package, href: "/admin/packages" },
    { label: "Destinations", value: countries.filter((c) => c.visible).length, sub: `${countries.length} total`, icon: MapPin, href: "/admin/destinations" },
    { label: "Gallery photos", value: data.site.gallery.photos.length, sub: "On home & about", icon: Images, href: "/admin/gallery" },
    { label: "Uploaded files", value: uploads, sub: `${data.media.length} in library`, icon: FolderOpen, href: "/admin/media" },
  ];

  const actions = [
    { label: "Add a package", icon: Plus, href: "/admin/packages/new" },
    { label: "Edit home page", icon: House, href: "/admin/pages/home" },
    { label: "Upload photos", icon: Upload, href: "/admin/media" },
    { label: "Contact details", icon: Settings, href: "/admin/settings#contact" },
  ];

  return (
    <>
      <PageHeader title={`${greeting()} 👋`} description="Here's an overview of your website." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
                <Icon size={18} />
              </div>
              <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
              <p className="text-[13px] font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Quick actions */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {actions.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gold/50 hover:bg-gold/5 hover:text-navy"
                >
                  <Icon size={16} className="text-gold-dark" />
                  {label}
                  <ArrowRight size={14} className="ml-auto text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-dark" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Packages */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Packages</h2>
              <Link href="/admin/packages" className="text-xs font-semibold text-gold-dark hover:underline">View all</Link>
            </div>
            {packages.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No packages yet. <Link href="/admin/packages/new" className="font-semibold text-gold-dark hover:underline">Add your first one →</Link>
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {packages.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/packages/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                      <span className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.image && <img src={thumb(p.image, 256)} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{p.name || "Untitled"}</span>
                        <span className="block text-xs text-gray-500">{p.countryName} · {p.duration || "No duration"}</span>
                      </span>
                      {p.published ? <Badge tone="green">Live</Badge> : <Badge tone="amber">Draft</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Checklist */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Suggestions</h2>
            {issues.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <CircleCheck size={16} /> Everything looks great.
              </p>
            ) : (
              <ul className="space-y-1">
                {issues.slice(0, 6).map((i) => (
                  <li key={i.text}>
                    <Link href={i.href} className="group flex items-start gap-2.5 rounded-lg px-2 py-2 text-[13px] text-gray-700 hover:bg-amber-50">
                      <TriangleAlert size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                      <span className="flex-1">{i.text}</span>
                      <ArrowRight size={13} className="mt-0.5 text-gray-300 group-hover:text-amber-600" />
                    </Link>
                  </li>
                ))}
                {issues.length > 6 && <li className="px-2 pt-1 text-xs text-gray-400">+ {issues.length - 6} more</li>}
              </ul>
            )}
          </Card>

          {/* Backups */}
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <DatabaseBackup size={17} />
              </span>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">Automatic backups</h2>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  {lastBackup ? `Last change backed up ${timeAgo(lastBackup.createdAt)}.` : "Your first backup is made when you save a change."}
                </p>
                <Link href="/admin/backups" className="mt-2 inline-block text-xs font-semibold text-gold-dark hover:underline">Manage backups →</Link>
              </div>
            </div>
          </Card>

          {/* Pages */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Edit a page</h2>
            <div className="space-y-1">
              {[
                { label: "Home", href: "/admin/pages/home" },
                { label: "Tour packages", href: "/admin/pages/packages" },
                { label: "About us", href: "/admin/pages/about" },
                { label: "Contact", href: "/admin/pages/contact" },
              ].map((p) => (
                <Link key={p.href} href={p.href} className="flex items-center justify-between rounded-lg px-2 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-navy">
                  {p.label}
                  <ArrowRight size={13} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
