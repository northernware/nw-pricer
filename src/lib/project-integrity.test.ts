import { describe, expect, it } from "vitest";
import { hashProjectConfig, isConfigTampered } from "./project-integrity";

const baseConfig = {
  projectType: "business_website",
  pages: 5,
  proposal: {
    projectName: "Website",
    paymentTerms: "50/50",
  },
  invoices: [
    { id: "deposit", label: "Deposit", percentage: 50, status: "unpaid" },
    { id: "balance", label: "Balance", percentage: 50, status: "unpaid" },
  ],
};

describe("project integrity", () => {
  it("ignores invoice paid status changes", () => {
    const signedHash = hashProjectConfig(baseConfig);
    const paidConfig = {
      ...baseConfig,
      invoices: [
        { id: "deposit", label: "Deposit", percentage: 50, status: "paid" },
        { id: "balance", label: "Balance", percentage: 50, status: "unpaid" },
      ],
    };

    expect(isConfigTampered(paidConfig, signedHash, true)).toBe(false);
  });

  it("still flags payment schedule amount changes", () => {
    const signedHash = hashProjectConfig(baseConfig);
    const changedScheduleConfig = {
      ...baseConfig,
      invoices: [
        { id: "deposit", label: "Deposit", percentage: 60, status: "unpaid" },
        { id: "balance", label: "Balance", percentage: 40, status: "unpaid" },
      ],
    };

    expect(isConfigTampered(changedScheduleConfig, signedHash, true)).toBe(true);
  });
});
