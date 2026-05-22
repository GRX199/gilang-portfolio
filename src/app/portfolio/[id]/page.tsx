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

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <section className="project-detail-hero" aria-labelledby="project-title">
          <div className="container project-detail-grid">
            <div className="project-detail-copy">
              <p className="eyebrow">Project / {sourceLabel}</p>
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
                  <dt>Source</dt>
                  <dd>{sourceLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section project-detail-section" aria-label="Project details">
          <div className="container project-detail-layout">
            <div className="project-detail-image">
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                width={1200}
                height={750}
                priority
                sizes="(max-width: 920px) 100vw, 68vw"
              />
            </div>

            <aside className="project-detail-sidebar">
              <div>
                <p className="eyebrow">Stack</p>
                <ul className="tag-list" aria-label="Project stack">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="project-detail-note">
                <p>
                  This page is generated from the portfolio content pipeline, combining editable CMS
                  entries and public GitHub repositories.
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
  return project.source === "github" ? "GitHub Repository" : "CMS Project";
}
