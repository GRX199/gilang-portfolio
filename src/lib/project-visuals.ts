import screenshotManifest from "@/content/project-screenshot-manifest.json";
import type { Project, ProjectScreenshot } from "@/lib/content-types";

type GeneratedProjectVisual = {
  capturedAt?: string;
  main?: string;
  screenshots?: ProjectScreenshot[];
  sourceUrl?: string;
};

type ScreenshotManifest = {
  projects?: Record<string, GeneratedProjectVisual>;
};

const generatedProjects = (screenshotManifest as ScreenshotManifest).projects || {};

export function applyGeneratedProjectVisuals(projects: Project[]) {
  return projects.map((project) => applyGeneratedProjectVisual(project));
}

export function applyGeneratedProjectVisual(project: Project): Project {
  if (project.useAutoScreenshot === false) return project;

  const generatedVisual = generatedProjects[project.id];
  const generatedImage = generatedVisual?.main || generatedVisual?.screenshots?.[0]?.image;

  if (!generatedImage) return project;

  return {
    ...project,
    image: generatedImage,
    screenshots:
      generatedVisual.screenshots && generatedVisual.screenshots.length > 0
        ? generatedVisual.screenshots
        : project.screenshots,
  };
}

export function getGeneratedProjectVisual(projectId: string) {
  return generatedProjects[projectId];
}
