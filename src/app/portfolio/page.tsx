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
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Gilang portfolio project preview",
      },
    ],
  },
};

export default async function PortfolioPage() {
  const content = await getSiteContent();
  const { projects, source } = await getPortfolioProjects(content.siteConfig, content.projects);

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
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
