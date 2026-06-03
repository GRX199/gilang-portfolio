import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import http from "node:http";
import https from "node:https";
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
  allowPartial: false,
  height: 960,
  includeGithub: true,
  missingOnly: false,
  mobileHeight: 844,
  mobileWidth: 390,
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
let targets = projects
  .map((project) => createCaptureTarget(project))
  .filter(Boolean);
const manifest = await loadManifest();
const nextProjects = { ...(manifest.projects || {}) };

if (options.missingOnly) {
  targets = targets.filter((target) => {
    const existingProject = nextProjects[target.id];
    const hasDesktopPreview = Boolean(existingProject?.desktop || existingProject?.main);

    return !(hasDesktopPreview && existingProject?.mobile);
  });
}

if (targets.length === 0) {
  console.log(
    options.missingOnly
      ? "No new live project screenshots to capture."
      : "No live project URLs found. Add liveUrl in CMS or use an absolute hosted href.",
  );
  process.exit(0);
}

const failures = [];

for (const target of targets) {
  console.log(`Capturing ${target.title} from ${target.sourceUrl}`);
  const screenshots = [];
  let desktopPreview = "";
  let mobilePreview = "";

  for (const [index, view] of target.views.entries()) {
    const captureViews = [
      {
        device: "desktop",
        filePath: getCaptureFilePath(target.id, view, index, "desktop"),
        height: options.height,
        width: options.width,
      },
      {
        device: "mobile",
        filePath: getCaptureFilePath(target.id, view, index, "mobile"),
        height: options.mobileHeight,
        width: options.mobileWidth,
      },
    ];

    for (const captureView of captureViews) {
      const publicPath = toPublicPath(captureView.filePath);

      try {
        await captureUrl(chromePath, view.url, captureView.filePath, {
          ...options,
          height: captureView.height,
          width: captureView.width,
        });
        screenshots.push({
          title: getCaptureTitle(view, captureView.device),
          caption: getCaptureCaption(view, captureView.device),
          image: publicPath,
        });

        if (index === 0 && captureView.device === "desktop") {
          desktopPreview = publicPath;
        }
        if (index === 0 && captureView.device === "mobile") {
          mobilePreview = publicPath;
        }

        console.log(`  saved ${publicPath}`);
      } catch (error) {
        failures.push(`${target.title} (${view.url}, ${captureView.device}): ${error.message}`);
        console.warn(`  failed ${view.url} (${captureView.device})`);
      }
    }
  }

  if (screenshots.length > 0) {
    nextProjects[target.id] = {
      capturedAt: new Date().toISOString(),
      sourceUrl: target.sourceUrl,
      main: desktopPreview || screenshots[0].image,
      desktop: desktopPreview || undefined,
      mobile: mobilePreview || undefined,
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
  if (!options.allowPartial) {
    process.exitCode = 1;
  }
} else {
  console.log("\nProject screenshots captured successfully.");
}

function parseArgs(args) {
  const parsed = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    switch (arg) {
      case "--allow-partial":
        parsed.allowPartial = true;
        break;
      case "--chrome-path":
        parsed.chromePath = next;
        index += 1;
        break;
      case "--height":
        parsed.height = Number(next) || defaultOptions.height;
        index += 1;
        break;
      case "--missing-only":
        parsed.missingOnly = true;
        break;
      case "--mobile-height":
        parsed.mobileHeight = Number(next) || defaultOptions.mobileHeight;
        index += 1;
        break;
      case "--mobile-width":
        parsed.mobileWidth = Number(next) || defaultOptions.mobileWidth;
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
  --allow-partial           Keep a successful exit even if a project URL fails.
  --missing-only            Capture only projects missing from the manifest.
  --skip-github            Do not fetch GitHub repositories with homepage URLs.
  --width <number>         Screenshot viewport width. Default: ${defaultOptions.width}
  --height <number>        Screenshot viewport height. Default: ${defaultOptions.height}
  --mobile-width <number>  Mobile screenshot viewport width. Default: ${defaultOptions.mobileWidth}
  --mobile-height <number> Mobile screenshot viewport height. Default: ${defaultOptions.mobileHeight}
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
    const json = await requestJsonWithFallback(url, {
      headers: process.env.SANITY_API_READ_TOKEN
        ? { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
        : undefined,
    });
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
    const repositories = await requestJsonWithFallback(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=24`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        timeout: 45_000,
      },
    );

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
  } catch (error) {
    console.warn(`Could not load GitHub repositories for ${username}: ${error.message}`);
    return [];
  }
}

async function requestJsonWithFallback(url, options = {}) {
  try {
    return await requestJson(url, options);
  } catch (error) {
    if (process.platform !== "win32") {
      throw error;
    }

    return requestJsonViaPowerShell(url, options);
  }
}

function requestJson(url, options = {}) {
  const requestUrl = typeof url === "string" ? new URL(url) : url;
  const transport = requestUrl.protocol === "http:" ? http : https;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      requestUrl,
      {
        headers: {
          "User-Agent": "gilang-portfolio-screenshot-capture",
          ...(options.headers || {}),
        },
      },
      (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          resolve(requestJson(new URL(response.headers.location, requestUrl), options));
          return;
        }

        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Request failed with ${response.statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.setTimeout(options.timeout || 15_000, () => {
      request.destroy(new Error(`Request timed out after ${options.timeout || 15_000}ms`));
    });
    request.on("error", reject);
    request.end();
  });
}

function requestJsonViaPowerShell(url, options = {}) {
  const requestUrl = String(typeof url === "string" ? url : url.toString());
  const headers = {
    "User-Agent": "gilang-portfolio-screenshot-capture",
    ...(options.headers || {}),
  };
  const requestUrlBase64 = Buffer.from(requestUrl, "utf8").toString("base64");
  const headersBase64 = Buffer.from(JSON.stringify(headers), "utf8").toString("base64");
  const timeoutSeconds = Math.max(5, Math.ceil((options.timeout || 15_000) / 1000));
  const script = `
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
$uri = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${requestUrlBase64}'))
$headersJson = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${headersBase64}'))
$headersObject = $headersJson | ConvertFrom-Json
$headers = @{}
$headersObject.PSObject.Properties | ForEach-Object { $headers[$_.Name] = [string]$_.Value }
$response = Invoke-WebRequest -Uri $uri -Headers $headers -UseBasicParsing -TimeoutSec ${timeoutSeconds}
[Console]::Out.Write($response.Content)
`;
  const encodedCommand = Buffer.from(script, "utf16le").toString("base64");

  return new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-EncodedCommand",
        encodedCommand,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`PowerShell request timed out after ${timeoutSeconds}s`));
    }, timeoutSeconds * 1000 + 5_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(stderr.trim() || `PowerShell exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(extractJsonText(stdout)));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function extractJsonText(value) {
  const trimmedValue = value.trim();
  const objectIndex = trimmedValue.indexOf("{");
  const arrayIndex = trimmedValue.indexOf("[");
  const indexes = [objectIndex, arrayIndex].filter((index) => index >= 0);

  if (indexes.length === 0) return trimmedValue;

  return trimmedValue.slice(Math.min(...indexes));
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
    const title = index === 0 ? "homepage" : formatPathTitle(viewPath);

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

function getCaptureFilePath(projectId, view, index, device) {
  const viewSuffix = index === 0 ? "" : `-${slugify(view.path || view.title)}`;
  const deviceSuffix = device === "mobile" ? "-mobile" : "";

  return path.join(captureDir, `${projectId}${viewSuffix}${deviceSuffix}.png`);
}

function getCaptureTitle(view, device) {
  const deviceLabel = device === "mobile" ? "Mobile" : "Desktop";
  return `${deviceLabel} ${view.title}`;
}

function getCaptureCaption(view, device) {
  const deviceLabel = device === "mobile" ? "Mobile viewport." : "Desktop viewport.";
  return `${view.caption} ${deviceLabel}`;
}

function toPublicPath(filePath) {
  return `/${path.relative(path.join(rootDir, "public"), filePath).replace(/\\/g, "/")}`;
}

async function captureUrl(chromePath, url, outputPath, currentOptions) {
  const userDataDir = path.join(os.tmpdir(), `gilang-capture-${Date.now()}-${Math.random()}`);

  await mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await assertChromePageLoads(chromePath, url, userDataDir, currentOptions);

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

    await runProcess(chromePath, args, currentOptions.timeout);
  } finally {
    await rm(userDataDir, { force: true, recursive: true });
  }
}

async function assertChromePageLoads(chromePath, url, userDataDir, currentOptions) {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${currentOptions.width},${currentOptions.height}`,
    `--virtual-time-budget=${Math.min(currentOptions.wait, 5_000)}`,
    "--dump-dom",
    url,
  ];
  const { stderr, stdout } = await runProcessWithOutput(
    chromePath,
    args,
    currentOptions.timeout,
  );
  const output = `${stdout}\n${stderr}`;
  const errorPatterns = [
    /chrome-error:\/\/chromewebdata/i,
    /This site can(?:'|’)t be reached/i,
    /DNS_PROBE_/i,
    /ERR_NAME_NOT_RESOLVED/i,
    /ERR_CONNECTION_/i,
    /ERR_TUNNEL_CONNECTION_FAILED/i,
  ];

  if (errorPatterns.some((pattern) => pattern.test(output))) {
    throw new Error("Chrome loaded an error page instead of the project URL.");
  }
}

function runProcess(command, args, timeout) {
  return runProcessWithOutput(command, args, timeout).then(() => undefined);
}

function runProcessWithOutput(command, args, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Timed out after ${timeout}ms`));
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

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
        resolve({ stderr, stdout });
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
