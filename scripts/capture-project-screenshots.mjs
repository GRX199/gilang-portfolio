import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "..");
const localContentPath = path.join(rootDir, "src", "content", "site-content.json");
const manifestPath = path.join(rootDir, "src", "content", "project-screenshot-manifest.json");
const captureDir = path.join(rootDir, "public", "projects", "captures");
const defaultOptions = {
  height: 960,
  includeGithub: true,
  only: "",
  timeout: 45_000,
  wait: 3_500,
  width: 1440,
};

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

await loadEnvFile(path.join(rootDir, ".env"));
await loadEnvFile(path.join(rootDir, ".env.local"));

const chromePath = options.chromePath || findChromeExecutable();

if (!chromePath) {
  console.error(
    "Chrome or Edge was not found. Install Chrome, or run with --chrome-path \"C:\\\\path\\\\to\\\\chrome.exe\".",
  );
  process.exit(1);
}

await mkdir(captureDir, { recursive: true });

const content = (await loadSanityContent()) || (await loadLocalContent());
const projects = await collectProjects(content, options);
const targets = projects
  .map((project) => createCaptureTarget(project))
  .filter(Boolean);

if (targets.length === 0) {
  console.log("No live project URLs found. Add liveUrl in CMS or use an absolute hosted href.");
  process.exit(0);
}

const manifest = await loadManifest();
const nextProjects = { ...(manifest.projects || {}) };
const failures = [];

for (const target of targets) {
  console.log(`Capturing ${target.title} from ${target.sourceUrl}`);
  const screenshots = [];

  for (const [index, view] of target.views.entries()) {
    const filePath = getCaptureFilePath(target.id, view, index);
    const publicPath = toPublicPath(filePath);

    try {
      await captureUrl(chromePath, view.url, filePath, options);
      screenshots.push({
        title: view.title,
        caption: view.caption,
        image: publicPath,
      });
      console.log(`  saved ${publicPath}`);
    } catch (error) {
      failures.push(`${target.title} (${view.url}): ${error.message}`);
      console.warn(`  failed ${view.url}`);
    }
  }

  if (screenshots.length > 0) {
    nextProjects[target.id] = {
      capturedAt: new Date().toISOString(),
      sourceUrl: target.sourceUrl,
      main: screenshots[0].image,
      screenshots,
    };
  }
}

await writeFile(
  manifestPath,
  `${JSON.stringify({ projects: nextProjects }, null, 2)}\n`,
  "utf8",
);

