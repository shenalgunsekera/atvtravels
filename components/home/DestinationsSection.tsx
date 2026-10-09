import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SiteImage from "@/components/ui/SiteImage";
import type { Country, SectionHead } from "@/lib/site-types";

export default function DestinationsSection({ head, countries }: { head: SectionHead; countries: Country[] }) {
  const cols = countries.length >= 4 ? "lg:grid-cols-4" : countries.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section className="section-padding bg-[#F8F6F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader label={head.label} title={head.title} description={head.description} />

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-5`}>
          {countries.map((dest, i) => (
            <ScrollReveal key={dest.id} direction="up" delay={(i % 4) * 0.1}>
              <Link href={`/packages?country=${dest.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <SiteImage
                    src={dest.heroImage || dest.cardImage}
                    alt={dest.name}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent transition-all duration-400 group-hover:from-navy/95 group-hover:via-navy/40" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-gold mb-1.5">
                      {dest.tagline}
                    </p>
                    <h3 className="font-serif text-xl text-white mb-2 leading-snug">
                      {dest.name}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed mb-3 max-h-0 overflow-hidden transition-all duration-400 opacity-0 group-hover:max-h-20 group-hover:opacity-100">
                      {dest.shortDescription || dest.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-wide opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      View Packages <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
