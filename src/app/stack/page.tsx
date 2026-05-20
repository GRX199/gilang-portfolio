import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { StackSection } from "@/components/stack-section";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tech Stack",
  description: "Tools, languages, frameworks, and platforms I use.",
};

export default async function StackPage() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Tech Stacks"
          title="Tools I use to build."
          description="A categorized stack overview so the tools are easy to scan and compare."
        />
        <StackSection stackItems={content.stackItems} />
      </main>
      <Footer projectCount={content.projects.length} />
    </>
  );
}
