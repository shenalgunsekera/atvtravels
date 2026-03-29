import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://atvtravels.lk"),
  title: {
    default: "ATV Travels | Sri Lanka Tour Agency for Thailand, Maldives, Bali and Malaysia",
    template: "%s | ATV Travels",
  },
  description:
    "ATV Travels is a Sri Lanka travel agency offering tour packages to Thailand, Malaysia, Maldives, and Bali with flights, hotels, and guided support.",
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
    title: "ATV Travels | Sri Lanka Tour Agency",
    description:
      "Tour packages from Sri Lanka to Thailand, Malaysia, Maldives, and Bali. Flights, stays, and support in one place.",
    type: "website",
    url: "https://atvtravels.lk",
    siteName: "ATV Travels",
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATV Travels | Sri Lanka Tour Agency",
    description:
      "Tour packages from Sri Lanka to Thailand, Malaysia, Maldives, and Bali.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-LK" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-gray-800 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
