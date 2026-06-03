import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Project,
  ProjectMetric,
  ProjectScreenshot,
  QuickLink,
  SiteConfig,
  SiteContent,
  SocialLink,
  StackCategory,
  StackItem,
} from "@/lib/content-types";
import { defaultContent } from "@/lib/default-content";
import { sanityClient } from "@/sanity/lib/client";
import { siteContentQuery } from "@/sanity/lib/queries";

const contentPath = path.join(process.cwd(), "src", "content", "site-content.json");
const stackCategories = ["core", "language", "framework", "tool"] satisfies StackCategory[];

export async function getSiteContent(): Promise<SiteContent> {
  if (sanityClient) {
    try {
      const sanityContent = await sanityClient.fetch<Partial<SiteContent> | null>(
        siteContentQuery,
      );

      if (sanityContent) {
        return normalizeContent(sanityContent);
      }
    } catch {
      return getLocalSiteContent();
    }
  }

  return getLocalSiteContent();
}

export async function getLocalSiteContent(): Promise<SiteContent> {
  try {
    const rawContent = await readFile(contentPath, "utf8");
    return normalizeContent(JSON.parse(rawContent));
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("File-based CMS is disabled in production. Use Sanity Studio instead.");
  }

  const normalizedContent = normalizeContent(content);
  await writeFile(contentPath, `${JSON.stringify(normalizedContent, null, 2)}\n`, "utf8");
  return normalizedContent;
}

export function normalizeContent(input: Partial<SiteContent>): SiteContent {
  return {
    siteConfig: normalizeSiteConfig(input.siteConfig),
    statusMessages: normalizeStringArray(input.statusMessages, defaultContent.statusMessages),
    quickLinks: normalizeQuickLinks(input.quickLinks),
    projects: normalizeProjects(input.projects),
    stackItems: normalizeStackItems(input.stackItems),
    contactIntents: normalizeStringArray(input.contactIntents, defaultContent.contactIntents),
  };
}

function normalizeSiteConfig(config?: Partial<SiteConfig>): SiteConfig {
  const mergedConfig = {
    ...defaultContent.siteConfig,
    ...config,
  };

  return {
    ...mergedConfig,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || mergedConfig.siteUrl,
    socials: normalizeSocials(config?.socials),
  };
}

function normalizeSocials(socials?: Partial<SocialLink>[]): SocialLink[] {
  if (!Array.isArray(socials) || socials.length === 0) {
    return defaultContent.siteConfig.socials;
  }

  return socials
    .map((social, index) => ({
      label: safeString(social.label, `Link ${index + 1}`),
      href: safeString(social.href, "#"),
    }))
    .filter((social) => social.label && social.href);
}

function normalizeQuickLinks(quickLinks?: Partial<QuickLink>[]): QuickLink[] {
  if (!Array.isArray(quickLinks) || quickLinks.length === 0) {
    return defaultContent.quickLinks;
  }

  return quickLinks.map((link, index) => ({
    label: safeString(link.label, `Link ${index + 1}`),
    href: safeString(link.href, "#"),
    icon: safeString(link.icon, "Terminal"),
  }));
}

