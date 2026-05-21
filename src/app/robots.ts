import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteConfig } = await getSiteContent();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
