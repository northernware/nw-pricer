import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimit("test-key");
  });

  it("allows requests under the limit", () => {
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).allowed).toBe(true);
  });

  it("blocks when limit exceeded", () => {
    checkRateLimit("test-key", 2, 60_000);
    checkRateLimit("test-key", 2, 60_000);
    const third = checkRateLimit("test-key", 2, 60_000);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
  });
});
