import { describe, it, expect } from "vitest";
import { convertAmount, roundHourlyRate, DEFAULT_FX_PER_PHP } from "./fx";

describe("fx", () => {
  it("converts PHP hourly rate to USD", () => {
    const usd = convertAmount(5800, "PHP", "USD", DEFAULT_FX_PER_PHP);
    expect(usd).toBeCloseTo(99.76, 0);
  });

  it("round-trips through PHP", () => {
    const back = convertAmount(
      convertAmount(600, "PHP", "USD", DEFAULT_FX_PER_PHP),
      "USD",
      "PHP",
      DEFAULT_FX_PER_PHP
    );
    expect(back).toBeCloseTo(600, 0);
  });

  it("roundHourlyRate uses whole numbers for PHP", () => {
    expect(roundHourlyRate(599.7, "PHP")).toBe(600);
  });

  it("roundHourlyRate keeps 2 decimals for USD", () => {
    expect(roundHourlyRate(10.456, "USD")).toBe(10.46);
  });
});
