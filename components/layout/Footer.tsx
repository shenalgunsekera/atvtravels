import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import Logo from "./Logo";
import type { SiteSettings } from "@/lib/site-types";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/packages", label: "Tour Packages" },
  { href: "/contact", label: "Contact Us" },
];

interface Props {
  settings: SiteSettings;
  countries: { id: string; name: string }[];
}

export default function Footer({ settings, countries }: Props) {
  const year = new Date().getFullYear();
  const socials = [
    { href: settings.socials.facebook, icon: Facebook, label: "Facebook" },
    { href: settings.socials.instagram, icon: Instagram, label: "Instagram" },
    { href: settings.socials.youtube, icon: Youtube, label: "YouTube" },
    { href: settings.socials.tiktok, icon: Music2, label: "TikTok" },
  ].filter((s) => s.href);
  const phones = [settings.phonePrimary, settings.phoneSecondary].filter(Boolean).join(" / ");

  return (
    <footer className="bg-navy-dark text-white/60">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo settings={settings} />
            </div>
            <p className="text-sm leading-relaxed mb-5">{settings.footerAbout}</p>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-gold hover:text-navy transition-all duration-250"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Destinations */}
          <div>
            <h5 className="font-serif text-white text-base mb-4 pb-3 border-b border-white/10">Destinations</h5>
            <ul className="space-y-2.5">
              {countries.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/packages?country=${d.id}`}
                    className="text-sm flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                    {d.name} Packages
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-serif text-white text-base mb-4 pb-3 border-b border-white/10">Quick Links</h5>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm flex items-center gap-2 hover:text-gold transition-colors">
                    <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-serif text-white text-base mb-4 pb-3 border-b border-white/10">Get In Touch</h5>
            <div className="space-y-3 mb-5">
              {phones && (
                <div className="flex items-start gap-3">
                  <Phone size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{phones}</span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-start gap-3">
                  <Mail size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="text-sm hover:text-gold transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{settings.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {year} <span className="text-gold">{settings.brandName}</span>. All rights reserved.</p>
          {settings.footerNote && <p>{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
