import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ContactView from "@/components/contact/ContactView";
import { getAllCountries, getSite } from "@/lib/packages";

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getSite();
  return {
    title: contact.seo.title,
    description: contact.seo.description,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [site, countries] = await Promise.all([getSite(), getAllCountries()]);
  return (
    <>
      <PageHero hero={site.contact.hero} crumb="Contact" />
      <ContactView contact={site.contact} settings={site.settings} destinations={countries.map((c) => c.name)} />
    </>
  );
}
