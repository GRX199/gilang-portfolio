import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const { siteConfig } = content;
  const { projects } = await getPortfolioProjects(siteConfig, content.projects);
  const now = new Date();
  const routes = ["", "/portfolio", "/stack", "/collaborate"];

  const routeEntries = routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const projectEntries = projects.map((project) => ({
    url: `${siteConfig.siteUrl}/portfolio/${project.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  })) satisfies MetadataRoute.Sitemap;

  return [...routeEntries, ...projectEntries];
}
