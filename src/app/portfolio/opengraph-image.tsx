import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";
import { getPortfolioProjects } from "@/lib/github-projects";

export const runtime = "nodejs";
export const alt = "Gilang selected work";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const content = await getSiteContent();
  const { projects } = await getPortfolioProjects(content.siteConfig, content.projects);
  const featuredCount = projects.filter((project) => project.featured).length;
  const githubCount = projects.filter((project) => project.source === "github").length;
  const topProjects = projects.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 54,
          background: "#050505",
          color: "#f6f4ef",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(112deg, transparent 0 47%, rgba(255,91,95,0.18) 47% 47.7%, transparent 47.7% 100%), linear-gradient(150deg, rgba(123,223,242,0.14), transparent 42%)",
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 18,
            padding: 42,
            background: "rgba(17,17,17,0.82)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ color: "#ff5b5f", fontSize: 24, fontWeight: 900 }}>
                {`${content.siteConfig.name.toUpperCase()} / SELECTED WORK`}
              </div>
              <div
                style={{
                  maxWidth: 760,
                  display: "flex",
                  fontFamily: "Georgia, serif",
                  fontSize: 88,
                  fontWeight: 800,
                  lineHeight: 0.92,
                  letterSpacing: -1,
                }}
              >
                Portfolio case studies.
              </div>
            </div>
            <div
              style={{
                width: 210,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignSelf: "flex-start",
              }}
            >
              <Metric label="Total work" value={String(projects.length)} />
              <Metric label="Featured" value={String(featuredCount)} />
              <Metric label="GitHub" value={String(githubCount)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {topProjects.map((project) => (
              <div
                key={project.id}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 14,
                  padding: 16,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ color: "#ff5b5f", fontSize: 18, fontWeight: 900 }}>
                  {`${project.year} / ${project.status}`}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{project.title}</div>
                <div style={{ color: "rgba(246,244,239,0.68)", fontSize: 18 }}>
                  {project.tags.slice(0, 3).join(" + ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 14,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ color: "#f6f4ef", fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 800 }}>
        {value}
      </div>
      <div style={{ color: "rgba(246,244,239,0.54)", fontSize: 15, fontWeight: 900 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}
