import { slugify } from "@/lib/site-normalize";
import type { Package } from "@/lib/site-types";

export function newPackageId(countryId: string, name: string) {
  const slug = slugify(name).slice(0, 32) || "package";
  return `${countryId.slice(0, 3)}-${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

export function blankPackage(id: string): Package {
  return { id, name: "", duration: "", image: "", highlights: [], inclusions: [], description: "", published: true };
}

export const DURATION_PRESETS = [
  "3 Days / 2 Nights",
  "4 Days / 3 Nights",
  "5 Days / 4 Nights",
  "6 Days / 5 Nights",
  "7 Days / 6 Nights",
  "8 Days / 7 Nights",
];

export const INCLUSION_SUGGESTIONS = [
  "Air tickets",
  "Hotel accommodation",
  "3 Star Hotels",
  "4 Star Hotels",
  "Breakfast",
  "Half board",
  "Airport transfers",
  "All Transports",
  "Visa assistance",
  "Travel insurance",
  "English-speaking guide",
  "Entrance tickets",
  "Show Tickets",
  "Free Day For Shopping and/or Leisure",
];
