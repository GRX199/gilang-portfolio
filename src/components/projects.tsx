"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/lib/content-types";
import { getIcon } from "@/lib/icon-map";

type ProjectsProps = {
  projects: Project[];
  compact?: boolean;
};

export function Projects({ projects, compact = false }: ProjectsProps) {
  const visibleProjects = compact ? projects.filter((project) => project.featured) : projects;

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Selected Work</p>
          <h2 id="work-title">Gilang&apos;s selected projects.</h2>
          <p>
            A focused set of web projects with status, technology, and a short
            overview of what each project is built to do.
          </p>
        </div>

        <div className="project-grid">
          {visibleProjects.map((project, index) => {
            const Icon = getIcon(project.icon);
            return (
              <motion.article
                className="project-card"
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <a href={project.href || "#contact"} aria-label={`Open ${project.title}`}>
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
                  </div>
                  <div className="project-body">
                    <div className="project-meta">
                      <span>{project.year}</span>
                      <span>{project.status}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <ul className="tag-list" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
