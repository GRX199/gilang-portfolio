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
  icon: string;
  featured: boolean;
  source?: "cms" | "github";
};

export type StackCategory = "core" | "language" | "framework" | "tool";

export type StackItem = {
  id: string;
  name: string;
  category: StackCategory;
  icon: string;
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
