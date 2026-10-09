import SiteImage from "@/components/ui/SiteImage";
import SectionHeader from "@/components/ui/SectionHeader";
import type { SectionHead } from "@/lib/site-types";

function MarqueeRow({
  photos,
  fade,
  reverse = false,
  speed = 60,
}: {
  photos: string[];
  fade: string;
  reverse?: boolean;
  speed?: number;
}) {
  // Duplicate for seamless loop
  const items = [...photos, ...photos];
  const duration = `${Math.max(20, (photos.length * speed) / 10)}s`;

  return (
    <div className="marquee-row overflow-hidden relative">
      {/* fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${fade}, transparent)` }} />
      <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${fade}, transparent)` }} />

      <div
        className="flex gap-4 w-max"
        style={{
          animation: `marquee${reverse ? "Reverse" : ""} ${duration} linear infinite`,
        }}
      >
        {items.map((src, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 w-64 h-44 sm:w-72 sm:h-52 rounded-xl overflow-hidden group shadow-sm"
          >
            <SiteImage
              src={src}
              alt={`Happy ATV Travels customer ${(idx % photos.length) + 1}`}
              fill
              unoptimized
              loading={idx < 8 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="288px"
            />
            {/* subtle overlay on hover */}
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/15 transition-colors duration-300 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Two-row scrolling photo gallery, used on the home and about pages.
export default function PhotoMarquee({
  head,
  photos,
  background = "#F8F6F0",
}: {
  head: SectionHead;
  photos: string[];
  background?: string;
}) {
  if (photos.length === 0) return null;
  // Split into two rows, interleaved so both rows look varied. A single short list fills both.
  const row1 = photos.length > 1 ? photos.filter((_, i) => i % 2 === 0) : photos;
  const row2 = photos.length > 1 ? photos.filter((_, i) => i % 2 !== 0) : photos;

  return (
    <section className="section-padding overflow-hidden" style={{ background }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mb-10">
        <SectionHeader label={head.label} title={head.title} description={head.description} />
      </div>

      <div className="space-y-4">
        <MarqueeRow photos={row1} fade={background} speed={55} />
        <MarqueeRow photos={row2} fade={background} reverse speed={65} />
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeReverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        /* Pause on hover */
        .marquee-row:hover > div[style] {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
