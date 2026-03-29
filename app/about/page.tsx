import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Users, Globe, Award } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CtaBanner from "@/components/home/CtaBanner";
import Experience from "@/components/home/Experience";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about ATV Travels — our story, mission, and why hundreds of travellers choose us for their dream holidays across Southeast Asia.",
};

const values = [
  {
    icon: Heart,
    title: "Passion for Travel",
    desc: "We're travellers first. Every itinerary is built with genuine love for the places we send you.",
  },
  {
    icon: Users,
    title: "People-First Service",
    desc: "From first enquiry to safe return, our team is always available, approachable, and attentive.",
  },
  {
    icon: Globe,
    title: "Local Expertise",
    desc: "Deep local knowledge across all four destinations means better stays, routes, and experiences.",
  },
  {
    icon: Award,
    title: "Quality Assured",
    desc: "Every hotel, transfer, and activity partner is personally vetted for quality and reliability.",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop",
];

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative h-[52vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop"
            alt="ATV Travels team"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/55 to-navy/75" />
        </div>
        <div className="relative z-10 text-center px-5">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
            Our Story
          </span>
          <h1 className="font-serif text-white mb-3">About ATV Travels</h1>
          <p className="text-white/75 text-base max-w-md mx-auto">
            A passion-driven travel agency built on trust, excellence, and unforgettable experiences.
          </p>
          <nav className="flex items-center gap-2 justify-center mt-5 text-xs text-white/50">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gold">About Us</span>
          </nav>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative rounded-2xl overflow-hidden h-[420px] sm:h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=900&q=80&auto=format&fit=crop"
                  alt="ATV Travels team planning holidays"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>

            <div>
              <ScrollReveal direction="right" delay={0.05}>
                <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">Our Mission</span>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <h2 className="font-serif text-navy mb-5">
                  Making Dream Holidays <em className="text-gold">Reality</em>
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.14}>
                <p className="text-gray-500 leading-relaxed mb-4">
                  ATV Travels was founded with a simple but powerful mission: to make exceptional travel
                  accessible to everyone. We started as a small team of passionate travellers who were tired
                  of cookie-cutter tours and impersonal service.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Over the years, we&apos;ve grown into a trusted travel agency specialising in Southeast Asia
                  and the Indian Ocean, helping hundreds of families, couples, and solo adventurers create
                  memories that last a lifetime.
                </p>
                <p className="text-gray-500 leading-relaxed mb-7">
                  We believe travel is not just about the destination — it&apos;s about how you feel every
                  single moment of the journey. That&apos;s why we obsess over every detail.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Personalised packages",
                    "Transparent pricing",
                    "No hidden costs",
                    "Flexible itineraries",
                    "Family-friendly",
                    "Honeymoon specialists",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={13} className="text-teal flex-shrink-0" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-[#F8F6F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            label="What Drives Us"
            title="Our Core Values"
            description="The principles behind every trip we plan and every client relationship we build."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} direction="up" delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-7 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1.5 hover:border-gold/30 transition-all duration-350 group">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-serif text-navy text-base mb-2.5">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Experience />    

      <CtaBanner />
    </>
  );
}
