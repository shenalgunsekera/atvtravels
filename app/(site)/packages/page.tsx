import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import PackagesView from "@/components/packages/PackagesView";
import CtaBanner from "@/components/home/CtaBanner";
import { getAllCountries, getSite } from "@/lib/packages";

export async function generateMetadata(): Promise<Metadata> {
  const { packagesPage } = await getSite();
  return {
    title: packagesPage.seo.title,
    description: packagesPage.seo.description,
    alternates: { canonical: "/packages" },
  };
}

export default async function PackagesPage() {
  const [site, countries] = await Promise.all([getSite(), getAllCountries()]);
  const page = site.packagesPage;

  return (
    <>
      <PageHero hero={page.hero} crumb="Tour Packages" />
      <PackagesView countries={countries} page={page} whatsappNumber={site.settings.whatsappNumber} />
      {page.ctaVisible && <CtaBanner cta={site.cta} whatsappNumber={site.settings.whatsappNumber} />}
    </>
  );
}
