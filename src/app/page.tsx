import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <Hero content={content} />
      </main>
      <Footer
        projectCount={content.projects.length}
        siteConfig={content.siteConfig}
        stackCount={content.stackItems.length}
      />
    </>
  );
}
