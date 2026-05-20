import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getSiteContent } from "@/lib/content";
import { iconOptions } from "@/lib/icon-map";
import { isSanityConfigured, studioBasePath } from "@/sanity/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CMS",
  description: "CMS untuk mengelola konten portfolio.",
};

export default async function AdminPage() {
  const content = await getSiteContent();
  const usesProductionCms = process.env.NODE_ENV === "production";

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main" className="admin-page">
        {usesProductionCms ? (
          <CmsDeployHub />
        ) : (
          <AdminDashboard initialContent={content} iconOptions={iconOptions} />
        )}
      </main>
      <Footer siteConfig={content.siteConfig} />
    </>
  );
}

function CmsDeployHub() {
  return (
    <div className="admin-shell">
      <section className="cms-panel deploy-panel">
        <p className="eyebrow">Production CMS</p>
        <h1>Sanity Studio siap untuk deploy.</h1>
        <p>
          Di production, konten disimpan di Sanity supaya perubahan tetap
          tersimpan setelah deploy Vercel. Editor file lokal dimatikan agar
          tidak menulis ke filesystem serverless.
        </p>

        <div className="deploy-actions">
          <a className="send-button" href={studioBasePath}>
            Buka Sanity Studio
          </a>
          <a className="send-button ghost" href="/portfolio">
            Lihat portfolio
          </a>
        </div>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Status Deploy</h2>
        </div>
        <div className="deploy-status-grid">
          <StatusPill label="CMS Hosted" ready={isSanityConfigured} />
          <StatusPill label="Fallback Lokal" ready />
          <StatusPill label="ISR 60s" ready />
        </div>
      </section>
    </div>
  );
}

function StatusPill({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className={ready ? "status-pill ready" : "status-pill"}>
      <span>{label}</span>
      <strong>{ready ? "Ready" : "Butuh env"}</strong>
    </div>
  );
}
