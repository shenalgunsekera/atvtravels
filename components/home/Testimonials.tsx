import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya & Rohan M.",
    trip: "Maldives Honeymoon",
    stars: 5,
    text: "ATV Travels made our honeymoon absolutely perfect. The water villa was stunning, everything was arranged seamlessly, and the team was available any time we had a question. Highly recommend!",
    avatar: "PM",
  },
  {
    name: "Sameera K.",
    trip: "Thailand Family Tour",
    stars: 5,
    text: "Travelling with three kids could have been stressful but ATV Travels handled everything! The kids loved the floating markets and Phi Phi Islands. Will definitely book with them again.",
    avatar: "SK",
  },
  {
    name: "Dinesh & Amali P.",
    trip: "Bali Explorer",
    stars: 5,
    text: "The Bali itinerary was perfectly balanced — culture, adventure, and relaxation. Our guide was wonderful and the hotels were excellent. Worth every penny!",
    avatar: "DP",
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-[#F8F6F0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          label="Happy Travellers"
          title="What Our Clients Say"
          description="Real stories from real travellers who trusted ATV Travels with their most precious moments."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 relative">
                <Quote size={36} className="text-gold/20 absolute top-6 left-6" />
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-gold text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.trip}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
