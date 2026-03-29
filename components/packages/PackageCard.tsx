import Image from "next/image";
import { Clock, MapPin, Check, MessageCircle } from "lucide-react";
import type { Package } from "@/lib/packages";

const WA_NUMBER = "94714179589";

interface Props {
  pkg: Package;
  country: string;
}

export default function PackageCard({ pkg, country }: Props) {
  const waMsg = encodeURIComponent(
    [
      `✈️ *Tour Package Enquiry — ATV Travels*`,
      `─────────────────────────`,
      `📦 *Package:* ${pkg.name}`,
      `🌍 *Destination:* ${country}`,
      `🗓️ *Duration:* ${pkg.duration}`,
      `📍 *Highlights:* ${pkg.highlights.join(", ")}`,
      `─────────────────────────`,
      `Hi! I'm interested in this package. Could you please send me pricing and availability details?`,
    ].join("\n")
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0 group">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-600 group-hover:scale-108"
        />
        <div className="absolute top-3 left-3 bg-gold text-navy text-xs font-bold tracking-wide px-3 py-1.5 rounded-full">
          {country}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Clock size={12} className="text-gold" />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <MapPin size={12} className="text-gold" />
            {pkg.highlights.length} Highlights
          </span>
        </div>

        <h3 className="font-serif text-navy text-lg mb-2 leading-snug">{pkg.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">{pkg.description}</p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pkg.highlights.map((h) => (
            <span
              key={h}
              className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Inclusions */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-xs font-bold tracking-widest uppercase text-navy mb-2.5">Inclusions</p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
            {pkg.inclusions.map((inc) => (
              <div key={inc} className="flex items-center gap-1.5">
                <Check size={11} className="text-teal flex-shrink-0" />
                <span className="text-xs text-gray-500">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 italic">Contact us for pricing</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-navy hover:bg-gold hover:text-navy text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all duration-300"
          >
            <MessageCircle size={13} />
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}
