import SiteImage from "@/components/ui/SiteImage";
import type { SiteSettings } from "@/lib/site-types";

export default function Logo({ settings }: { settings: SiteSettings }) {
  if (settings.logoImage) {
    return (
      <SiteImage
        src={settings.logoImage}
        alt={settings.brandName}
        width={160}
        height={48}
        className="h-10 w-auto object-contain"
      />
    );
  }
  return (
    <span className="flex flex-col leading-none">
      <span className="font-serif text-2xl font-bold text-white tracking-wide">{settings.logoText}</span>
      <span className="text-[0.55rem] tracking-[0.3em] text-gold font-semibold uppercase">{settings.logoSubtext}</span>
    </span>
  );
}
