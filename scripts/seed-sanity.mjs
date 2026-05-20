import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-20";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. Check .env.local.",
  );
  process.exit(1);
}

const contentPath = path.join(process.cwd(), "src", "content", "site-content.json");
const rawContent = await readFile(contentPath, "utf8");
const content = JSON.parse(rawContent);

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  token,
  useCdn: false,
});

await client.createOrReplace({
  _id: "siteContent",
  _type: "siteContent",
  ...content,
});

console.log("Seeded Sanity document: siteContent");
