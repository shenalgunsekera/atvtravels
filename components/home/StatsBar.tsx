"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { value: 2, suffix: "+", label: "Years Experience" },
  { value: 4,  suffix: "",  label: "Destinations" },
  { value: 100, suffix: "+", label: "Happy Travellers" },
  { value: 4, suffix: "+", label: "Tour Packages" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const step = duration / target;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-serif text-3xl sm:text-4xl text-gold font-bold leading-none">
      {count}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <div className="bg-navy py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
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