if (failures.length > 0) {
  console.warn("\nSome screenshots failed:");
  failures.forEach((failure) => console.warn(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("\nProject screenshots captured successfully.");
}

function parseArgs(args) {
  const parsed = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    switch (arg) {
      case "--chrome-path":
        parsed.chromePath = next;
        index += 1;
        break;
      case "--height":
        parsed.height = Number(next) || defaultOptions.height;
        index += 1;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--only":
        parsed.only = next || "";
        index += 1;
        break;
      case "--skip-github":
        parsed.includeGithub = false;
        break;
      case "--timeout":
        parsed.timeout = Number(next) || defaultOptions.timeout;
        index += 1;
        break;
      case "--wait":
        parsed.wait = Number(next) || defaultOptions.wait;
        index += 1;
        break;
      case "--width":
        parsed.width = Number(next) || defaultOptions.width;
        index += 1;
        break;
      default:
        break;
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Capture live project screenshots.

Usage:
  npm run capture:screenshots
  npm run capture:screenshots -- --only coffee-time

Options:
  --only <project-id>       Capture one project only.
  --skip-github            Do not fetch GitHub repositories with homepage URLs.
  --width <number>         Screenshot viewport width. Default: ${defaultOptions.width}
  --height <number>        Screenshot viewport height. Default: ${defaultOptions.height}
  --wait <ms>              Virtual time budget before screenshot. Default: ${defaultOptions.wait}
  --timeout <ms>           Browser process timeout. Default: ${defaultOptions.timeout}
  --chrome-path <path>     Custom Chrome or Edge executable path.
`);
}

async function loadEnvFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmedLine.split("=");
      const value = valueParts.join("=").replace(/^['"]|['"]$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Env files are optional.
  }
}

async function loadLocalContent() {
  const rawContent = await readFile(localContentPath, "utf8");
  return JSON.parse(rawContent);
}

async function loadSanityContent() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-20";

  if (!projectId) return null;

  const query = `*[_type == "siteContent" && _id == "siteContent"][0]{
    siteConfig { handle, socials[] { label, href } },
    projects[] { id, title, href, liveUrl, useAutoScreenshot, screenshotPaths[] }
  }`;
  const url = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);

  try {
    const response = await fetch(url, {
      headers: process.env.SANITY_API_READ_TOKEN
        ? { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
        : undefined,
    });

    if (!response.ok) return null;

    const json = await response.json();
    return json.result || null;
  } catch {
    return null;
  }
}

async function collectProjects(content, currentOptions) {
  const cmsProjects = Array.isArray(content.projects) ? content.projects : [];
  const githubProjects = currentOptions.includeGithub
    ? await loadGithubProjects(content.siteConfig)
    : [];
  const seenIds = new Set();

  return [...cmsProjects, ...githubProjects]
    .map((project) => ({
      ...project,
      id: slugify(project.id || project.title || project.href || "project"),
      title: project.title || project.id || "Project",
    }))
    .filter((project) => {
      if (currentOptions.only && project.id !== currentOptions.only) return false;
      if (seenIds.has(project.id)) return false;
      seenIds.add(project.id);
      return true;
    });
}

async function loadGithubProjects(siteConfig) {
  const username = getGithubUsername(siteConfig);
  if (!username) return [];

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=24`,
      {
        headers: { Accept: "application/vnd.github+json" },
      },
    );

    if (!response.ok) return [];

    const repositories = await response.json();

    return repositories
      .filter((repository) => !repository.private && !repository.fork && repository.homepage)
      .map((repository) => ({
        id: slugify(repository.name),
        title: formatRepositoryName(repository.name),
        href: repository.html_url,
        liveUrl: normalizeUrl(repository.homepage),
        useAutoScreenshot: true,
      }))
      .filter((project) => project.liveUrl);
  } catch {
    return [];
  }
}

function getGithubUsername(siteConfig) {
  const socials = Array.isArray(siteConfig?.socials) ? siteConfig.socials : [];
  const githubSocial = socials.find((social) =>
    String(social.href || "").toLowerCase().includes("github.com"),
  );

  if (githubSocial) {
    try {
      const url = new URL(githubSocial.href);
      const username = url.pathname.split("/").filter(Boolean)[0];
      if (username) return username;
    } catch {
      // Fall through to handle.
    }
  }

  return String(siteConfig?.handle || "").replace(/^@/, "").trim();
}

function createCaptureTarget(project) {
  if (project.useAutoScreenshot === false) return null;

  const sourceUrl = getProjectSourceUrl(project);
  if (!sourceUrl) return null;

  const paths = getScreenshotPaths(project);
  const views = paths.map((viewPath, index) => {
    const pageUrl = resolveViewUrl(sourceUrl, viewPath);
    const title = index === 0 ? "Live homepage" : formatPathTitle(viewPath);

    return {
      caption:
        index === 0
          ? "Captured from the deployed project homepage."
          : `Captured from ${viewPath}.`,
      path: viewPath,
      title,
      url: pageUrl,
    };
  });

  return {
    id: project.id,
    sourceUrl,
    title: project.title,
    views,
  };
}

function getProjectSourceUrl(project) {
  const liveUrl = normalizeUrl(project.liveUrl);
  if (liveUrl) return liveUrl;

  const href = normalizeUrl(project.href);
  if (!href) return null;

  try {
    const url = new URL(href);
    if (url.hostname === "github.com" || url.hostname.endsWith(".github.com")) {
      return null;
    }
  } catch {
    return null;
  }

  return href;
}

function normalizeUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function getScreenshotPaths(project) {
  const paths = Array.isArray(project.screenshotPaths)
    ? project.screenshotPaths.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const uniquePaths = Array.from(new Set(paths.length > 0 ? paths : ["."]));

  return uniquePaths.slice(0, 6);
}

function resolveViewUrl(sourceUrl, viewPath) {
  if (normalizeUrl(viewPath)) return normalizeUrl(viewPath);
  if (viewPath === "." || viewPath === "") return sourceUrl;
  if (viewPath.startsWith("/")) {
    const source = new URL(sourceUrl);
    return new URL(viewPath, `${source.origin}/`).toString();
  }

  return new URL(viewPath, ensureTrailingSlash(sourceUrl)).toString();
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function getCaptureFilePath(projectId, view, index) {
  if (index === 0) {
    return path.join(captureDir, `${projectId}.png`);
  }

  return path.join(captureDir, `${projectId}-${slugify(view.path || view.title)}.png`);
}

function toPublicPath(filePath) {
  return `/${path.relative(path.join(rootDir, "public"), filePath).replace(/\\/g, "/")}`;
}

async function captureUrl(chromePath, url, outputPath, currentOptions) {
  const userDataDir = path.join(os.tmpdir(), `gilang-capture-${Date.now()}-${Math.random()}`);

  await mkdir(path.dirname(outputPath), { recursive: true });

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${currentOptions.width},${currentOptions.height}`,
    `--virtual-time-budget=${currentOptions.wait}`,
    `--screenshot=${outputPath}`,
    url,
  ];

  try {
    await runProcess(chromePath, args, currentOptions.timeout);
  } finally {
    await rm(userDataDir, { force: true, recursive: true });
  }
}

function runProcess(command, args, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Timed out after ${timeout}ms`));
    }, timeout);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Chrome exited with code ${code}`));
    });
  });
}

async function loadManifest() {
  try {
    const rawManifest = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(rawManifest);
    return manifest && typeof manifest === "object" ? manifest : { projects: {} };
  } catch {
    return { projects: {} };
  }
}

function findChromeExecutable() {
  const candidates =
    process.platform === "win32"
      ? [
          process.env.CHROME_PATH,
          path.join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(
            process.env["PROGRAMFILES(X86)"] || "",
            "Google",
            "Chrome",
            "Application",
            "chrome.exe",
          ),
          path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(
            process.env.PROGRAMFILES || "",
            "Microsoft",
            "Edge",
            "Application",
            "msedge.exe",
          ),
          path.join(
            process.env["PROGRAMFILES(X86)"] || "",
            "Microsoft",
            "Edge",
            "Application",
            "msedge.exe",
          ),
        ]
      : process.platform === "darwin"
        ? [
            process.env.CHROME_PATH,
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          ]
        : [
            process.env.CHROME_PATH,
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/usr/bin/microsoft-edge",
          ];

  return candidates.find((candidate) => candidate && existsSync(candidate));
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "project"
  );
}

function formatRepositoryName(name) {
  return String(name)
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPathTitle(value) {
  const source = value === "." ? "home" : value;
  const title = source
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[/?#]+/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return title ? title.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Live view";
}
