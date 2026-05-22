import type { Project, SiteConfig } from "@/lib/content-types";

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
    label: `CMS + GitHub / ${username}`,
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
      projects: mergeProjects(normalizedCmsProjects, githubProjects),
      source,
    };
  } catch {
    return {
      projects: normalizedCmsProjects,
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

  return {
    id: repository.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: readableName,
    year: String(new Date(repository.pushed_at || repository.updated_at).getFullYear()),
    status: getRepositoryStatus(repository),
    description: repository.description?.trim() || `Source code for ${readableName}.`,
    tags: getRepositoryTags(repository),
    image: "/projects/github.svg",
    href: repository.html_url,
    icon: getRepositoryIcon(repository.language),
    featured: index < 3,
    source: "github",
  };
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
