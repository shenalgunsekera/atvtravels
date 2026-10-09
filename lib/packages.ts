// Server-side content getters for the public site. Data is read from data/*.json at render
// time; admin saves call revalidatePath so pages pick up changes immediately.
import { cache } from "react";
import { readDoc } from "./store";
import type { Country } from "./site-types";

export type { Package, Country, PackagesData, SiteContent } from "./site-types";

export const getSite = cache(async () => (await readDoc("site")).data);

// Visible destinations with only their published packages.
export const getAllCountries = cache(async (): Promise<Country[]> => {
  const { data } = await readDoc("packages");
  return Object.values(data)
    .filter((c) => c.visible)
    .map((c) => ({ ...c, packages: c.packages.filter((p) => p.published) }));
});

export async function getCountry(id: string): Promise<Country | null> {
  return (await getAllCountries()).find((c) => c.id === id) ?? null;
}
