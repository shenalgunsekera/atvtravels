import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tour Packages from Sri Lanka",
  description:
    "Explore ATV Travels packages from Sri Lanka to Thailand, Malaysia, Maldives, and Bali with curated stays and experiences.",
  alternates: {
    canonical: "/packages",
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
