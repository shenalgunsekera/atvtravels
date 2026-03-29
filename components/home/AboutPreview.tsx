import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const features = [
  "Personalised Itineraries",
  "Flexible Pricing",
  "24/7 Support",
  "Trusted Local Partners",
  "Group & Family Tours",
  "Hassle-free Planning",
];

export default function AboutPreview() {
  return (
    <section className="section-padding">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <ScrollReveal direction="left">
            <div className="relative rounded-2xl overflow-hidden group">
              <Image
                src="/images/gallery/Shenal_gunasekera_upscale_upscaled.jpg"
                alt="Happy travellers on an ATV Travels tour"
                width={600}
                height={520}
                className="w-full h-[380px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Badge */}
            </div>
          </ScrollReveal>

          {/* Text */}
          <div>
            <ScrollReveal direction="right" delay={0.05}>
              <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
                Who We Are
              </span>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <h2 className="font-serif text-navy mb-5">
                Your Trusted Travel Partner
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <p className="text-gray-500 leading-relaxed mb-4">
                At ATV Travels, we believe every journey should be as seamless as it is memorable.
                With over a decade of experience crafting holidays across Southeast Asia, we take
                the stress out of travel so you can focus on the moments that matter.
              </p>
              <p className="text-gray-500 leading-relaxed mb-7">
                From budget-friendly escapes to luxury retreats, our team handles every detail —
                flights, hotels, transfers, activities, and more — tailored perfectly to you.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f, i) => (
                <ScrollReveal key={f} direction="up" delay={0.1 + i * 0.05}>
                  <div className="flex items-center gap-2.5">
                    <Check size={14} className="text-teal flex-shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">{f}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" delay={0.35}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,31,58,0.3)] text-sm"
              >
                Learn More About Us
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
