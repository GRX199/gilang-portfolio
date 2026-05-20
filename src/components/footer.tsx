import type { SiteConfig } from "@/lib/content-types";

export function Footer({ siteConfig }: { siteConfig: SiteConfig }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <FooterMetric label="Location" value={siteConfig.location} />
        <FooterMetric label="Focus" value={siteConfig.focus} />
        <FooterMetric label="Status" value={siteConfig.availability} />
        <FooterMetric label="Owner" value={siteConfig.handle} />
      </div>
    </footer>
  );
}

function FooterMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
