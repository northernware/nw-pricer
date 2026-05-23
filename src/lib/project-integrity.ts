import { createHash } from "crypto";

/** Deterministic SHA-256 of project config JSON (matches approval snapshot). */
export function hashProjectConfig(config: unknown): string {
  return createHash("sha256").update(JSON.stringify(config)).digest("hex");
}

export function isConfigTampered(
  config: unknown,
  snapshotHash: string | null | undefined,
  isApproved: boolean
): boolean {
  if (!isApproved || !snapshotHash) return false;
  return hashProjectConfig(config) !== snapshotHash;
}
