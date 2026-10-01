import { NextResponse } from "next/server";

const ALLOWED = new Set(["LCP", "CLS", "INP", "TTFB", "FCP"]);

export async function POST(request: Request) {
  const raw = await request.text();
  if (!raw || raw.length > 512) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const payload = JSON.parse(raw) as { name?: unknown; value?: unknown; path?: unknown };
    if (typeof payload.name !== "string" || !ALLOWED.has(payload.name)) {
      return new NextResponse(null, { status: 204 });
    }
    if (typeof payload.value !== "number" || !Number.isFinite(payload.value)) {
      return new NextResponse(null, { status: 204 });
    }
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
