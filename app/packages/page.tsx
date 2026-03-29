"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCountries } from "@/lib/packages";
import PackageCard from "@/components/packages/PackageCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CtaBanner from "@/components/home/CtaBanner";

const countries = getAllCountries();

export default function PackagesPage() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState("all");

  useEffect(() => {
    const c = searchParams.get("country");
    if (c && countries.find((x) => x.id === c)) setActive(c);
  }, [searchParams]);

  const filtered = active === "all" ? countries : countries.filter((c) => c.id === active);

  return (
    <>
      {/* Page Hero */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80&auto=format&fit=crop"
            alt="Tour packages"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/55 to-navy/78" />
        </div>
        <div className="relative z-10 text-center px-5">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
            Explore &amp; Discover
          </span>
          <h1 className="font-serif text-white mb-3">Our Tour Packages</h1>
          <p className="text-white/75 text-base max-w-md mx-auto">
            Handcrafted holiday packages across Southeast Asia and the Maldives.
            Contact us for the best price.
          </p>
          <nav className="flex items-center gap-2 justify-center mt-5 text-xs text-white/50">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gold">Tour Packages</span>
          </nav>
        </div>
      </section>

      {/* Packages */}
      <section className="section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            label="Browse by Destination"
            title="Find Your Perfect Package"
            description="Each package includes flights, hotel, transfers, and curated experiences. Contact us to get the best price for your travel dates."
          />

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
                        <Image src={country.cardImage} alt={country.name} fill className="object-cover" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {country.packages.map((pkg, i) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <PackageCard pkg={pkg} country={country.name} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
