import { RateLimitedError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";

interface Bucket {
  count: number;
  windowStartedAt: number;
}

/**
 * In-memory fixed-window rate limiter, keyed per user/IP + route.
 *
 * This is sufficient for a single Next.js server instance (dev, small
 * deployments). For a multi-instance production deployment, swap the
 * `buckets` Map for a shared store (Upstash Redis, Supabase table, etc.)
 * behind the same `checkRateLimit` signature — callers do not need to
 * change.
 */
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, opts?: { windowMs?: number; max?: number }): void {
  const env = getServerEnv();
  const windowMs = opts?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = opts?.max ?? env.RATE_LIMIT_MAX_REQUESTS;
  const now = Date.now();

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartedAt >= windowMs) {
    buckets.set(key, { count: 1, windowStartedAt: now });
    return;
  }

  if (existing.count >= max) {
    throw new RateLimitedError(
      `Rate limit exceeded. Try again in ${Math.ceil((windowMs - (now - existing.windowStartedAt)) / 1000)}s.`
    );
  }

  existing.count += 1;
}

/** Periodically clears stale buckets so the Map doesn't grow unbounded. */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.windowStartedAt > 10 * 60_000) buckets.delete(key);
    }
  }, 5 * 60_000);
}
