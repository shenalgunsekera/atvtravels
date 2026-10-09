import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import AboutPreview from "@/components/home/AboutPreview";
import DestinationsSection from "@/components/home/DestinationsSection";
import PhotoMarquee from "@/components/home/PhotoMarquee";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";
import { getAllCountries, getSite } from "@/lib/packages";

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await getSite();
  return {
    title: home.seo.title,
    description: home.seo.description,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [site, countries] = await Promise.all([getSite(), getAllCountries()]);
  const { settings, home } = site;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.brandName,
    url: settings.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${settings.siteUrl}/packages?country={country}`,
      "query-input": "required name=country",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.brandName,
    url: settings.siteUrl,
    telephone: settings.phonePrimary,
    email: settings.email,
    areaServed: "LK",
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.location.split(",")[0]?.trim() || "Colombo",
      addressCountry: "LK",
    },
    sameAs: [
      `https://wa.me/${settings.whatsappNumber}`,
      ...Object.values(settings.socials).filter(Boolean),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
      />
      <Hero hero={home.hero} />
      {home.stats.visible && <StatsBar stats={home.stats.items} />}
      {home.about.visible && <AboutPreview about={home.about} />}
      {home.destinations.visible && countries.length > 0 && (
        <DestinationsSection head={home.destinations} countries={countries} />
      )}
      {home.gallery.visible && <PhotoMarquee head={home.gallery} photos={site.gallery.photos} />}
      {home.why.visible && <WhyChooseUs head={home.why} items={home.why.items} />}
      {home.testimonials.visible && home.testimonials.items.length > 0 && (
        <Testimonials head={home.testimonials} items={home.testimonials.items} />
      )}
      {home.ctaVisible && <CtaBanner cta={site.cta} whatsappNumber={settings.whatsappNumber} />}
    </>
  );
}
