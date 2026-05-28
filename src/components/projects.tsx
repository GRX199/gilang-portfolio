"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GitBranch, Layers, Star, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/content-types";
import type { ProjectSource } from "@/lib/github-projects";
import { getIcon } from "@/lib/icon-map";

type ProjectsProps = {
  projects: Project[];
  compact?: boolean;
  source?: ProjectSource;
};

type ProjectFilter = "all" | "featured" | "portfolio" | "github";

export function Projects({ projects, compact = false, source }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");
  const featuredProjects = projects.filter((project) => project.featured);
  const sourceCounts = {
    all: projects.length,
    featured: featuredProjects.length,
    portfolio: projects.filter((project) => project.source !== "github").length,
    github: projects.filter((project) => project.source === "github").length,
  };
  const uniqueStackCount = new Set(projects.flatMap((project) => project.tags)).size;
  const visibleProjects = useMemo(() => {
    const baseProjects = compact ? featuredProjects : projects;

    if (compact) return baseProjects;
    if (activeFilter === "featured") return baseProjects.filter((project) => project.featured);
    if (activeFilter === "portfolio") {
      return baseProjects.filter((project) => project.source !== "github");
    }
    if (activeFilter === "github") return baseProjects.filter((project) => project.source === "github");

    return baseProjects;
  }, [activeFilter, compact, featuredProjects, projects]);
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

  return (
    <section className="section project-section" id="work" aria-label="Projects">
      <div className="container project-showcase">
        <div className="project-showcase-top">
          {source ? (
            <div className="project-source">
              <span>Library</span>
              <a href={source.href} target="_blank" rel="noreferrer">
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
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{filter.label}</span>
                  <small>{filter.count}</small>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="project-grid project-grid-showcase">
          {visibleProjects.map((project, index) => {
            const Icon = getIcon(project.icon);
            const sourceLabel = project.source === "github" ? "GitHub repo" : "Portfolio work";
            const cardHighlights = getCardHighlights(project);

            return (
              <motion.article
                className={
                  !compact && index === 0 ? "project-card featured-project-card" : "project-card"
                }
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Link href={`/portfolio/${project.id}`} aria-label={`View ${project.title}`}>
                  <div className="project-image">
                    <Image
                      src={project.image}
                      alt={`Preview ${project.title}`}
                      width={960}
                      height={600}
                      sizes="(max-width: 768px) 100vw, 50vw"
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
            <p>No projects in this filter yet.</p>
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
