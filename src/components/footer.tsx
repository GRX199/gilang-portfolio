"use client";

import { useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/content-types";

export function Footer({ siteConfig }: { siteConfig: SiteConfig }) {
  const [latency, setLatency] = useState("18ms");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 18) + 14}ms`);
    }, 5_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <FooterMetric label="Build" value="v1.1-cms" />
        <FooterMetric label="Env" value="production" />
        <FooterMetric label="Platform" value="vercel ready" />
        <FooterMetric label="Latency" value={latency} />
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
