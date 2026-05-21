import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();
  const { projects } = await getPortfolioProjects(content.siteConfig, content.projects);
  const portfolioContent = {
    ...content,
    projects,
  };

  return (
    <div className="home-page">
      <Header siteConfig={portfolioContent.siteConfig} />
      <main id="main">
        <Hero content={portfolioContent} />
      </main>
      <Footer projectCount={portfolioContent.projects.length} />
    </div>
  );
}
