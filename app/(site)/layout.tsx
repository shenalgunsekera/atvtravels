import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { getAllCountries, getSite } from "@/lib/packages";

// Pages are built from data/*.json, then refreshed from the database at most once a minute.
// Saves in the admin also refresh them immediately (revalidatePath).
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ settings }, countries] = await Promise.all([getSite(), getAllCountries()]);
  return (
    <>
      <Navbar settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} countries={countries.map((c) => ({ id: c.id, name: c.name }))} />
      {settings.whatsappButton.visible && <WhatsAppButton settings={settings} />}
    </>
  );
}
