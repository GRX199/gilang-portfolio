import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Project } from "@/lib/content-types";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export const revalidate = 60;

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const content = await getSiteContent();
  const { projects } = await getPortfolioProjects(content.siteConfig, content.projects);

  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const { project, siteUrl } = await getProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const projectUrl = `/portfolio/${project.id}`;

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${project.title} | Project`,
      description: project.description,
      url: `${siteUrl}${projectUrl}`,
      type: "article",
      images: [
        {
          url: project.image,
          width: 960,
          height: 600,
          alt: `${project.title} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Project`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const { content, project, projects } = await getProjectById(id);

  if (!content || !project) {
    notFound();
  }

  const sourceLabel = getSourceLabel(project);
  const isExternalLink = project.href.startsWith("http");
  const caseStudy = getProjectCaseStudy(project, sourceLabel);

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <section className="project-detail-hero" aria-labelledby="project-title">
          <div className="container project-detail-grid">
            <div className="project-detail-copy">
              <p className="eyebrow">Case Study / {sourceLabel}</p>
              <h1 id="project-title">{project.title}</h1>
              <p className="lead">{project.description}</p>
              <div className="project-detail-actions">
                {project.href ? (
                  <a
                    className="send-button"
                    href={project.href}
                    target={isExternalLink ? "_blank" : undefined}
                    rel={isExternalLink ? "noreferrer" : undefined}
                  >
                    <span>{isExternalLink ? "Open project" : "Open page"}</span>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                ) : null}
                <Link className="send-button ghost" href="/portfolio">
                  Back to projects
                </Link>
              </div>
            </div>

            <div className="project-detail-panel" aria-label="Project summary">
              <dl>
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{project.status}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{caseStudy.role}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{caseStudy.timeline}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{sourceLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section project-detail-section" aria-label="Project details">
          <div className="container project-case-layout">
            <div className="project-case-main">
              <figure className="project-detail-image project-case-visual">
                <Image
                  src={project.image}
                  alt={`${project.title} preview`}
                  width={1200}
                  height={750}
                  priority
                  sizes="(max-width: 920px) 100vw, 68vw"
                />
                <figcaption>
                  <span>{project.status}</span>
                  <strong>{project.title}</strong>
                </figcaption>
              </figure>

              <div className="case-study-grid" aria-label="Case study sections">
                {caseStudy.sections.map((section) => (
                  <article className="case-study-card" key={section.label}>
                    <p className="eyebrow">{section.label}</p>
                    <h2>{section.title}</h2>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="project-detail-sidebar case-study-sidebar">
              <div>
                <p className="eyebrow">Metrics</p>
                <div className="case-metrics" aria-label="Project metrics">
                  {caseStudy.metrics.map((metric) => (
                    <div key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Stack</p>
                <ul className="tag-list" aria-label="Project stack">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Highlights</p>
                <ul className="case-highlight-list">
                  {caseStudy.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="project-detail-note">
                <p>
                  Project notes are kept concise so visitors can scan the context, build direction,
                  and result without losing the visual flow.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer projectCount={projects.length} />
    </>
  );
}

async function getProjectById(id: string): Promise<{
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

function getSourceLabel(project: Project) {
  return project.source === "github" ? "GitHub Repository" : "Portfolio Project";
}

function getProjectCaseStudy(project: Project, sourceLabel: string) {
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
      : [
          { label: "Role", value: role },
          { label: "Timeline", value: timeline },
          { label: "Source", value: sourceLabel },
        ];

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
        label: "Impact",
        title: "Why it matters",
        body: impact,
      },
    ],
  };
}
