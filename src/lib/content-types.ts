export type SocialLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  handle: string;
  roles: string;
  location: string;
  email: string;
  siteUrl: string;
  description: string;
  headline: string;
  bio: string;
  focus: string;
  availability: string;
  spotifyUrl: string;
  socials: SocialLink[];
};

export type Project = {
  id: string;
  title: string;
  year: string;
  status: string;
  description: string;
  tags: string[];
  image: string;
  href: string;
  liveUrl?: string;
  repositoryUrl?: string;
  icon: string;
  featured: boolean;
  useAutoScreenshot?: boolean;
  source?: "cms" | "github";
  lastUpdated?: string;
  primaryLanguage?: string;
  repositoryTopics?: string[];
  role?: string;
  timeline?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  highlights?: string[];
  metrics?: ProjectMetric[];
  screenshots?: ProjectScreenshot[];
  screenshotPaths?: string[];
};

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectScreenshot = {
  title: string;
  caption: string;
  image: string;
};

export type StackCategory = "core" | "language" | "framework" | "tool";

export type StackItem = {
  id: string;
  name: string;
  category: StackCategory;
  icon: string;
  href?: string;
};

export type QuickLink = {
  label: string;
  href: string;
  icon: string;
};

export type SiteContent = {
  siteConfig: SiteConfig;
  statusMessages: string[];
  quickLinks: QuickLink[];
  projects: Project[];
  stackItems: StackItem[];
  contactIntents: string[];
};
