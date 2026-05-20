import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { StackSection } from "@/components/stack-section";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <Hero content={content} />
        <Projects projects={content.projects} compact />
        <StackSection stackItems={content.stackItems} />
        <ContactForm contactIntents={content.contactIntents} siteConfig={content.siteConfig} />
      </main>
      <Footer siteConfig={content.siteConfig} />
    </>
  );
}
