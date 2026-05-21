import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { StackSection } from "@/components/stack-section";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tech Stack",
  description: "Tools, languages, frameworks, and platforms I use.",
};

export default async function StackPage() {
  const content = await getSiteContent();
  const { projects } = await getPortfolioProjects(content.siteConfig, content.projects);

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Stack"
          title="Tools and workflow"
          description="The tools I use for building, shipping, and maintaining web projects."
        />
        <StackSection stackItems={content.stackItems} />
      </main>
      <Footer projectCount={projects.length} />
    </>
  );
}
