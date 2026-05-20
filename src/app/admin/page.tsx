import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getSiteContent } from "@/lib/content";
import { iconOptions } from "@/lib/icon-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CMS",
  description: "CMS untuk mengelola konten portfolio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main" className="admin-page">
        <AdminDashboard initialContent={content} iconOptions={iconOptions} />
      </main>
      <Footer projectCount={content.projects.length} />
    </>
  );
}
