import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ATV Travels",
  description:
    "Contact ATV Travels in Sri Lanka for tour enquiries, WhatsApp booking support, and personalised travel planning.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
