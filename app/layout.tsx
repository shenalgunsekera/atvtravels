import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getSite } from "@/lib/packages";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSite();
  return {
    metadataBase: new URL(settings.siteUrl || "https://atvtravels.lk"),
    title: {
      default: settings.seo.title,
      template: `%s | ${settings.brandName}`,
    },
    description: settings.seo.description,
    keywords: [
      "ATV Travels Sri Lanka",
      "Sri Lanka tour agency",
      "Sri Lanka travel agency",
      "Sri Lanka outbound tours",
      "Thailand tour packages from Sri Lanka",
      "Maldives packages from Sri Lanka",
      "Bali packages from Sri Lanka",
      "Malaysia tour packages from Sri Lanka",
      "honeymoon packages Sri Lanka",
      "travel packages Sri Lanka",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: settings.seo.title,
      description: settings.seo.description,
      type: "website",
      url: settings.siteUrl,
      siteName: settings.brandName,
      locale: "en_LK",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.title,
      description: settings.seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-LK" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-gray-800 antialiased">{children}</body>
    </html>
  );
}
