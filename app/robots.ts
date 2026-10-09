import type { MetadataRoute } from "next";
import { getSite } from "@/lib/packages";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = (await getSite()).settings.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
