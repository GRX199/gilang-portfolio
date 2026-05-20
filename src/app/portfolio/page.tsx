import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { Projects } from "@/components/projects";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Daftar project pilihan dan studi kasus.",
};

export default async function PortfolioPage() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Portfolio"
          title="Selected Projects"
          description="Kumpulan project pilihan dengan status, tahun, gambar, tag teknologi, dan link yang relevan."
        />
        <Projects projects={content.projects} />
      </main>
      <Footer siteConfig={content.siteConfig} />
    </>
  );
}
