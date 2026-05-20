"use client";

import { Check, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  Project,
  QuickLink,
  SiteConfig,
  SiteContent,
  SocialLink,
  StackCategory,
  StackItem,
} from "@/lib/content-types";

const stackCategoryOptions = [
  { label: "Core", value: "core" },
  { label: "Language", value: "language" },
  { label: "Framework", value: "framework" },
  { label: "Tool", value: "tool" },
] satisfies { label: string; value: StackCategory }[];

type AdminDashboardProps = {
  iconOptions: string[];
  initialContent: SiteContent;
};

export function AdminDashboard({ iconOptions, initialContent }: AdminDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [secret, setSecret] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem("cms-secret") || "",
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateSiteConfig<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setContent((current) => ({
      ...current,
      siteConfig: {
        ...current.siteConfig,
        [key]: value,
      },
    }));
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    setContent((current) => ({
      ...current,
      siteConfig: {
        ...current.siteConfig,
        socials: current.siteConfig.socials.map((social, socialIndex) =>
          socialIndex === index ? { ...social, ...patch } : social,
        ),
      },
    }));
  }

  function addSocial() {
    setContent((current) => ({
      ...current,
      siteConfig: {
        ...current.siteConfig,
        socials: [...current.siteConfig.socials, { label: "New Link", href: "https://" }],
      },
    }));
  }

  function removeSocial(index: number) {
    setContent((current) => ({
      ...current,
      siteConfig: {
        ...current.siteConfig,
        socials: current.siteConfig.socials.filter((_, socialIndex) => socialIndex !== index),
      },
    }));
  }

  function updateProject(index: number, patch: Partial<Project>) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index ? { ...project, ...patch } : project,
      ),
    }));
  }

  function addProject() {
    setContent((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: `project-${Date.now()}`,
          title: "Project Baru",
          year: String(new Date().getFullYear()),
          status: "Draft",
          description: "Tulis deskripsi singkat project di sini.",
          tags: ["Next.js"],
          image: "/projects/launch.svg",
          href: "/collaborate",
          icon: "Rocket",
          featured: false,
        },
      ],
    }));
  }

  function removeProject(index: number) {
    setContent((current) => ({
      ...current,
      projects: current.projects.filter((_, projectIndex) => projectIndex !== index),
    }));
  }

  function updateStackItem(index: number, patch: Partial<StackItem>) {
    setContent((current) => ({
      ...current,
      stackItems: current.stackItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addStackItem() {
    setContent((current) => ({
      ...current,
      stackItems: [
        ...current.stackItems,
        {
          id: `stack-${Date.now()}`,
          name: "Tool Baru",
          category: "tool",
          icon: "Code2",
        },
      ],
    }));
  }

  function removeStackItem(index: number) {
    setContent((current) => ({
      ...current,
      stackItems: current.stackItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateQuickLink(index: number, patch: Partial<QuickLink>) {
    setContent((current) => ({
      ...current,
      quickLinks: current.quickLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    }));
  }

  function addQuickLink() {
    setContent((current) => ({
      ...current,
      quickLinks: [
        ...current.quickLinks,
        { label: "New Link", href: "/", icon: "Terminal" },
      ],
    }));
  }

  function removeQuickLink(index: number) {
    setContent((current) => ({
      ...current,
      quickLinks: current.quickLinks.filter((_, linkIndex) => linkIndex !== index),
    }));
  }

  function updateStringList(key: "statusMessages" | "contactIntents", value: string) {
    setContent((current) => ({
      ...current,
      [key]: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  }

  async function saveContent() {
    setSaveState("saving");
    setMessage("");
    window.localStorage.setItem("cms-secret", secret);

    const response = await fetch("/api/cms/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-cms-secret": secret,
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      setSaveState("error");
      setMessage(error?.message || "Konten gagal disimpan.");
      return;
    }

    const savedContent = (await response.json()) as SiteContent;
    setContent(savedContent);
    setSaveState("saved");
    setMessage("Konten tersimpan ke src/content/site-content.json.");
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div>
          <p className="eyebrow">Local CMS</p>
          <h1>Content Studio</h1>
        </div>
        <button className="send-button" type="button" onClick={saveContent}>
          <Save size={17} aria-hidden="true" />
          <span>{saveState === "saving" ? "Menyimpan" : "Simpan konten"}</span>
        </button>
      </div>

      <div className="admin-secret">
        <label>
          <span>CMS Secret</span>
          <input
            value={secret}
            onChange={(event) => setSecret(event.currentTarget.value)}
            placeholder="Kosongkan untuk development lokal"
            type="password"
          />
        </label>
        <p className={saveState === "error" ? "form-note error" : "form-note"}>{message}</p>
      </div>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Profile</h2>
        </div>
        <div className="cms-grid two">
          <TextField
            label="Nama"
            value={content.siteConfig.name}
            onChange={(value) => updateSiteConfig("name", value)}
          />
          <TextField
            label="Handle"
            value={content.siteConfig.handle}
            onChange={(value) => updateSiteConfig("handle", value)}
          />
          <TextField
            label="Role"
            value={content.siteConfig.roles}
            onChange={(value) => updateSiteConfig("roles", value)}
          />
          <TextField
            label="Email"
            value={content.siteConfig.email}
            onChange={(value) => updateSiteConfig("email", value)}
          />
          <TextField
            label="Site URL"
            value={content.siteConfig.siteUrl}
            onChange={(value) => updateSiteConfig("siteUrl", value)}
          />
          <TextField
            label="Lokasi"
            value={content.siteConfig.location}
            onChange={(value) => updateSiteConfig("location", value)}
          />
          <TextField
            label="Headline"
            value={content.siteConfig.headline}
            onChange={(value) => updateSiteConfig("headline", value)}
          />
          <TextField
            label="Focus"
            value={content.siteConfig.focus}
            onChange={(value) => updateSiteConfig("focus", value)}
          />
          <TextField
            label="Availability"
            value={content.siteConfig.availability}
            onChange={(value) => updateSiteConfig("availability", value)}
          />
          <TextField
            label="Spotify URL"
            value={content.siteConfig.spotifyUrl}
            onChange={(value) => updateSiteConfig("spotifyUrl", value)}
          />
        </div>
        <TextArea
          label="Bio"
          value={content.siteConfig.bio}
          onChange={(value) => updateSiteConfig("bio", value)}
        />
        <TextArea
          label="Meta Description"
          value={content.siteConfig.description}
          onChange={(value) => updateSiteConfig("description", value)}
        />
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Social Links</h2>
          <IconButton label="Tambah social" onClick={addSocial} />
        </div>
        <div className="cms-list">
          {content.siteConfig.socials.map((social, index) => (
            <div className="cms-row" key={`${social.label}-${index}`}>
              <TextField
                label="Label"
                value={social.label}
                onChange={(value) => updateSocial(index, { label: value })}
              />
              <TextField
                label="URL"
                value={social.href}
                onChange={(value) => updateSocial(index, { href: value })}
              />
              <IconButton label="Hapus social" onClick={() => removeSocial(index)} destructive />
            </div>
          ))}
        </div>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Projects</h2>
          <IconButton label="Tambah project" onClick={addProject} />
        </div>
        <div className="cms-list">
          {content.projects.map((project, index) => (
            <article className="cms-item" key={project.id}>
              <div className="cms-item-heading">
                <h3>{project.title}</h3>
                <label className="cms-check">
                  <input
                    checked={project.featured}
                    onChange={(event) =>
                      updateProject(index, { featured: event.currentTarget.checked })
                    }
                    type="checkbox"
                  />
                  <span>
                    <Check size={15} aria-hidden="true" />
                    Featured
                  </span>
                </label>
                <IconButton label="Hapus project" onClick={() => removeProject(index)} destructive />
              </div>

              <div className="cms-grid three">
                <TextField
                  label="Judul"
                  value={project.title}
                  onChange={(value) => updateProject(index, { title: value })}
                />
                <TextField
                  label="Slug"
                  value={project.id}
                  onChange={(value) => updateProject(index, { id: value })}
                />
                <TextField
                  label="Tahun"
                  value={project.year}
                  onChange={(value) => updateProject(index, { year: value })}
                />
                <TextField
                  label="Status"
                  value={project.status}
                  onChange={(value) => updateProject(index, { status: value })}
                />
                <SelectField
                  label="Icon"
                  options={iconOptions}
                  value={project.icon}
                  onChange={(value) => updateProject(index, { icon: value })}
                />
                <TextField
                  label="Image Path"
                  value={project.image}
                  onChange={(value) => updateProject(index, { image: value })}
                />
              </div>
              <TextArea
                label="Deskripsi"
                value={project.description}
                onChange={(value) => updateProject(index, { description: value })}
              />
              <div className="cms-grid two">
                <TextField
                  label="Tags"
                  value={project.tags.join(", ")}
                  onChange={(value) =>
                    updateProject(index, {
                      tags: value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <TextField
                  label="Link"
                  value={project.href}
                  onChange={(value) => updateProject(index, { href: value })}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Tech Stack</h2>
          <IconButton label="Tambah stack" onClick={addStackItem} />
        </div>
        <div className="cms-list">
          {content.stackItems.map((item, index) => (
            <div className="cms-row stack-row" key={item.id}>
              <TextField
                label="Nama"
                value={item.name}
                onChange={(value) => updateStackItem(index, { name: value })}
              />
              <TextField
                label="Slug"
                value={item.id}
                onChange={(value) => updateStackItem(index, { id: value })}
              />
              <SelectField
                label="Kategori"
                options={stackCategoryOptions.map((category) => category.value)}
                value={item.category}
                onChange={(value) => updateStackItem(index, { category: value as StackCategory })}
              />
              <SelectField
                label="Icon"
                options={iconOptions}
                value={item.icon}
                onChange={(value) => updateStackItem(index, { icon: value })}
              />
              <IconButton label="Hapus stack" onClick={() => removeStackItem(index)} destructive />
            </div>
          ))}
        </div>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Quick Links</h2>
          <IconButton label="Tambah quick link" onClick={addQuickLink} />
        </div>
        <div className="cms-list">
          {content.quickLinks.map((link, index) => (
            <div className="cms-row" key={`${link.href}-${index}`}>
              <TextField
                label="Label"
                value={link.label}
                onChange={(value) => updateQuickLink(index, { label: value })}
              />
              <TextField
                label="URL"
                value={link.href}
                onChange={(value) => updateQuickLink(index, { href: value })}
              />
              <SelectField
                label="Icon"
                options={iconOptions}
                value={link.icon}
                onChange={(value) => updateQuickLink(index, { icon: value })}
              />
              <IconButton label="Hapus quick link" onClick={() => removeQuickLink(index)} destructive />
            </div>
          ))}
        </div>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-heading">
          <h2>Microcopy</h2>
        </div>
        <div className="cms-grid two">
          <TextArea
            label="Status Messages"
            value={content.statusMessages.join("\n")}
            onChange={(value) => updateStringList("statusMessages", value)}
          />
          <TextArea
            label="Contact Intents"
            value={content.contactIntents.join("\n")}
            onChange={(value) => updateStringList("contactIntents", value)}
          />
        </div>
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  destructive = false,
  label,
  onClick,
}: {
  destructive?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={destructive ? "cms-icon-button danger" : "cms-icon-button"}
      onClick={onClick}
      title={label}
      type="button"
    >
      {destructive ? <Trash2 size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
    </button>
  );
}
