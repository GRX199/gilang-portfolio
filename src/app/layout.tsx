import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getSiteContent();

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: `${siteConfig.name} | Personal Website`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    keywords: [
      siteConfig.name,
      "portfolio",
      "website developer",
      "next.js",
      "frontend",
      "indonesia",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${siteConfig.name} | Personal Website`,
      description: siteConfig.description,
      url: siteConfig.siteUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} personal website`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} | Personal Website`,
      description: siteConfig.description,
      images: ["/og-image.svg"],
    },
    icons: {
      icon: "/icon.svg",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
