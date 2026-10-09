"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Stat } from "@/lib/site-types";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    // ~1.8s regardless of the number's size, in at most 60 steps.
    const steps = Math.max(1, Math.min(60, Math.round(target)));
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setCount(i >= steps ? target : Math.round((target * i) / steps));
      if (i >= steps) clearInterval(timer);
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-serif text-3xl sm:text-4xl text-gold font-bold leading-none">
      {count}{suffix}
    </span>
  );
}

export default function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="bg-navy py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center py-5 px-4 ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}
            >
              <CountUp target={s.value} suffix={s.suffix} />
              <p className="text-[0.7rem] text-white/50 tracking-widest uppercase mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
