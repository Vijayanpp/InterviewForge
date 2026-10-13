import type { NextRequest } from "next/server";
import { PRODUCTION_SITE_URL } from "@/lib/seo";

/**
 * Public site origin for redirects after auth.
 *
 * Never use Docker's listen address (HOSTNAME=0.0.0.0) as a browser Location.
 * Prefer: explicit APP_URL → Forwarded / Host headers → usable request origin.
 *
 * Keep `ENV HOSTNAME=0.0.0.0` in the Dockerfile — that is only the listen bind.
 * Removing it does not fix redirects and can make the container unreachable.
 */
export function getPublicAppOrigin(
  requestOrigin?: string,
  headers?: Headers | { get(name: string): string | null }
): string {
  const explicit = process.env.APP_URL?.trim().replace(/\/$/, "");
  const fromHeaders = originFromForwardedHeaders(headers);
  const fromRequest =
    requestOrigin && !isUnusableOrigin(requestOrigin)
      ? requestOrigin.replace(/\/$/, "")
      : undefined;

  if (explicit && !isUnusableOrigin(explicit)) {
    // Local APP_URL must not override a real public host (Hostinger).
    if (isLocalOrigin(explicit)) {
      if (fromHeaders && !isLocalOrigin(fromHeaders)) return fromHeaders;
      if (fromRequest && !isLocalOrigin(fromRequest)) return fromRequest;
    }
    return explicit;
  }

  if (fromHeaders) return fromHeaders;
  if (fromRequest) return fromRequest;

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_SITE_URL
    : "http://localhost:3100";
}

/** Convenience: resolve origin from a NextRequest (headers + nextUrl). */
export function getPublicAppOriginFromRequest(request: NextRequest): string {
  return getPublicAppOrigin(request.nextUrl.origin, request.headers);
}

function originFromForwardedHeaders(
  headers?: Headers | { get(name: string): string | null }
): string | undefined {
  if (!headers) return undefined;

  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headers.get("host")?.split(",")[0]?.trim();
  if (!host) return undefined;

  const hostname = host.replace(/:\d+$/, "");
  if (hostname === "0.0.0.0" || hostname === "[::]" || hostname === "::") {
    return undefined;
  }

  const protoHeader = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader ||
    (hostname === "localhost" || hostname === "127.0.0.1" ? "http" : "https");

  const origin = `${proto}://${host}`.replace(/\/$/, "");
  return isUnusableOrigin(origin) ? undefined : origin;
}

function isUnusableOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "0.0.0.0" || host === "[::]" || host === "::";
  } catch {
    return true;
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}
