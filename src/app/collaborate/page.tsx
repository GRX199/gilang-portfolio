import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InnerPageHeading } from "@/components/inner-page-heading";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collaborate",
  description: "Form kontak untuk mulai berdiskusi tentang project.",
};

export default async function CollaboratePage() {
  const content = await getSiteContent();

  return (
    <>
      <Header siteConfig={content.siteConfig} />
      <main id="main">
        <InnerPageHeading
          eyebrow="Collaborate"
          title="Ready to build something?"
          description="Halaman ini mengikuti fungsi collaborate di referensi: form singkat, jelas, dan langsung menuju email."
        />
        <ContactForm contactIntents={content.contactIntents} siteConfig={content.siteConfig} />
      </main>
      <Footer siteConfig={content.siteConfig} />
    </>
  );
}
