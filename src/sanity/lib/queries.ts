import { groq } from "next-sanity";

export const siteContentQuery = groq`*[_type == "siteContent" && _id == "siteContent"][0]{
  siteConfig {
    name,
    handle,
    roles,
    location,
    email,
    siteUrl,
    description,
    headline,
    bio,
    focus,
    availability,
    spotifyUrl,
    socials[] {
      label,
      href
    }
  },
  statusMessages[],
  quickLinks[] {
    label,
    href,
    icon
  },
  projects[] {
    id,
    title,
    year,
    status,
    description,
    tags[],
    "image": coalesce(image, imageAsset.asset->url, "/projects/launch.svg"),
    href,
    liveUrl,
    useAutoScreenshot,
    screenshotPaths[],
    icon,
    featured,
    role,
    timeline,
    problem,
    solution,
    impact,
    highlights[],
    screenshots[] {
      title,
      caption,
      "image": coalesce(image, imageAsset.asset->url, "/projects/launch.svg")
    },
    metrics[] {
      label,
      value
    }
  },
  stackItems[] {
    id,
    name,
    category,
    icon
  },
  contactIntents[]
}`;
