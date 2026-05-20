"use client";

import { useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/content-types";

type FooterProps = {
  projectCount: number;
  siteConfig: SiteConfig;
  stackCount: number;
};

export function Footer({ projectCount, siteConfig, stackCount }: FooterProps) {
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTimeLabel(
        new Intl.DateTimeFormat("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Makassar",
        })
          .format(new Date())
          .replace(".", ":"),
      );
    };

    updateTime();
    const timer = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="site-footer" aria-label="Status portfolio">
      <div className="container footer-shell">
        <div className="footer-grid">
          <FooterIndicator label="Status" value={siteConfig.availability} tone="green" />
          <FooterIndicator label="Focus" value={siteConfig.focus} tone="red" />
          <FooterIndicator label="Projects" value={`${projectCount} curated`} tone="cyan" />
          <FooterIndicator label="Stack" value={`${stackCount} tools`} tone="yellow" />
          <FooterIndicator label="Local" value={`${timeLabel || "--:--"} WITA`} tone="green" />
        </div>

        <div className="footer-owner">
          <span>Owner</span>
          <strong>{siteConfig.handle}</strong>
        </div>
      </div>
    </footer>
  );
}

function FooterIndicator({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "cyan" | "green" | "red" | "yellow";
  value: string;
}) {
  return (
    <div className={`footer-indicator ${tone}`}>
      <i aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
