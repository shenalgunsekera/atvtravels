import Link from "next/link";
import SiteImage from "./SiteImage";
import type { PageHero as PageHeroData } from "@/lib/site-types";

// Banner at the top of inner pages (About, Packages, Contact).
export default function PageHero({ hero, crumb }: { hero: PageHeroData; crumb: string }) {
  return (
    <section className="relative h-[52vh] min-h-[380px] flex items-center justify-center overflow-hidden bg-navy">
      <div className="absolute inset-0">
        <SiteImage src={hero.image} alt={hero.title} fill preload sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/55 to-navy/78" />
      </div>
      <div className="relative z-10 text-center px-5">
        {hero.eyebrow && (
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">{hero.eyebrow}</span>
        )}
        <h1 className="font-serif text-white mb-3">{hero.title}</h1>
        {hero.subtitle && <p className="text-white/75 text-base max-w-md mx-auto">{hero.subtitle}</p>}
        <nav className="flex items-center gap-2 justify-center mt-5 text-xs text-white/50">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold">{crumb}</span>
        </nav>
      </div>
    </section>
  );
}
