"use client";

import { useEffect, useState } from "react";

type FooterProps = {
  projectCount: number;
};

export function Footer({ projectCount }: FooterProps) {
  const [latency, setLatency] = useState("24ms");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 18) + 14}ms`);
    }, 5_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="site-footer" aria-label="Status portfolio">
      <div className="container footer-shell">
        <div className="footer-grid">
          <FooterIndicator label="Build" value="v1.3-main" tone="red" />
          <FooterIndicator label="Env" value="production" tone="green" />
          <FooterIndicator label="Platform" value="vercel" tone="cyan" />
          <FooterIndicator label="Latency" value={latency} tone="yellow" />
          <FooterIndicator label="Work" value={`${projectCount} projects`} tone="green" />
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
