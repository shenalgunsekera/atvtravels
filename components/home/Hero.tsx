"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-dvh min-h-[600px] flex items-center justify-center overflow-hidden bg-navy">
      {/* Looping background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        preload="auto"
      >
        <source src="/videos/hero/hero.webm?v=20260329" type="video/webm" />
      </video>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/45 via-navy/40 to-navy/72" />

      {/* Hero content */}
      <div className="relative z-10 text-left sm:text-center px-5 sm:px-6 max-w-4xl w-full mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-gold mb-5"
        >
          Explore the World with ATV Travels
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="font-serif text-white leading-[1.1] mb-5"
          style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.2rem)" }}
        >
          Your Journey,{" "}
          <em className="text-gold not-italic">Our Passion</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-white/80 text-base sm:text-lg leading-relaxed mb-9 max-w-2xl sm:mx-auto"
        >
          Premium tour packages to Thailand, Malaysia, Maldives &amp; Bali.
          <br className="hidden sm:block" />
          Crafted with care. Delivered with excellence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="flex gap-4 justify-start sm:justify-center flex-wrap"
        >
          <Link
            href="/packages"
            className="bg-gold hover:bg-gold-light text-navy font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(201,168,76,0.5)] text-sm sm:text-base"
          >
            Explore Packages
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white/70 text-white bg-white/8 backdrop-blur-sm font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 text-sm sm:text-base"
          >
            Get In Touch
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 animate-bounce-slow z-10 flex flex-col items-center gap-2 text-white/50 text-[0.65rem] tracking-[0.2em] uppercase"
      >
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
}
