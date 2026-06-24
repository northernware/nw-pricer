import { createHash } from "crypto";

function normalizeConfigForIntegrity(config: unknown): unknown {
  const cloned = JSON.parse(JSON.stringify(config)) as {
    invoices?: Array<Record<string, unknown>>;
  };

  if (Array.isArray(cloned.invoices)) {
    cloned.invoices = cloned.invoices.map((invoice) => ({
      ...invoice,
      status: "unpaid",
    }));
  }

  return cloned;
}

/**
 * Deterministic SHA-256 of project config JSON.
 *
 * Invoice paid/unpaid status is operational payment state and can change after
 * signing without changing the signed scope, price, terms, or schedule.
 */
export function hashProjectConfig(config: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(normalizeConfigForIntegrity(config)))
    .digest("hex");
}

export function isConfigTampered(
  config: unknown,
  snapshotHash: string | null | undefined,
  isApproved: boolean
): boolean {
  if (!isApproved || !snapshotHash) return false;
  return hashProjectConfig(config) !== snapshotHash;
}
