"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, MapPin, House, Info, Phone, LayoutGrid, Images, Settings, FolderOpen,
  DatabaseBackup, ExternalLink, LogOut, Menu, X,
} from "lucide-react";
import { ToastProvider } from "./toast";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Tours",
    items: [
      { href: "/admin/packages", label: "Packages", icon: Package },
      { href: "/admin/destinations", label: "Destinations", icon: MapPin },
    ],
  },
  {
    group: "Pages",
    items: [
      { href: "/admin/pages/home", label: "Home page", icon: House },
      { href: "/admin/pages/packages", label: "Packages page", icon: LayoutGrid },
      { href: "/admin/pages/about", label: "About page", icon: Info },
      { href: "/admin/pages/contact", label: "Contact page", icon: Phone },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/gallery", label: "Photo gallery", icon: Images },
      { href: "/admin/media", label: "Media library", icon: FolderOpen },
      { href: "/admin/settings", label: "Site settings", icon: Settings },
      { href: "/admin/backups", label: "Backups", icon: DatabaseBackup },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/admin";
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-serif text-sm font-bold text-navy">ATV</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">ATV Travels</span>
            <span className="block text-[11px] text-white/45">Admin panel</span>
          </span>
        </Link>
        <button onClick={() => setOpen(false)} className="p-1 text-white/60 hover:text-white lg:hidden" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.group || "main"}>
            {section.group && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">{section.group}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon size={17} className={active ? "text-gold" : ""} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={17} /> View website
        </a>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="admin-ui min-h-dvh bg-[#F5F6F8]">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy lg:block">{sidebar}</aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 bg-navy shadow-2xl animate-[slideIn_.2s_ease]">{sidebar}</aside>
          </div>
        )}

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="-ml-1 p-1.5 text-gray-700" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-navy">ATV Admin</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500" aria-label="View website">
            <ExternalLink size={18} />
          </a>
        </header>

        <main className="lg:pl-64">
          <div className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:px-6 lg:px-10 lg:py-10">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
