import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send } from "lucide-react";

const destinations = ["Thailand", "Malaysia", "Maldives", "Bali"];
const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/packages", label: "Tour Packages" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-dark text-white/60">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex flex-col leading-none mb-4">
              <span className="font-serif text-2xl font-bold text-white tracking-wide">ATV</span>
              <span className="text-[0.55rem] tracking-[0.3em] text-gold font-semibold uppercase">Travels</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Your trusted partner for unforgettable journeys across Southeast Asia and beyond.
              Crafted with care, delivered with passion.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-gold hover:text-navy transition-all duration-250"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h5 className="font-serif text-white text-base mb-4 pb-3 border-b border-white/10">Destinations</h5>
            <ul className="space-y-2.5">
              {destinations.map((d) => (
                <li key={d}>
                  <Link
                    href={`/packages?country=${d.toLowerCase()}`}
                    className="text-sm flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                    {d} Packages
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

          {/* Contact & Newsletter */}
          <div>
            <h5 className="font-serif text-white text-base mb-4 pb-3 border-b border-white/10">Get In Touch</h5>
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm">+94 71 417 9589 / +94 70 717 9589</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm">info@atvtravels.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm">Colombo, Sri Lanka</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {year} <span className="text-gold">ATV Travels</span>. All rights reserved.</p>
          <p>Designed with passion for travel ✦</p>
        </div>
      </div>
    </footer>
  );
}
