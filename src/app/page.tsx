import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();

  return (
    <div className="home-page">
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <Hero content={content} />
      </main>
      <Footer projectCount={content.projects.length} />
    </div>
  );
}
