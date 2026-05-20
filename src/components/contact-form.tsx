"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import type { SiteConfig } from "@/lib/content-types";

export function ContactForm({
  contactIntents,
  siteConfig,
}: {
  contactIntents: string[];
  siteConfig: SiteConfig;
}) {
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const intent = String(form.get("intent") || "");
    const message = String(form.get("message") || "");
    const subject = `${intent || "Project"} from ${name}`;
    const body = [`Name: ${name}`, `Email: ${email}`, `Intent: ${intent}`, "", message].join(
      "\n",
    );

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setNote("Mail app opened. Your message is ready to send.");
  }

  return (
    <section className="section contact-section" id="contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div className="section-heading sticky-copy">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Ready to build something?</h2>
          <p>
            Tell me what you want to build, from landing pages and dashboards
            to personal portfolios. Your message will open in your email app.
          </p>

          <div className="contact-links">
            {siteConfig.socials.map((social) => (
              <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label>
              <span>01 Name</span>
              <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
            </label>
            <label>
              <span>02 Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="email@domain.com"
                required
              />
            </label>
          </div>

          <label>
            <span>03 Need</span>
            <select name="intent" defaultValue={contactIntents[0]} required>
              {contactIntents.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>04 Message</span>
            <textarea
              name="message"
              rows={5}
              placeholder="Tell me what the website should do..."
              required
            />
          </label>

          <button className="send-button" type="submit">
            <span>Send message</span>
            <Send size={17} aria-hidden="true" />
          </button>

          <p className="form-note" role="status">
            {note}
          </p>
        </form>
      </div>
    </section>
  );
}
