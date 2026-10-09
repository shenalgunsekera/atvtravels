"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import PackageCard from "@/components/packages/PackageCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SiteImage from "@/components/ui/SiteImage";
import { whatsappUrl } from "@/lib/site-normalize";
import type { Country, SiteContent } from "@/lib/site-types";

interface Props {
  countries: Country[];
  page: SiteContent["packagesPage"];
  whatsappNumber: string;
}

// Follows ?country= in the URL. Kept in its own tiny Suspense boundary: useSearchParams opts its
// subtree out of server rendering, and this way the package grid itself stays server-rendered.
function CountryParam({ onChange }: { onChange: (country: string | null) => void }) {
  const params = useSearchParams();
  useEffect(() => onChange(params.get("country")), [params, onChange]);
  return null;
}

export default function PackagesView({ countries, page, whatsappNumber }: Props) {
  const [active, setActive] = useState("all");
  const onCountryParam = useCallback(
    (c: string | null) => setActive(c && countries.some((x) => x.id === c) ? c : "all"),
    [countries]
  );

  const filtered = active === "all" ? countries : countries.filter((c) => c.id === active);

  return (
    <section className="section-padding">
      <Suspense fallback={null}>
        <CountryParam onChange={onCountryParam} />
      </Suspense>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader label={page.intro.label} title={page.intro.title} description={page.intro.description} />

        {/* Filter */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-wrap gap-2.5 justify-center mb-14">
            {[{ id: "all", name: "All Destinations" }, ...countries].map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-250 ${
                  active === c.id
                    ? "bg-gold border-gold text-navy"
                    : "border-gray-200 text-gray-600 hover:border-navy hover:text-navy bg-white"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Country sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            {filtered.map((country) => (
              <div key={country.id} className="mb-20 last:mb-0">
                {/* Country header */}
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <SiteImage src={country.cardImage} alt={country.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold mb-0.5">
                        {country.tagline}
                      </p>
                      <h2 className="font-serif text-navy text-2xl">{country.name}</h2>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{country.description}</p>
                </div>

                {/* Package grid */}
                {country.packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {country.packages.map((pkg, i) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <PackageCard
                          pkg={pkg}
                          country={country.name}
                          whatsappNumber={whatsappNumber}
                          cardNote={page.cardNote}
                          enquireLabel={page.enquireLabel}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F6F0]/60 px-6 py-10 text-center">
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">{page.emptyText}</p>
                    <a
                      href={whatsappUrl(whatsappNumber, `Hi! I'm interested in a ${country.name} tour. Could you send me some options?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-navy hover:bg-gold hover:text-navy text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300"
                    >
                      <MessageCircle size={14} />
                      Ask about {country.name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
