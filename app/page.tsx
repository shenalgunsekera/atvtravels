import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import AboutPreview from "@/components/home/AboutPreview";
import DestinationsSection from "@/components/home/DestinationsSection";
import ExperienceSlider from "@/components/home/ExperienceSlider";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Sri Lanka Tour Packages to Thailand, Maldives, Bali and Malaysia",
  description:
    "Book trusted outbound tour packages from Sri Lanka with ATV Travels. Explore Thailand, Maldives, Bali, and Malaysia with complete travel support.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ATV Travels",
    url: "https://atvtravels.lk",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://atvtravels.lk/packages?country={country}",
      "query-input": "required name=country",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "ATV Travels",
    url: "https://atvtravels.lk",
    telephone: "+94 71 417 9589",
    email: "info@atvtravels.com",
    areaServed: "LK",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Colombo",
      addressCountry: "LK",
    },
    sameAs: ["https://wa.me/94714179589"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />
      <StatsBar />
      <AboutPreview />
      <DestinationsSection />
      <ExperienceSlider />
      <WhyChooseUs />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
