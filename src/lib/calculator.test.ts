import { describe, it, expect } from "vitest";
import { calculate, type CalculatorInput } from "./calculator";
import { DEFAULTS } from "./constants";

function input(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return { ...DEFAULTS, ...overrides };
}

describe("calculate", () => {
  it("computes hours and price from defaults", () => {
    const result = calculate(input());
    // pages: 10 + 5*6 = 40, design custom: 18 → baseHours 58
    expect(result.pagesHours).toBe(40);
    expect(result.designHours).toBe(18);
    expect(result.featureHours).toBe(0);
    expect(result.baseHours).toBe(58);
    expect(result.complexityMultiplier).toBe(1);
    expect(result.adjustedHours).toBe(58);
    expect(result.baseCost).toBe(58 * 600);
    expect(result.finalPrice).toBe(58 * 600 * 1.1); // 10% buffer
    expect(result.roundedPrice).toBe(38000);
    expect(result.hostingPrice).toBe(4000); // standard plan
  });

  it("applies complex complexity multiplier", () => {
    const result = calculate(input({ complexity: "complex" }));
    expect(result.complexityMultiplier).toBe(1.5);
    expect(result.adjustedHours).toBe(87); // 58 * 1.0 * 1.5
  });

  it("applies project type multiplier", () => {
    const baseline = calculate(input({ projectType: "business_website" }));
    const ecommerce = calculate(input({ projectType: "ecommerce" }));
    expect(ecommerce.projectTypeMultiplier).toBe(1.2);
    expect(ecommerce.adjustedHours).toBeGreaterThan(baseline.adjustedHours);
  });

  it("sums feature hours", () => {
    const result = calculate(
      input({ features: ["contact_form", "cms_blog"] })
    );
    expect(result.featureHours).toBe(4 + 12);
    expect(result.baseHours).toBe(40 + 18 + 16);
  });

  it("applies discount after buffer", () => {
    const result = calculate(input({ bufferPercent: 0, discountPercent: 10 }));
    const baseCost = 58 * 600;
    expect(result.finalPrice).toBe(baseCost * 0.9);
    expect(result.discountAmount).toBe(baseCost * 0.1);
  });

  it("rounds to nearest 5000", () => {
    const result = calculate(
      input({ bufferPercent: 0, roundingMode: "nearest_5000" })
    );
    expect(result.roundedPrice % 5000).toBe(0);
  });

  it("uses none rounding for exact price", () => {
    const result = calculate(input({ bufferPercent: 0, roundingMode: "none" }));
    expect(result.roundedPrice).toBe(Math.round(result.finalPrice));
  });

  it("handles zero buffer and zero discount", () => {
    const result = calculate(input({ bufferPercent: 0, discountPercent: 0 }));
    expect(result.finalPrice).toBe(result.baseCost);
    expect(result.discountAmount).toBe(0);
  });

  it("handles empty features list", () => {
    const result = calculate(input({ features: [] }));
    expect(result.featureHours).toBe(0);
  });

  it("scales pages hours linearly", () => {
    const onePage = calculate(input({ pages: 1 }));
    const tenPages = calculate(input({ pages: 10 }));
    expect(onePage.pagesHours).toBe(10 + 6);
    expect(tenPages.pagesHours).toBe(10 + 60);
  });

  it("excludes hosting from rounded project price", () => {
    const withHosting = calculate(input({ hostingPlan: "advanced" }));
    const withoutHosting = calculate(input({ hostingPlan: "none" }));
    expect(withHosting.hostingPrice).toBeGreaterThan(0);
    expect(withHosting.roundedPrice).toBe(withoutHosting.roundedPrice);
  });
});
