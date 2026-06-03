import type { SiteContent } from "@/lib/content-types";

export const defaultContent: SiteContent = {
  siteConfig: {
    name: "Gilang",
    handle: "@GRX199",
    roles: "Data Management & Website Developer",
    location: "Indonesia",
    email: "hello@example.com",
    siteUrl: "https://gilang-portfolio-iota.vercel.app",
    description:
      "Gilang's personal portfolio for profile, projects, tech stack, and contact.",
    headline: "Make it simple",
    bio: "I build portfolio sites, dashboards, and small web tools with Next.js.",
    focus: "frontend, data, automation",
    availability: "available for selected work",
    spotifyUrl:
      "https://open.spotify.com/track/5WOSNVChcadlsCRiqXE45K?si=fdeaf2edceb649c1",
    socials: [
      { label: "GitHub", href: "https://github.com/GRX199" },
      { label: "LinkedIn", href: "https://linkedin.com/" },
      { label: "Instagram", href: "https://instagram.com/" },
    ],
  },
  statusMessages: [
    "Based in Indonesia",
    "Building clean interfaces",
    "Open for selected projects",
  ],
  quickLinks: [
    { label: "Selected projects", href: "/portfolio", icon: "Terminal" },
    { label: "Tech stack", href: "/stack", icon: "Code2" },
    { label: "Collaborate", href: "/collaborate", icon: "Send" },
  ],
  projects: [
    {
      id: "insight-dashboard",
      title: "Insight Dashboard",
      year: "2026",
      status: "Live",
      description:
        "A data dashboard for monitoring operational metrics, performance trends, and concise reports.",
      tags: ["Next.js", "Charts", "PostgreSQL"],
      image: "/projects/dashboard.svg",
      href: "/collaborate",
      icon: "LayoutDashboard",
      featured: true,
      role: "Design, frontend, and data flow",
      timeline: "2026 - current",
      problem:
        "Operational teams need a clearer way to read daily performance without opening multiple reports or spreadsheet tabs.",
      solution:
        "A focused dashboard layout with grouped metrics, trend areas, and short summaries that help people understand movement quickly.",
      impact:
        "The interface reduces report friction and gives stakeholders a cleaner view of the numbers that matter most.",
      highlights: [
        "Metric cards designed for fast scanning.",
        "Responsive chart area for desktop and mobile review.",
        "Reusable dashboard sections for future data sources.",
      ],
      metrics: [
        { label: "Focus", value: "Data clarity" },
        { label: "Stack", value: "Next.js" },
        { label: "Status", value: "Live" },
      ],
      screenshots: [
        {
          title: "Dashboard overview",
          caption: "Primary metrics grouped for quick daily scanning.",
          image: "/projects/dashboard.svg",
        },
        {
          title: "Report flow",
          caption: "Automation-ready section for follow-up and scheduled summaries.",
          image: "/projects/automation.svg",
        },
        {
          title: "Responsive frame",
          caption: "Compact preview for reviewing key data on smaller screens.",
          image: "/projects/launch.svg",
        },
      ],
    },
    {
      id: "coffee-time",
      title: "CoffeeTime",
      year: "2026",
      status: "In Progress",
      description:
        "A modern coffee shop landing page with immersive visuals and a responsive layout.",
      tags: ["Next.js", "Tailwind CSS", "Framer Motion"],
      image: "/projects/store.svg",
      href: "/collaborate",
      icon: "Coffee",
      featured: true,
      role: "UI design and frontend build",
      timeline: "2026",
      problem:
        "Small food and beverage brands often need a landing page that feels premium but still loads fast and works well on phones.",
      solution:
        "A responsive landing page structure with strong visual sections, clear menu highlights, and motion that supports the brand mood.",
      impact:
        "The page gives visitors a quick sense of the shop, menu, and direction without feeling heavy or over-designed.",
      highlights: [
        "Mobile-first layout for browsing from social links.",
        "Visual product sections with clear calls to action.",
        "Lightweight motion for a more polished brand feel.",
      ],
      metrics: [
        { label: "Focus", value: "Brand page" },
        { label: "Motion", value: "Framer" },
        { label: "Status", value: "In progress" },
      ],
      screenshots: [
        {
          title: "Storefront hero",
          caption: "Opening section with product-first visual hierarchy.",
          image: "/projects/store.svg",
        },
        {
          title: "Launch section",
          caption: "Editorial content block for promotions and seasonal offers.",
          image: "/projects/launch.svg",
        },
        {
          title: "Mobile preview",
          caption: "Layout direction for visitors arriving from social links.",
          image: "/projects/dashboard.svg",
        },
      ],
    },
    {
      id: "workflow-automation",
      title: "Workflow Automation",
      year: "2025",
      status: "Internal Tool",
      description:
        "An automation system for notifications, data logging, and scheduled reports.",
      tags: ["Node.js", "API", "Sheets"],
      image: "/projects/automation.svg",
      href: "/collaborate",
      icon: "Workflow",
      featured: true,
      role: "Automation flow and backend scripting",
      timeline: "2025",
      problem:
        "Repeated reporting tasks take time when data, reminders, and logs are handled manually across separate tools.",
      solution:
        "A scheduled automation setup that collects inputs, sends notifications, and stores updates in a predictable structure.",
      impact:
        "Manual follow-up is reduced and the workflow becomes easier to monitor because each action leaves a clear record.",
      highlights: [
        "Scheduled jobs for recurring work.",
        "Notification flow connected to status changes.",
        "Simple logging format for review and handoff.",
      ],
      metrics: [
        { label: "Focus", value: "Automation" },
        { label: "Runtime", value: "Node.js" },
        { label: "Output", value: "Reports" },
      ],
      screenshots: [
        {
          title: "Automation map",
          caption: "Workflow overview for jobs, notifications, and data records.",
          image: "/projects/automation.svg",
        },
        {
          title: "Status dashboard",
          caption: "Monitoring surface for recurring tasks and outputs.",
          image: "/projects/dashboard.svg",
        },
        {
          title: "Repository notes",
          caption: "Implementation handoff area for code and setup details.",
          image: "/projects/github.svg",
        },
      ],
    },
    {
      id: "schoolify",
      title: "Schoolify",
      year: "2025",
      status: "Case Study",
      description:
        "A school management platform with calendars, charts, authentication, and a Prisma database.",
      tags: ["Next.js", "Prisma", "PostgreSQL", "Charts"],
      image: "/projects/dashboard.svg",
      href: "/collaborate",
      icon: "GraduationCap",
      featured: false,
      role: "Full-stack interface exploration",
      timeline: "2025",
      problem:
        "School operations need one place to manage schedules, users, and academic information without confusing navigation.",
      solution:
        "A dashboard-oriented school platform concept with calendars, authentication, charts, and database-backed records.",
      impact:
        "The case study explores how school data can be organized into clear workflows for admins, teachers, and students.",
      highlights: [
        "Authentication-ready user flows.",
        "Calendar and chart views for academic planning.",
        "Database structure prepared with Prisma.",
      ],
      metrics: [
        { label: "Focus", value: "School system" },
        { label: "Database", value: "PostgreSQL" },
        { label: "Type", value: "Case study" },
      ],
      screenshots: [
        {
          title: "Admin dashboard",
          caption: "Overview area for school activity, charts, and upcoming events.",
          image: "/projects/dashboard.svg",
        },
        {
          title: "Academic planning",
          caption: "Calendar-ready direction for teachers, students, and admins.",
          image: "/projects/launch.svg",
        },
        {
          title: "Data model",
          caption: "Database-backed structure prepared for role-based workflows.",
          image: "/projects/automation.svg",
        },
      ],
    },
    {
      id: "launch-page",
      title: "Launch Page",
      year: "2024",
      status: "Archived",
      description:
        "A product launch page with editorial visuals and lightweight animation.",
      tags: ["Next.js", "Motion", "SEO"],
      image: "/projects/launch.svg",
      href: "/collaborate",
      icon: "Rocket",
      featured: false,
      role: "Landing page design and build",
      timeline: "2024",
      problem:
        "Early product ideas need a sharp launch page that explains the offer quickly and gives visitors a clear next step.",
      solution:
        "A compact launch page with editorial layout, product messaging, lightweight animation, and share-ready metadata.",
      impact:
        "The page creates a clean first impression and gives the project a usable public surface before the full product exists.",
      highlights: [
        "Concise above-the-fold messaging.",
        "SEO and share preview prepared for launch.",
        "Simple sections that can expand as the product grows.",
      ],
      metrics: [
        { label: "Focus", value: "Launch" },
        { label: "Stack", value: "Next.js" },
        { label: "Status", value: "Archived" },
      ],
      screenshots: [
        {
          title: "Launch hero",
          caption: "Concise first screen for explaining a new product idea.",
          image: "/projects/launch.svg",
        },
        {
          title: "Offer block",
          caption: "Section pattern for value props and quick decisions.",
          image: "/projects/store.svg",
        },
        {
          title: "Share preview",
          caption: "Social-ready direction for early launch distribution.",
          image: "/projects/dashboard.svg",
        },
      ],
    },
  ],
  stackItems: [
    {
      id: "nextjs",
      name: "Next.js",
      category: "core",
      icon: "MonitorSmartphone",
      href: "https://nextjs.org",
    },
    { id: "react", name: "React", category: "core", icon: "Code2", href: "https://react.dev" },
    {
      id: "typescript",
      name: "TypeScript",
      category: "language",
      icon: "Braces",
      href: "https://www.typescriptlang.org",
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      category: "framework",
      icon: "Palette",
      href: "https://tailwindcss.com",
    },
    {
      id: "nodejs",
      name: "Node.js",
      category: "framework",
      icon: "Server",
      href: "https://nodejs.org",
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      category: "tool",
      icon: "Database",
      href: "https://www.postgresql.org",
    },
    {
      id: "rest-api",
      name: "REST API",
      category: "framework",
      icon: "Globe2",
      href: "https://developer.mozilla.org/en-US/docs/Glossary/REST",
    },
    {
      id: "automation",
      name: "Automation",
      category: "core",
      icon: "Workflow",
      href: "https://docs.github.com/en/actions",
    },
    {
      id: "github",
      name: "GitHub",
      category: "tool",
      icon: "GitPullRequest",
      href: "https://github.com",
    },
    { id: "figma", name: "Figma", category: "tool", icon: "PenTool", href: "https://figma.com" },
    { id: "vercel", name: "Vercel", category: "tool", icon: "Gauge", href: "https://vercel.com" },
    {
      id: "email",
      name: "Email",
      category: "tool",
      icon: "Mail",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#email_links",
    },
  ],
  contactIntents: [
    "Portfolio website",
    "Landing page",
    "Dashboard",
    "Automation tool",
  ],
};
