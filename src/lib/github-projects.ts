import type { Project, SiteConfig } from "@/lib/content-types";
import { applyGeneratedProjectVisuals } from "@/lib/project-visuals";

type GitHubRepository = {
  archived: boolean;
  created_at: string;
  description: string | null;
  fork: boolean;
  homepage: string | null;
  html_url: string;
  language: string | null;
  name: string;
  private: boolean;
  pushed_at: string | null;
  topics?: string[];
  updated_at: string;
};

export type ProjectSource = {
  href: string;
  label: string;
  username: string;
};

export async function getPortfolioProjects(
  siteConfig: SiteConfig,
  cmsProjects: Project[],
): Promise<{ projects: Project[]; source: ProjectSource }> {
  const normalizedCmsProjects = cmsProjects.map((project) => ({
    ...project,
    source: project.source || ("cms" as const),
  }));
  const username = getGitHubUsername(siteConfig);
  const source = {
    href: `https://github.com/${username}?tab=repositories`,
    label: `Portfolio + GitHub / ${username}`,
    username,
  };

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username,
      )}/repos?sort=updated&per_page=24`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub responded with ${response.status}`);
    }

    const repositories = (await response.json()) as GitHubRepository[];
    const githubProjects = repositories
      .filter((repository) => !repository.private && !repository.fork)
      .sort((left, right) => getRepoTime(right) - getRepoTime(left))
      .slice(0, 10)
      .map((repository, index) => toProject(repository, index));

    return {
      projects: applyGeneratedProjectVisuals(mergeProjects(normalizedCmsProjects, githubProjects)),
      source,
    };
  } catch {
    return {
      projects: applyGeneratedProjectVisuals(normalizedCmsProjects),
      source,
    };
  }
}

function mergeProjects(cmsProjects: Project[], githubProjects: Project[]) {
  const seenKeys = new Set<string>();
  const mergedProjects: Project[] = [];

  for (const project of [...cmsProjects, ...githubProjects]) {
    const keys = getProjectKeys(project);

    if (keys.some((key) => seenKeys.has(key))) {
      continue;
    }

    mergedProjects.push(project);
    keys.forEach((key) => seenKeys.add(key));
  }

  return mergedProjects;
}

function getProjectKeys(project: Project) {
  const keys = [`id:${project.id.toLowerCase()}`];
  const href = project.href.trim().toLowerCase().replace(/\/$/, "");

  if (href.includes("github.com/")) {
    keys.push(`href:${href}`);
  }

  return keys;
}

function getGitHubUsername(siteConfig: SiteConfig) {
  const githubSocial = siteConfig.socials.find((social) =>
    social.href.toLowerCase().includes("github.com"),
  );

  if (githubSocial) {
    try {
      const url = new URL(githubSocial.href);
      const username = url.pathname.split("/").filter(Boolean)[0];

      if (username) return username;
    } catch {
      // Fall back to the handle below.
    }
  }

  return siteConfig.handle.replace(/^@/, "").trim() || "GRX199";
}

function toProject(repository: GitHubRepository, index: number): Project {
  const readableName = formatRepositoryName(repository.name);
  const tags = getRepositoryTags(repository);
  const lastUpdated = repository.pushed_at || repository.updated_at;
  const year = String(new Date(lastUpdated).getFullYear());
  const liveUrl = getRepositoryHomepage(repository.homepage);

  return {
    id: repository.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: readableName,
    year,
    status: getRepositoryStatus(repository),
    description: repository.description?.trim() || `Source code for ${readableName}.`,
    tags,
    image: "/projects/github.svg",
    href: repository.html_url,
    liveUrl,
    repositoryUrl: repository.html_url,
    icon: getRepositoryIcon(repository.language),
    featured: index < 3,
    useAutoScreenshot: Boolean(liveUrl),
    source: "github",
    lastUpdated,
    primaryLanguage: repository.language || undefined,
    repositoryTopics: repository.topics || [],
    role: "Repository owner",
    timeline: `${year} - current`,
    highlights: [
      `Public repository maintained on GitHub.`,
      `Primary stack: ${tags.slice(0, 2).join(", ")}.`,
      liveUrl
        ? `Live deployment connected from the repository homepage.`
        : `Visible source code and commit history.`,
    ],
    screenshots: [
      {
        title: "Repository preview",
        caption: `${readableName} source overview and public project notes.`,
        image: "/projects/github.svg",
      },
    ],
    metrics: [
      { label: "Source", value: "GitHub" },
      { label: "Stack", value: tags[0] || "Code" },
      { label: "Updated", value: formatRepositoryDate(lastUpdated) },
    ],
  };
}

function getRepositoryHomepage(homepage: string | null) {
  if (!homepage?.trim()) return undefined;

  try {
    const url = new URL(homepage.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function getRepositoryStatus(repository: GitHubRepository) {
  if (repository.archived) return "Archived";
  if (repository.homepage?.trim()) return "Live";
  return "Public repo";
}

function getRepositoryTags(repository: GitHubRepository) {
  const tags = [repository.language, ...(repository.topics || [])]
    .filter((tag): tag is string => Boolean(tag?.trim()))
    .slice(0, 4);

  return tags.length > 0 ? tags : ["GitHub"];
}

function getRepositoryIcon(language: string | null) {
  switch (language?.toLowerCase()) {
    case "css":
      return "Palette";
    case "html":
      return "Globe2";
    case "php":
      return "Server";
    case "typescript":
      return "Braces";
    default:
      return "GitBranch";
  }
}

function getRepoTime(repository: GitHubRepository) {
  return new Date(repository.pushed_at || repository.updated_at || repository.created_at).getTime();
}

function formatRepositoryName(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRepositoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}
