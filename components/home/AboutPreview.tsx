import Link from "next/link";
import { Check } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SiteImage from "@/components/ui/SiteImage";
import type { SiteContent } from "@/lib/site-types";

export default function AboutPreview({ about }: { about: SiteContent["home"]["about"] }) {
  return (
    <section className="section-padding">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <ScrollReveal direction="left">
            <div className="relative rounded-2xl overflow-hidden group h-[380px] sm:h-[480px]">
              <SiteImage
                src={about.image}
                alt="Happy travellers on an ATV Travels tour"
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </ScrollReveal>

          {/* Text */}
          <div>
            <ScrollReveal direction="right" delay={0.05}>
              <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
                {about.eyebrow}
              </span>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <h2 className="font-serif text-navy mb-5">{about.title}</h2>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              {about.paragraphs.map((p, i) => (
                <p key={i} className={`text-gray-500 leading-relaxed ${i === about.paragraphs.length - 1 ? "mb-7" : "mb-4"}`}>
                  {p}
                </p>
              ))}
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {about.features.map((f, i) => (
                <ScrollReveal key={i} direction="up" delay={0.1 + i * 0.05}>
                  <div className="flex items-center gap-2.5">
                    <Check size={14} className="text-teal flex-shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">{f}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {about.buttonLabel && (
              <ScrollReveal direction="up" delay={0.35}>
                <Link
                  href={about.buttonHref || "/about"}
                  className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,31,58,0.3)] text-sm"
                >
                  {about.buttonLabel}
                </Link>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
