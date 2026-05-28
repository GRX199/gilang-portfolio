import { ImageResponse } from "next/og";
import {
  getProjectById,
  getProjectCaseStudy,
  getSourceLabel,
} from "@/lib/project-presenter";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type ProjectOgImageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Image({ params }: ProjectOgImageProps) {
  const { id } = await params;
  const { content, project } = await getProjectById(id);

  if (!content || !project) {
    return new ImageResponse(<FallbackImage />, size);
  }

  const sourceLabel = getSourceLabel(project);
  const caseStudy = getProjectCaseStudy(project, sourceLabel);
  const tags = project.tags.slice(0, 4);
  const metrics = caseStudy.metrics.slice(0, 3);

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
              "linear-gradient(112deg, transparent 0 45%, rgba(255,91,95,0.2) 45% 45.7%, transparent 45.7% 100%), linear-gradient(155deg, rgba(123,223,242,0.13), transparent 38%), linear-gradient(28deg, transparent 0 74%, rgba(255,209,102,0.09) 74% 75%, transparent 75% 100%)",
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
            background: "rgba(17,17,17,0.84)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 34 }}>
            <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ color: "#ff5b5f", fontSize: 24, fontWeight: 900 }}>
                {`CASE STUDY / ${sourceLabel.toUpperCase()}`}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Georgia, serif",
                  fontSize: project.title.length > 18 ? 74 : 88,
                  fontWeight: 800,
                  lineHeight: 0.92,
                  letterSpacing: -1,
                }}
              >
                {project.title}
              </div>
              <div
                style={{
                  maxWidth: 700,
                  color: "rgba(246,244,239,0.74)",
                  fontSize: 27,
                  lineHeight: 1.28,
                }}
              >
                {project.description}
              </div>
            </div>

            <div
              style={{
                width: 260,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignSelf: "flex-start",
              }}
            >
              <Metric label="Year" value={project.year} />
              <Metric label="Status" value={project.status} />
              <Metric label="Role" value={caseStudy.role} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 740 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 999,
                    padding: "9px 13px",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(246,244,239,0.86)",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    minWidth: 120,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ color: "#ff5b5f", fontSize: 14, fontWeight: 900 }}>
                    {metric.label.toUpperCase()}
                  </div>
                  <div style={{ color: "#f6f4ef", fontSize: 20, fontWeight: 800 }}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
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
      <div style={{ color: "rgba(246,244,239,0.52)", fontSize: 14, fontWeight: 900 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: "#f6f4ef", fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function FallbackImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "#f6f4ef",
        fontFamily: "Georgia, serif",
        fontSize: 72,
        fontWeight: 800,
      }}
    >
      Project case study
    </div>
  );
}
