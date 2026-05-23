import { describe, it, expect } from "vitest";
import { parseProjectConfig, assertProjectConfig } from "./project-config-schema";
import { DEFAULTS } from "./constants";

describe("parseProjectConfig", () => {
  it("returns defaults for null input", () => {
    const config = parseProjectConfig(null);
    expect(config.projectType).toBe(DEFAULTS.projectType);
    expect(config.pages).toBe(DEFAULTS.pages);
  });

  it("merges partial config", () => {
    const config = parseProjectConfig({ pages: 10, projectType: "ecommerce" });
    expect(config.pages).toBe(10);
    expect(config.projectType).toBe("ecommerce");
    expect(config.proposal.clientName).toBe(DEFAULTS.proposal.clientName);
  });

  it("clamps invalid pages via schema", () => {
    expect(() => assertProjectConfig({ ...DEFAULTS, pages: 0 })).toThrow();
  });
});
