import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { StackSection } from "@/components/stack-section";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tech Stack",
  description: "Tools, bahasa, framework, dan platform yang digunakan.",
};

export default async function StackPage() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Tech Stacks"
          title="Tools yang dipakai untuk build."
          description="Stack disusun per kategori supaya mudah dibaca, mirip pola halaman stack pada website referensi."
        />
        <StackSection stackItems={content.stackItems} />
      </main>
      <Footer
        projectCount={content.projects.length}
        siteConfig={content.siteConfig}
        stackCount={content.stackItems.length}
      />
    </>
  );
}
