import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { Projects } from "@/components/projects";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected work, case studies, and public GitHub repositories.",
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Projects",
    description: "Selected work, case studies, and public GitHub repositories.",
    url: "/portfolio",
    type: "website",
    images: [
      {
        url: "/portfolio/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Gilang portfolio project preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Selected work, case studies, and public GitHub repositories.",
    images: ["/portfolio/opengraph-image"],
  },
};

export default async function PortfolioPage() {
  const content = await getSiteContent();
  const { projects, source } = await getPortfolioProjects(content.siteConfig, content.projects);
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${content.siteConfig.name} selected work`,
    description: "Selected work, case studies, and public GitHub repositories.",
    url: `${content.siteConfig.siteUrl}/portfolio`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.slice(0, 12).map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: `${content.siteConfig.siteUrl}/portfolio/${project.id}`,
      })),
    },
  };

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(portfolioJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <InnerPageHeading
          eyebrow="Projects"
          title="Selected Work"
          description="A focused collection of portfolio work, public repositories, and concise project case studies."
        />
        <Projects projects={projects} source={source} />
      </main>
      <Footer projectCount={projects.length} />
    </>
  );
}