function normalizeProjects(projects?: Partial<Project>[]): Project[] {
  if (!Array.isArray(projects) || projects.length === 0) {
    return defaultContent.projects;
  }

  return projects.map((project, index) => {
    const title = safeString(project.title, `Project ${index + 1}`);
    const id = safeSlug(project.id, title);
    const fallbackProject = defaultContent.projects.find((item) => item.id === id);

    return {
      id,
      title,
      year: safeString(project.year, String(new Date().getFullYear())),
      status: safeString(project.status, "Draft"),
      description: safeString(project.description, "Deskripsi project belum diisi."),
      tags: normalizeStringArray(project.tags, ["Next.js"]),
      image: safeString(project.image, "/projects/launch.svg"),
      href: safeString(project.href, "/collaborate"),
      liveUrl: optionalUrl(project.liveUrl) || fallbackProject?.liveUrl,
      repositoryUrl: optionalUrl(project.repositoryUrl) || fallbackProject?.repositoryUrl,
      icon: safeString(project.icon, "Rocket"),
      featured: Boolean(project.featured),
      useAutoScreenshot:
        typeof project.useAutoScreenshot === "boolean"
          ? project.useAutoScreenshot
          : fallbackProject?.useAutoScreenshot,
      source: project.source === "github" ? "github" : "cms",
      lastUpdated: optionalString(project.lastUpdated) || fallbackProject?.lastUpdated,
      primaryLanguage: optionalString(project.primaryLanguage) || fallbackProject?.primaryLanguage,
      repositoryTopics:
        normalizeOptionalStringArray(project.repositoryTopics) || fallbackProject?.repositoryTopics,
      role: optionalString(project.role) || fallbackProject?.role,
      timeline: optionalString(project.timeline) || fallbackProject?.timeline,
      problem: optionalString(project.problem) || fallbackProject?.problem,
      solution: optionalString(project.solution) || fallbackProject?.solution,
      impact: optionalString(project.impact) || fallbackProject?.impact,
      highlights: normalizeOptionalStringArray(project.highlights) || fallbackProject?.highlights,
      metrics: normalizeProjectMetrics(project.metrics) || fallbackProject?.metrics,
      screenshotPaths:
        normalizeOptionalStringArray(project.screenshotPaths) || fallbackProject?.screenshotPaths,
      screenshots:
        normalizeProjectScreenshots(project.screenshots) ||
        fallbackProject?.screenshots ||
        createDefaultScreenshots(safeString(project.image, "/projects/launch.svg"), title),
    };
  });
}

function normalizeProjectMetrics(metrics?: Partial<ProjectMetric>[]) {
  if (!Array.isArray(metrics)) return undefined;

  const normalized = metrics
    .map((metric) => ({
      label: safeString(metric.label, ""),
      value: safeString(metric.value, ""),
    }))
    .filter((metric) => metric.label && metric.value);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeProjectScreenshots(screenshots?: Partial<ProjectScreenshot>[]) {
  if (!Array.isArray(screenshots)) return undefined;

  const normalized = screenshots
    .map((screenshot, index) => ({
      title: safeString(screenshot.title, `View ${index + 1}`),
      caption: safeString(screenshot.caption, "Project interface preview."),
      image: safeString(screenshot.image, "/projects/launch.svg"),
    }))
    .filter((screenshot) => screenshot.title && screenshot.caption && screenshot.image);

  return normalized.length > 0 ? normalized : undefined;
}

function createDefaultScreenshots(image: string, title: string) {
  return [
    {
      title: "Main view",
      caption: `${title} primary interface preview.`,
      image,
    },
  ];
}

function normalizeStackItems(stackItems?: Partial<StackItem>[]): StackItem[] {
  if (!Array.isArray(stackItems) || stackItems.length === 0) {
    return defaultContent.stackItems;
  }

  return stackItems.map((item, index) => {
    const name = safeString(item.name, `Stack ${index + 1}`);
    const id = safeSlug(item.id, name);
    const fallbackStackItem = defaultContent.stackItems.find((stackItem) => stackItem.id === id);

    return {
      id,
      name,
      category: stackCategories.includes(item.category as StackCategory)
        ? (item.category as StackCategory)
        : "tool",
      icon: safeString(item.icon, "Code2"),
      href: optionalUrl(item.href) || fallbackStackItem?.href,
    };
  });
}

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const normalized = value.map((item) => String(item).trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeOptionalStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const normalized = value.map((item) => String(item).trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
}

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function optionalUrl(value: unknown) {
  const url = optionalString(value);
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function safeString(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function safeSlug(value: unknown, fallback: string) {
  const source = safeString(value, fallback);
  return (
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}
