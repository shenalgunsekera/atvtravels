import { Shield, DollarSign, Users, Headphones, Map, Star } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

const reasons = [
  {
    icon: Shield,
    title: "Trusted & Reliable",
    desc: "Over 10 years of experience delivering exceptional holidays with a track record you can trust.",
  },
  {
    icon: DollarSign,
    title: "Best Value Pricing",
    desc: "Competitive rates with no hidden fees. We negotiate the best deals so your money goes further.",
  },
  {
    icon: Map,
    title: "Expert Itineraries",
    desc: "Every trip is carefully crafted by destination specialists who know these places inside out.",
  },
  {
    icon: Users,
    title: "Family & Group Friendly",
    desc: "Packages designed for couples, families, solo travellers, and large groups alike.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "We're always just a WhatsApp message away, before, during, and after your trip.",
  },
  {
    icon: Star,
    title: "Flexible & Customisable",
    desc: "No rigid packages — every itinerary can be personalised to match your travel style.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-navy">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          label="Why ATV Travels"
          title="The ATV Difference"
          description="We don't just sell tours. We craft experiences that stay with you long after you return home."
          light
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} direction="up" delay={i * 0.08}>
              <div className="group bg-white/4 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/7 hover:border-gold/30 hover:-translate-y-1 transition-all duration-350">
                <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-navy">
                  <r.icon size={26} />
                </div>
                <h3 className="font-serif text-white text-lg mb-3">{r.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
