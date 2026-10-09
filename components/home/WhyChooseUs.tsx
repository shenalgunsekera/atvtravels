import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getIcon } from "@/lib/icons";
import type { IconItem, SectionHead } from "@/lib/site-types";

export default function WhyChooseUs({ head, items }: { head: SectionHead; items: IconItem[] }) {
  return (
    <section className="section-padding bg-navy">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader label={head.label} title={head.title} description={head.description} light />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((r, i) => {
            const Icon = getIcon(r.icon);
            return (
              <ScrollReveal key={i} direction="up" delay={(i % 6) * 0.08}>
                <div className="group h-full bg-white/4 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/7 hover:border-gold/30 hover:-translate-y-1 transition-all duration-350">
                  <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-navy">
                    <Icon size={26} />
                  </div>
                  <h3 className="font-serif text-white text-lg mb-3">{r.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{r.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
