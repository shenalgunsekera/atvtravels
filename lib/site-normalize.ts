import type { Country, Package, PackagesData, SiteContent } from "./site-types";
import { SITE_DEFAULTS } from "./site-defaults";

type Json = unknown;

function isObject(v: Json): v is Record<string, Json> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Shape `raw` to match `template`: same keys, same primitive types. Arrays of objects are
// normalized item-by-item against the template's first item; unknown keys are dropped.
function conform<T>(template: T, raw: Json): T {
  if (Array.isArray(template)) {
    if (!Array.isArray(raw)) return template;
    const sample = template[0];
    if (sample === undefined) return raw.filter((x) => typeof x === "string") as T;
    if (isObject(sample)) {
      const blank = blankOf(sample);
      return raw.filter(isObject).map((item) => conform(blank, item)) as T;
    }
    return raw.filter((x) => typeof x === typeof sample) as T;
  }
  if (isObject(template)) {
    const src = isObject(raw) ? raw : {};
    const out: Record<string, Json> = {};
    for (const key of Object.keys(template)) {
      out[key] = conform((template as Record<string, Json>)[key], src[key]);
    }
    return out as T;
  }
  if (typeof template === "number") {
    const n = typeof raw === "string" ? Number(raw) : raw;
    return (typeof n === "number" && Number.isFinite(n) ? n : template) as T;
  }
  return (typeof raw === typeof template ? raw : template) as T;
}

// An "empty" item of the same shape, so missing fields in list items become blank rather
// than inheriting text from the first default item.
function blankOf<T>(sample: T): T {
  if (Array.isArray(sample)) return [] as T;
  if (isObject(sample)) {
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(sample)) out[k] = blankOf(v);
    return out as T;
  }
  if (typeof sample === "number") return 0 as T;
  if (typeof sample === "boolean") return true as T;
  return "" as T;
}

export function normalizeSite(raw: Json): SiteContent {
  const site = conform(SITE_DEFAULTS, raw);
  site.settings.whatsappNumber = site.settings.whatsappNumber.replace(/\D/g, "");
  for (const t of site.home.testimonials.items) t.stars = Math.max(1, Math.min(5, Math.round(t.stars || 5)));
  return site;
}

const str = (v: Json) => (typeof v === "string" ? v : "");
const strList = (v: Json) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];

export function normalizePackage(raw: Json): Package {
  const p = isObject(raw) ? raw : {};
  return {
    id: str(p.id),
    name: str(p.name),
    duration: str(p.duration),
    image: str(p.image),
    highlights: strList(p.highlights),
    inclusions: strList(p.inclusions),
    description: str(p.description),
    published: p.published !== false,
  };
}

export function normalizeCountry(raw: Json, key = ""): Country {
  const c = isObject(raw) ? raw : {};
  return {
    id: str(c.id) || key,
    name: str(c.name),
    tagline: str(c.tagline),
    description: str(c.description),
    shortDescription: str(c.shortDescription),
    heroImage: str(c.heroImage),
    cardImage: str(c.cardImage),
    visible: c.visible !== false,
    packages: Array.isArray(c.packages) ? c.packages.map(normalizePackage).filter((p) => p.id) : [],
  };
}

export function normalizePackages(raw: Json): PackagesData {
  const out: PackagesData = {};
  if (!isObject(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const country = normalizeCountry(value, key);
    if (country.id) out[country.id] = country;
  }
  return out;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function whatsappUrl(number: string, message?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
