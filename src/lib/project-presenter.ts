import type { Project } from "@/lib/content-types";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export type ProjectCaseStudy = ReturnType<typeof getProjectCaseStudy>;

export async function getProjectById(id: string): Promise<{
  content: Awaited<ReturnType<typeof getSiteContent>> | null;
  project: Project | null;
  projects: Project[];
  siteUrl: string;
}> {
  const content = await getSiteContent();
  const { projects } = await getPortfolioProjects(content.siteConfig, content.projects);
  const project = projects.find((item) => item.id === id) || null;

  return {
    content,
    project,
    projects,
    siteUrl: content.siteConfig.siteUrl,
  };
}

export function getSourceLabel(project: Project) {
  return project.source === "github" ? "GitHub Repository" : "Portfolio Project";
}

export function getProjectCaseStudy(project: Project, sourceLabel: string) {
  const primaryStack = project.tags.slice(0, 3).join(", ");
  const role = project.role || (project.source === "github" ? "Repository owner" : "Project owner");
  const timeline = project.timeline || `${project.year} - current`;
  const problem =
    project.problem ||
    `This work started from a need to make ${project.title.toLowerCase()} easier to understand, navigate, and maintain.`;
  const solution =
    project.solution ||
    `The build focuses on a clean structure, readable content, and a stack centered around ${primaryStack || "modern web tools"}.`;
  const impact =
    project.impact ||
    `The result is a clearer project surface that makes the work easier to inspect, share, and continue improving.`;
  const highlights =
    project.highlights && project.highlights.length > 0
      ? project.highlights
      : [
          `Built around ${primaryStack || "a focused web stack"}.`,
          `${sourceLabel} with a direct project link.`,
          `${project.status} status for quick project context.`,
        ];
  const metrics =
    project.metrics && project.metrics.length > 0
      ? project.metrics
      : getFallbackMetrics(project, role, timeline, sourceLabel);

  return {
    role,
    timeline,
    highlights,
    metrics,
    sections: [
      {
        label: "Overview",
        title: "What this project is about",
        body: project.description,
      },
      {
        label: "Problem",
        title: "The gap it solves",
        body: problem,
      },
      {
        label: "Solution",
        title: "How it was shaped",
        body: solution,
      },
      {
        label: "Result",
        title: "What changed",
        body: impact,
      },
    ],
  };
}

export function getProjectScreenshots(project: Project) {
  if (project.screenshots && project.screenshots.length > 0) {
    return project.screenshots;
  }

  return [
    {
      title: "Main view",
      caption: `${project.title} primary interface preview.`,
      image: project.image,
    },
  ];
}

export function toAbsoluteUrl(siteUrl: string, value: string) {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return value;
  }
}

function getFallbackMetrics(project: Project, role: string, timeline: string, sourceLabel: string) {
  const metrics = [
    { label: "Role", value: role },
    { label: "Timeline", value: timeline },
    { label: "Source", value: sourceLabel },
  ];

  if (project.lastUpdated) {
    metrics.push({ label: "Updated", value: formatProjectMetricDate(project.lastUpdated) });
  }

  return metrics.slice(0, 4);
}

function formatProjectMetricDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}
