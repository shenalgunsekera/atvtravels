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
  title: {
    default: "ATV Travels — Your Gateway to the World",
    template: "%s | ATV Travels",
  },
  description:
    "ATV Travels offers premium tour packages to Thailand, Malaysia, Maldives, and Bali. Discover unforgettable experiences crafted with care and delivered with excellence.",
  keywords: [
    "Thailand tour packages",
    "Maldives holiday",
    "Bali tour",
    "Malaysia travel",
    "ATV Travels",
    "Southeast Asia tours",
    "affordable tour packages",
  ],
  openGraph: {
    title: "ATV Travels — Your Gateway to the World",
    description:
      "Premium tour packages to Thailand, Malaysia, Maldives & Bali. Crafted with care, delivered with excellence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-gray-800 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
