import ScrollReveal from "./ScrollReveal";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export default function SectionHeader({
  label,
  title,
  description,
  align = "center",
  light = false,
}: Props) {
  return (
    <div className={cn("mb-12", align === "center" && "text-center")}>
      {label && (
        <ScrollReveal direction="fade">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gold block mb-3">
            {label}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal direction="up" delay={0.05}>
        <h2
          className={cn(
            "font-serif mb-4",
            light ? "text-white" : "text-navy"
          )}
        >
          {title}
        </h2>
      </ScrollReveal>
      {description && (
        <ScrollReveal direction="up" delay={0.1}>
          <p
            className={cn(
              "text-base leading-relaxed",
              align === "center" && "max-w-xl mx-auto",
              light ? "text-white/65" : "text-gray-500"
            )}
          >
            {description}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
