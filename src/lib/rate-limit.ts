/** In-memory sliding-window rate limiter (per server instance). */

const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    return { allowed: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
