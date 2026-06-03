"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { trackPortfolioEvent } from "@/lib/analytics";

type ProjectDetailActionsProps = {
  href: string;
  isExternalLink: boolean;
  source: string;
  title: string;
};

export function ProjectDetailActions({
  href,
  isExternalLink,
  source,
  title,
}: ProjectDetailActionsProps) {
  return (
    <div className="project-detail-actions">
      {href ? (
        <a
          className="send-button"
          href={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noreferrer" : undefined}
          onClick={() =>
            trackPortfolioEvent("Project Link Opened", {
              title,
              source,
              external: isExternalLink,
            })
          }
        >
          <span>{isExternalLink ? "Open project" : "Open page"}</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      ) : null}
      <Link
        className="send-button ghost"
        href="/portfolio"
        onClick={() => trackPortfolioEvent("Back To Projects", { from: title })}
      >
        Back to projects
      </Link>
    </div>
  );
}
