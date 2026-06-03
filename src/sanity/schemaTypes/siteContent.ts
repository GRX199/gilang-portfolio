import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultContent } from "@/lib/default-content";
import { iconOptions } from "@/lib/icon-map";

const stackCategoryOptions = [
  { title: "Core", value: "core" },
  { title: "Language", value: "language" },
  { title: "Framework", value: "framework" },
  { title: "Tool", value: "tool" },
];

export const siteContentType = defineType({
  name: "siteContent",
  title: "Site Content",
  type: "document",
  initialValue: defaultContent,
  fields: [
    defineField({
      name: "siteConfig",
      title: "Profile",
      type: "object",
      fields: [
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "handle", title: "Handle", type: "string" }),
        defineField({ name: "roles", title: "Roles", type: "string" }),
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "siteUrl", title: "Site URL", type: "url" }),
        defineField({ name: "description", title: "Meta Description", type: "text", rows: 3 }),
        defineField({ name: "headline", title: "Hero Headline", type: "string" }),
        defineField({ name: "bio", title: "Hero Bio", type: "text", rows: 4 }),
        defineField({ name: "focus", title: "Focus", type: "string" }),
        defineField({ name: "availability", title: "Availability", type: "string" }),
        defineField({ name: "spotifyUrl", title: "Spotify URL", type: "url" }),
        defineField({
          name: "socials",
          title: "Social Links",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "href", title: "URL", type: "url" }),
              ],
              preview: {
                select: { title: "label", subtitle: "href" },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "statusMessages",
      title: "Status Messages",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "quickLinks",
      title: "Quick Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "URL or Path", type: "string" }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: { list: iconOptions },
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "id", title: "Slug", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "year", title: "Year", type: "string" }),
            defineField({ name: "status", title: "Status", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({
              name: "tags",
              title: "Tags",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({
              name: "image",
              title: "Image Path or URL",
              description:
                "Manual fallback image. Auto screenshot can replace this when a live URL is captured.",
              type: "string",
            }),
            defineField({
              name: "imageAsset",
              title: "Sanity Image Upload",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({ name: "href", title: "Project Link", type: "string" }),
            defineField({
              name: "liveUrl",
              title: "Live Website URL",
              description:
                "Public deployed URL used by npm run capture:screenshots. Leave empty for non-website projects.",
              type: "url",
            }),
            defineField({
              name: "useAutoScreenshot",
              title: "Use Auto Screenshot",
              description:
                "When enabled, generated screenshots from the live URL replace the manual image if available.",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "screenshotPaths",
              title: "Auto Screenshot Paths",
              description:
                "Optional paths to capture from the live URL, for example /, /dashboard, /contact.",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: { list: iconOptions },
            }),
            defineField({ name: "featured", title: "Show on Homepage", type: "boolean" }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({ name: "timeline", title: "Timeline", type: "string" }),
            defineField({ name: "problem", title: "Problem", type: "text", rows: 3 }),
            defineField({ name: "solution", title: "Solution", type: "text", rows: 3 }),
            defineField({ name: "impact", title: "Impact", type: "text", rows: 3 }),
            defineField({
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({
              name: "screenshots",
              title: "Screenshots",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "title", title: "Title", type: "string" }),
                    defineField({ name: "caption", title: "Caption", type: "text", rows: 2 }),
                    defineField({
                      name: "image",
                      title: "Image Path or URL",
                      type: "string",
                    }),
                    defineField({
                      name: "imageAsset",
                      title: "Sanity Image Upload",
                      type: "image",
                      options: { hotspot: true },
                    }),
                  ],
                  preview: {
                    select: {
                      title: "title",
                      subtitle: "caption",
                      media: "imageAsset",
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: "metrics",
              title: "Case Study Metrics",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "value", title: "Value", type: "string" }),
                  ],
                  preview: {
                    select: { title: "value", subtitle: "label" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "status",
              media: "imageAsset",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "stackItems",
      title: "Tech Stack",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "id", title: "Slug", type: "string" }),
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: { list: stackCategoryOptions },
            }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: { list: iconOptions },
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "category" },
          },
        }),
      ],
    }),
    defineField({
      name: "contactIntents",
      title: "Contact Intent Options",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Portfolio Content",
        subtitle: "Profile, projects, stack, links, and contact options",
      };
    },
  },
});
