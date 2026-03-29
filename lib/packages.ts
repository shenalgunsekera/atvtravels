import packagesData from "@/data/packages.json";

export type Package = {
  id: string;
  name: string;
  duration: string;
  image: string;
  highlights: string[];
  inclusions: string[];
  description: string;
};

export type Country = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  cardImage: string;
  packages: Package[];
};

export type PackagesData = Record<string, Country>;

export function getAllCountries(): Country[] {
  return Object.values(packagesData as PackagesData);
}

export function getCountry(id: string): Country | null {
  return (packagesData as PackagesData)[id] ?? null;
}

export function getAllPackages(): (Package & { country: string })[] {
  return getAllCountries().flatMap((c) =>
    c.packages.map((p) => ({ ...p, country: c.name }))
  );
}
