import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProjectDetailActions } from "@/components/project-detail-actions";
import { ProjectScreenshotGallery } from "@/components/project-screenshot-gallery";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";
import {
  getProjectById,
  getProjectCaseStudy,
  getProjectScreenshots,
  getSourceLabel,
  toAbsoluteUrl,
} from "@/lib/project-presenter";

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
  const shareImage = `${projectUrl}/opengraph-image`;

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
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${project.title} project share preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Project`,
      description: project.description,
      images: [shareImage],
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
  const screenshots = getProjectScreenshots(project);
  const lastUpdatedLabel = project.lastUpdated ? formatProjectPanelDate(project.lastUpdated) : "";
  const projectUrl = `${content.siteConfig.siteUrl}/portfolio/${project.id}`;
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: `${project.title} case study`,
    description: project.description,
    url: projectUrl,
    image: toAbsoluteUrl(content.siteConfig.siteUrl, project.image),
    datePublished: `${project.year}-01-01`,
    creator: {
      "@type": "Person",
      name: content.siteConfig.name,
      url: content.siteConfig.siteUrl,
    },
    keywords: project.tags,
    about: caseStudy.sections.map((section) => section.title),
  };

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(projectJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <section className="project-detail-hero" aria-labelledby="project-title">
          <div className="container project-detail-grid">
            <div className="project-detail-copy">
              <p className="eyebrow">Case Study / {sourceLabel}</p>
              <h1 id="project-title">{project.title}</h1>
              <p className="lead">{project.description}</p>
              <ProjectDetailActions
                href={project.href}
                isExternalLink={isExternalLink}
                liveUrl={project.liveUrl}
                repositoryUrl={project.repositoryUrl}
                source={sourceLabel}
                title={project.title}
              />
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
                {project.liveUrl ? (
                  <div>
                    <dt>Live</dt>
                    <dd>Available</dd>
                  </div>
                ) : null}
                {lastUpdatedLabel ? (
                  <div>
                    <dt>Updated</dt>
                    <dd>{lastUpdatedLabel}</dd>
                  </div>
                ) : null}
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

              <div className="project-screenshot-gallery" aria-label="Project screenshots">
                <div className="project-screenshot-heading">
                  <p className="eyebrow">Screenshots</p>
                  <h2>Visual checkpoints.</h2>
                </div>
                <ProjectScreenshotGallery projectTitle={project.title} screenshots={screenshots} />
              </div>

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

function formatProjectPanelDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
