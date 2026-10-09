// Shared, client-safe types for everything the admin panel can edit.

export type LinkItem = { label: string; href: string };
export type Seo = { title: string; description: string };
export type SectionHead = { label: string; title: string; description: string };
export type IconItem = { icon: string; title: string; desc: string };
export type PageHero = { image: string; eyebrow: string; title: string; subtitle: string };
export type Stat = { value: number; suffix: string; label: string };
export type Testimonial = { name: string; trip: string; stars: number; text: string };
export type Faq = { q: string; a: string };

export type SiteSettings = {
  brandName: string;
  logoText: string;
  logoSubtext: string;
  logoImage: string;
  siteUrl: string;
  whatsappNumber: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  location: string;
  socials: { facebook: string; instagram: string; youtube: string; tiktok: string };
  whatsappButton: { visible: boolean; label: string; message: string };
  navCtaLabel: string;
  footerAbout: string;
  footerNote: string;
  seo: Seo;
};

export type SiteContent = {
  settings: SiteSettings;
  gallery: { photos: string[] };
  cta: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    text: string;
    primaryLabel: string;
    primaryHref: string;
    whatsappLabel: string;
    whatsappMessage: string;
  };
  home: {
    seo: Seo;
    hero: {
      eyebrow: string;
      title: string;
      titleAccent: string;
      subtitle: string;
      videoUrl: string;
      posterImage: string;
      primaryCta: LinkItem;
      secondaryCta: LinkItem;
    };
    stats: { visible: boolean; items: Stat[] };
    about: {
      visible: boolean;
      image: string;
      eyebrow: string;
      title: string;
      paragraphs: string[];
      features: string[];
      buttonLabel: string;
      buttonHref: string;
    };
    destinations: SectionHead & { visible: boolean };
    gallery: SectionHead & { visible: boolean };
    why: SectionHead & { visible: boolean; items: IconItem[] };
    testimonials: SectionHead & { visible: boolean; items: Testimonial[] };
    ctaVisible: boolean;
  };
  about: {
    seo: Seo;
    hero: PageHero;
    mission: {
      image: string;
      eyebrow: string;
      title: string;
      titleAccent: string;
      paragraphs: string[];
      features: string[];
    };
    values: SectionHead & { visible: boolean; items: IconItem[] };
    gallery: SectionHead & { visible: boolean };
    ctaVisible: boolean;
  };
  contact: {
    seo: Seo;
    hero: PageHero;
    info: { title: string; text: string };
    form: {
      title: string;
      text: string;
      buttonLabel: string;
      successTitle: string;
      successText: string;
    };
    faq: SectionHead & { visible: boolean; items: Faq[] };
  };
  packagesPage: {
    seo: Seo;
    hero: PageHero;
    intro: SectionHead;
    cardNote: string;
    enquireLabel: string;
    emptyText: string;
    ctaVisible: boolean;
  };
};

export type Package = {
  id: string;
  name: string;
  duration: string;
  image: string;
  highlights: string[];
  inclusions: string[];
  description: string;
  published: boolean;
};

export type Country = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  shortDescription: string;
  heroImage: string;
  cardImage: string;
  visible: boolean;
  packages: Package[];
};

export type PackagesData = Record<string, Country>;
