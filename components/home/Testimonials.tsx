import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Quote } from "lucide-react";
import type { SectionHead, Testimonial } from "@/lib/site-types";

function initials(name: string) {
  const words = name.replace(/&/g, " ").split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return ((words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function Testimonials({ head, items }: { head: SectionHead; items: Testimonial[] }) {
  return (
    <section className="section-padding bg-[#F8F6F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader label={head.label} title={head.title} description={head.description} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {items.map((t, i) => (
            <ScrollReveal key={i} direction="up" delay={(i % 3) * 0.1}>
              <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 relative">
                <Quote size={36} className="text-gold/20 absolute top-6 left-6" />
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-gold text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                    {initials(t.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.trip}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
