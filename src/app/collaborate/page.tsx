import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { getSiteContent } from "@/lib/content";
import { getGitHubProjects } from "@/lib/github-projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collaborate",
  description: "Contact Gilang for web projects and collaboration.",
};

export default async function CollaboratePage() {
  const content = await getSiteContent();
  const { projects } = await getGitHubProjects(content.siteConfig, content.projects);

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Contact"
          title="Let's talk"
          description="Send a short brief, project idea, or question. I will reply as soon as I can."
        />
        <ContactForm contactIntents={content.contactIntents} siteConfig={content.siteConfig} />
      </main>
      <Footer projectCount={projects.length} />
    </>
  );
}
