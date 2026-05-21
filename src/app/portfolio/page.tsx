import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { Projects } from "@/components/projects";
import { getSiteContent } from "@/lib/content";
import { getGitHubProjects } from "@/lib/github-projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "GitHub repositories and project work.",
};

export default async function PortfolioPage() {
  const content = await getSiteContent();
  const { projects, source } = await getGitHubProjects(content.siteConfig, content.projects);

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Projects"
          title="GitHub Projects"
          description="Public repositories from my GitHub profile, sorted by latest update."
        />
        <Projects projects={projects} source={source} />
      </main>
      <Footer projectCount={projects.length} />
    </>
  );
}
