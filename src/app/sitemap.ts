import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteConfig } = await getSiteContent();
  const now = new Date();
  const routes = ["", "/portfolio", "/stack", "/collaborate"];

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
