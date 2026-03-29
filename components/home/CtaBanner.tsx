import Link from "next/link";
import { MessageCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const WA_NUMBER = "94714179589";
const WA_MESSAGE = encodeURIComponent("Hi ATV Travels! I'd like to plan my holiday.");
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function CtaBanner() {
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
        <ScrollReveal direction="fade">
          <span className="text-xs font-semibold tracking-[0.22em] uppercase text-gold block mb-3">
            Start Your Adventure
          </span>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.05}>
          <h2 className="font-serif text-white mb-4">
            Your Dream Holiday <em className="text-gold">Awaits</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.1}>
          <p className="text-white/65 text-base sm:text-lg max-w-lg mx-auto mb-9">
            Talk to our travel experts today. Tell us where you want to go and
            we&apos;ll handle every last detail.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.18}>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/packages"
              className="bg-gold hover:bg-gold-light text-navy font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(201,168,76,0.5)] text-sm sm:text-base"
            >
              View All Packages
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bc5b] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)] text-sm sm:text-base"
            >
              <MessageCircle size={18} />
              WhatsApp Us Now
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
