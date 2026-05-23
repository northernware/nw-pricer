import { describe, it, expect } from "vitest";
import { calculateRequestSchema } from "./calculate-schema";

describe("calculateRequestSchema", () => {
  const valid = {
    projectType: "business_website",
    pages: 5,
    designLevel: "custom",
    complexity: "simple",
  };

  it("accepts minimal valid body", () => {
    expect(calculateRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = calculateRequestSchema.safeParse({ pages: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects pages out of range", () => {
    const result = calculateRequestSchema.safeParse({ ...valid, pages: 0 });
    expect(result.success).toBe(false);
  });
});
