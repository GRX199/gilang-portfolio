import { NextResponse, type NextRequest } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Production memakai Sanity Studio. File-based CMS hanya untuk lokal." },
      { status: 403 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { message: "CMS secret salah atau belum dikonfigurasi." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const content = await saveSiteContent(body);
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(
      { message: "Konten tidak bisa disimpan. Periksa format data CMS." },
      { status: 400 },
    );
  }
}

function isAuthorized(request: NextRequest) {
  const cmsSecret = process.env.CMS_SECRET;

  if (!cmsSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-cms-secret") === cmsSecret;
}
