import Link from "next/link";
import { MessageCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { whatsappUrl } from "@/lib/site-normalize";
import type { SiteContent } from "@/lib/site-types";

export default function CtaBanner({ cta, whatsappNumber }: { cta: SiteContent["cta"]; whatsappNumber: string }) {
  return (
    <section className="relative py-24 overflow-hidden bg-navy-light">
      {/* Decorative dots */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, #C9A84C 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
        {cta.eyebrow && (
          <ScrollReveal direction="fade">
            <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
              {cta.eyebrow}
            </span>
          </ScrollReveal>
        )}
        <ScrollReveal direction="up" delay={0.05}>
          <h2 className="font-serif text-white mb-4">
            {cta.title} {cta.titleAccent && <em className="text-gold">{cta.titleAccent}</em>}
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.1}>
          <p className="text-white/65 text-base sm:text-lg max-w-lg mx-auto mb-9">{cta.text}</p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.18}>
          <div className="flex flex-wrap gap-4 justify-center">
            {cta.primaryLabel && (
              <Link
                href={cta.primaryHref || "/packages"}
                className="bg-gold hover:bg-gold-light text-navy font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(201,168,76,0.5)] text-sm sm:text-base"
              >
                {cta.primaryLabel}
              </Link>
            )}
            {cta.whatsappLabel && (
              <a
                href={whatsappUrl(whatsappNumber, cta.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bc5b] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)] text-sm sm:text-base"
              >
                <MessageCircle size={18} />
                {cta.whatsappLabel}
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
