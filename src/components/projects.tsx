"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpRight,
  Camera,
  Clock3,
  GitBranch,
  Globe2,
  Layers,
  Search,
  Star,
  Terminal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackPortfolioEvent } from "@/lib/analytics";
import type { Project } from "@/lib/content-types";
import type { ProjectSource } from "@/lib/github-projects";
import { getIcon } from "@/lib/icon-map";

type ProjectsProps = {
  projects: Project[];
  compact?: boolean;
  source?: ProjectSource;
};

type ProjectFilter = "all" | "featured" | "portfolio" | "github";
type ProjectSort = "featured" | "newest" | "name";

export function Projects({ projects, compact = false, source }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");
  const [activeSort, setActiveSort] = useState<ProjectSort>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const shouldReduceMotion = useReducedMotion() ?? false;
  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured),
    [projects],
  );
  const sourceCounts = useMemo(
    () => ({
      all: projects.length,
      featured: featuredProjects.length,
      portfolio: projects.filter((project) => project.source !== "github").length,
      github: projects.filter((project) => project.source === "github").length,
    }),
    [featuredProjects.length, projects],
  );
  const uniqueStackCount = useMemo(
    () => new Set(projects.flatMap((project) => project.tags)).size,
    [projects],
  );
  const visibleProjects = useMemo(() => {
    const baseProjects = compact ? featuredProjects : projects;
    let nextProjects = baseProjects;
    const query = searchQuery.trim().toLowerCase();

    if (compact) return sortProjects(baseProjects, "featured");
    if (activeFilter === "featured") {
      nextProjects = nextProjects.filter((project) => project.featured);
    }
    if (activeFilter === "portfolio") {
      nextProjects = nextProjects.filter((project) => project.source !== "github");
    }
    if (activeFilter === "github") {
      nextProjects = nextProjects.filter((project) => project.source === "github");
    }

    if (query) {
      nextProjects = nextProjects.filter((project) => projectMatchesQuery(project, query));
    }

    return sortProjects(nextProjects, activeSort);
  }, [activeFilter, activeSort, compact, featuredProjects, projects, searchQuery]);
  const resultLabel = `${visibleProjects.length} of ${projects.length} shown`;
  const filterOptions: {
    id: ProjectFilter;
    label: string;
    count: number;
    icon: typeof Terminal;
  }[] = [
    { id: "all", label: "All", count: sourceCounts.all, icon: Layers },
    { id: "featured", label: "Featured", count: sourceCounts.featured, icon: Star },
    { id: "portfolio", label: "Portfolio", count: sourceCounts.portfolio, icon: Terminal },
    { id: "github", label: "GitHub", count: sourceCounts.github, icon: GitBranch },
  ];

  useEffect(() => {
    if (compact || !searchQuery.trim()) return;

    const searchTimer = window.setTimeout(() => {
      trackPortfolioEvent("Project Search", {
        results: visibleProjects.length,
        sourceCount: projects.length,
      });
    }, 700);

    return () => window.clearTimeout(searchTimer);
  }, [compact, projects.length, searchQuery, visibleProjects.length]);

  return (
    <section className="section project-section" id="work" aria-label="Projects">
      <div className="container project-showcase">
        <div className="project-showcase-top">
          {source ? (
            <div className="project-source">
              <span>Library</span>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackPortfolioEvent("Project Source Opened", { label: source.label })}
              >
                {source.label}
              </a>
            </div>
          ) : null}

          <div className="project-showcase-metrics" aria-label="Project overview">
            <div>
              <span>{projects.length}</span>
              <small>Total work</small>
            </div>
            <div>
              <span>{featuredProjects.length}</span>
              <small>Featured</small>
            </div>
            <div>
              <span>{uniqueStackCount}</span>
              <small>Tools used</small>
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="project-filter-bar" aria-label="Filter projects">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <button
                  className={isActive ? "active" : ""}
                  type="button"
                  aria-pressed={isActive}
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    trackPortfolioEvent("Project Filter", {
                      filter: filter.id,
                      count: filter.count,
                    });
                  }}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{filter.label}</span>
                  <small>{filter.count}</small>
                </button>
              );
            })}
          </div>
        ) : null}

        {!compact ? (
          <div className="project-library-controls" aria-label="Project library controls">
            <label className="project-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                value={searchQuery}
                placeholder="Search project, stack, or status"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery ? (
                <button
                  className="project-search-clear"
                  type="button"
                  aria-label="Clear project search"
                  onClick={() => {
                    setSearchQuery("");
                    trackPortfolioEvent("Project Search Cleared", {
                      filter: activeFilter,
                    });
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <label className="project-sort">
              <ArrowDownAZ size={16} aria-hidden="true" />
              <span>Sort</span>
              <select
                value={activeSort}
                aria-label="Sort projects"
                onChange={(event) => {
                  const nextSort = event.target.value as ProjectSort;
                  setActiveSort(nextSort);
                  trackPortfolioEvent("Project Sort", { sort: nextSort });
                }}
              >
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="name">Name A-Z</option>
              </select>
            </label>

            <div className="project-results-count" aria-live="polite">
              {resultLabel}
            </div>
          </div>
        ) : null}

        <div className="project-grid project-grid-showcase">
          {visibleProjects.map((project, index) => {
            const Icon = getIcon(project.icon);
            const sourceLabel = project.source === "github" ? "GitHub repo" : "Portfolio work";
            const cardHighlights = getCardHighlights(project);
            const projectSignals = getProjectSignals(project, sourceLabel);

            return (
              <motion.article
                className={
                  !compact && index === 0 ? "project-card featured-project-card" : "project-card"
                }
                key={project.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.28),
                }}
              >
                <Link
                  href={`/portfolio/${project.id}`}
                  aria-label={`View ${project.title}`}
                  onClick={() =>
                    trackPortfolioEvent("Project Case Study Opened", {
                      title: project.title,
                      source: project.source || "cms",
                      featured: project.featured,
                      status: project.status,
                    })
                  }
                >
                  <div className="project-image">
                    <Image
                      src={project.image}
                      alt={`Preview ${project.title}`}
                      width={960}
                      height={600}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="project-icon" aria-hidden="true">
                      <Icon size={20} />
                    </div>
                    <div className="project-card-overlay">
                      <span>{sourceLabel}</span>
                      <span>{project.status}</span>
                    </div>
                  </div>
                  <div className="project-body">
                    <div className="project-meta">
                      <span>{project.year}</span>
                      <span>{project.role || sourceLabel}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-card-signals" aria-label={`${project.title} signals`}>
                      {projectSignals.map((signal) => {
                        const SignalIcon = signal.icon;

                        return (
                          <span key={signal.label}>
                            <SignalIcon size={12} aria-hidden="true" />
                            {signal.label}
                          </span>
                        );
                      })}
                    </div>
                    <ul className="project-card-highlights" aria-label={`${project.title} highlights`}>
                      {cardHighlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <ul className="tag-list" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <span className="project-card-link">
                      View case study
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {visibleProjects.length === 0 ? (
          <div className="project-empty-state">
            <p>
              {searchQuery.trim()
                ? `No projects found for "${searchQuery.trim()}".`
                : "No projects in this filter yet."}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getCardHighlights(project: Project) {
  if (project.highlights?.length) {
    return project.highlights.slice(0, 2);
  }

  return [
    `${project.tags.slice(0, 2).join(" + ")} focused build.`,
    project.source === "github" ? "Public repository with visible source." : "Editable portfolio case study.",
  ];
}

function projectMatchesQuery(project: Project, query: string) {
  const searchableText = [
    project.title,
    project.description,
    project.status,
    project.year,
    project.role,
    project.source,
    project.liveUrl,
    project.repositoryUrl,
    project.lastUpdated,
    project.primaryLanguage,
    ...project.tags,
    ...(project.highlights || []),
    ...(project.repositoryTopics || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

function sortProjects(projects: Project[], sort: ProjectSort) {
  const sortedProjects = [...projects];

  if (sort === "name") {
    return sortedProjects.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sortedProjects.sort((left, right) => {
    if (sort === "featured" && Number(right.featured) !== Number(left.featured)) {
      return Number(right.featured) - Number(left.featured);
    }

    const yearDifference = getProjectYear(right) - getProjectYear(left);
    if (yearDifference !== 0) return yearDifference;

    return left.title.localeCompare(right.title);
  });
}

function getProjectYear(project: Project) {
  const year = Number.parseInt(project.year, 10);
  return Number.isFinite(year) ? year : 0;
}

function getProjectSignals(project: Project, sourceLabel: string) {
  const signals: { label: string; icon: typeof Terminal }[] = [];

  if (project.liveUrl) {
    signals.push({ label: "Live site", icon: Globe2 });
  }

  if (project.image.includes("/projects/captures/")) {
    signals.push({ label: "Auto preview", icon: Camera });
  }

  if (project.lastUpdated) {
    signals.push({ label: `Updated ${formatProjectDate(project.lastUpdated)}`, icon: Clock3 });
  }

  if (signals.length === 0) {
    signals.push({
      label: sourceLabel,
      icon: project.source === "github" ? GitBranch : Terminal,
    });
  }

  return signals.slice(0, 3);
}

function formatProjectDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
