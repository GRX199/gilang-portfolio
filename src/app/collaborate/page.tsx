import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collaborate",
  description: "Contact form for starting a project conversation.",
};

export default async function CollaboratePage() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Collaborate"
          title="Ready to build something?"
          description="A short and direct contact form for project ideas, collaborations, or quick introductions."
        />
        <ContactForm contactIntents={content.contactIntents} siteConfig={content.siteConfig} />
      </main>
      <Footer projectCount={content.projects.length} />
    </>
  );
}
