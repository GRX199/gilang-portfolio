"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { trackPortfolioEvent } from "@/lib/analytics";

type ProjectDetailActionsProps = {
  href: string;
  isExternalLink: boolean;
  liveUrl?: string;
  repositoryUrl?: string;
  source: string;
  title: string;
};

export function ProjectDetailActions({
  href,
  isExternalLink,
  liveUrl,
  repositoryUrl,
  source,
  title,
}: ProjectDetailActionsProps) {
  const repositoryHref = repositoryUrl || href;
  const shouldShowRepository = Boolean(repositoryHref && repositoryHref !== liveUrl);
  const repositoryIsExternal = Boolean(repositoryHref?.startsWith("http"));
  const secondaryLabel = repositoryUrl
    ? "View repository"
    : isExternalLink
      ? "Open project"
      : "Open page";

  return (
    <div className="project-detail-actions">
      {liveUrl ? (
        <a
          className="send-button"
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            trackPortfolioEvent("Project Live Site Opened", {
              title,
              source,
            })
          }
        >
          <span>Open live site</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      ) : null}
      {shouldShowRepository ? (
        <a
          className={liveUrl ? "send-button ghost" : "send-button"}
          href={repositoryHref}
          target={repositoryIsExternal || isExternalLink ? "_blank" : undefined}
          rel={repositoryIsExternal || isExternalLink ? "noreferrer" : undefined}
          onClick={() =>
            trackPortfolioEvent("Project Link Opened", {
              title,
              source,
              external: repositoryIsExternal || isExternalLink,
            })
          }
        >
          <span>{secondaryLabel}</span>
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
