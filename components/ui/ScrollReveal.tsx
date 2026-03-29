"use client";

import { useEffect, useRef } from "react";
import { type Variants, motion, useAnimation, useInView } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale";

interface Props {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants: Record<Direction, Variants> = {
  up:    { hidden: { opacity: 0, y: 50 },   visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -50 },  visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -50 },  visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 50 },   visible: { opacity: 1, x: 0 } },
  fade:  { hidden: { opacity: 0 },           visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("visible");
    else if (!once) controls.start("hidden");
  }, [inView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[direction]}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
