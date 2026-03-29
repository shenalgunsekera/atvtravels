import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";

// Generate all 138 gallery photo paths
const TOTAL_PHOTOS = 40;
const ALL_PHOTOS = Array.from(
  { length: TOTAL_PHOTOS },
  (_, i) => `/images/gallery/photo-${String(i + 1).padStart(3, "0")}.webp`
);

// Split into two rows, interleaved so both rows look varied
const ROW_1 = ALL_PHOTOS.filter((_, i) => i % 2 === 0);  // even indices
const ROW_2 = ALL_PHOTOS.filter((_, i) => i % 2 !== 0);  // odd indices

function MarqueeRow({
  photos,
  reverse = false,
  speed = 60,
}: {
  photos: string[];
  reverse?: boolean;
  speed?: number;
}) {
  // Duplicate for seamless loop
  const items = [...photos, ...photos];
  const duration = `${(photos.length * speed) / 10}s`;

  return (
    <div className="overflow-hidden relative">
      {/* fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F8F6F0] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F8F6F0] to-transparent z-10 pointer-events-none" />

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
            <Image
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

export default function ExperienceSlider() {
  return (
    <section className="section-padding bg-[#F8F6F0] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mb-10">
        <SectionHeader
          label="Real Travellers, Real Moments"
          title="Happy Clients, Unforgettable Trips"
          description="A glimpse into the journeys we've crafted for our travellers. Their smiles are our greatest reward."
        />
      </div>

      <div className="space-y-4">
        <MarqueeRow photos={ROW_1} speed={55} />
        <MarqueeRow photos={ROW_2} reverse speed={65} />
      </div>

      {/* keyframes injected via style tag */}
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
        .overflow-hidden:hover > div[style] {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
