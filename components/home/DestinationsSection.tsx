import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

const destinations = [
  {
    id: "thailand",
    name: "Thailand",
    label: "Land of Smiles",
    description: "Golden temples, turquoise beaches, and vibrant street food culture.",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "malaysia",
    name: "Malaysia",
    label: "Truly Asia",
    description: "Iconic skylines, ancient rainforests, and a legendary food scene.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "maldives",
    name: "Maldives",
    label: "Indian Ocean Paradise",
    description: "Overwater villas, crystal lagoons, and sunsets beyond imagination.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "bali",
    name: "Bali",
    label: "Island of the Gods",
    description: "Ancient temples, emerald rice terraces, and soul-nourishing serenity.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80&auto=format&fit=crop",
  },
];

export default function DestinationsSection() {
  return (
    <section className="section-padding bg-[#F8F6F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          label="Where We Go"
          title="Our Destinations"
          description="Handpicked destinations across Southeast Asia and the Indian Ocean, each offering a unique world to explore."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((dest, i) => (
            <ScrollReveal key={dest.id} direction="up" delay={i * 0.1}>
              <Link href={`/packages?country=${dest.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent transition-all duration-400 group-hover:from-navy/95 group-hover:via-navy/40" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-gold mb-1.5">
                      {dest.label}
                    </p>
                    <h3 className="font-serif text-xl text-white mb-2 leading-snug">
                      {dest.name}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed mb-3 max-h-0 overflow-hidden transition-all duration-400 opacity-0 group-hover:max-h-20 group-hover:opacity-100">
                      {dest.description}
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
