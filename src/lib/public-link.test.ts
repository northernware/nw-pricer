import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createPublicLinkToken,
  verifyPublicLinkToken,
  buildPublicDocumentPath,
  resolvePublicLinkAccess,
} from "./public-link";

describe("public-link tokens", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("PUBLIC_LINK_SIGNING", "true");
    vi.stubEnv("JWT_SECRET", "test-jwt-secret-for-public-links");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates and verifies view and sign tokens", async () => {
    const view = await createPublicLinkToken({
      pid: "proj-1",
      scope: "view",
      mode: "proposal",
    });
    const sign = await createPublicLinkToken({
      pid: "proj-1",
      scope: "sign",
      mode: "contract",
    });

    expect(await verifyPublicLinkToken(view)).toMatchObject({
      pid: "proj-1",
      scope: "view",
    });
    expect(await verifyPublicLinkToken(sign)).toMatchObject({
      pid: "proj-1",
      scope: "sign",
    });
  });

  it("buildPublicDocumentPath includes token query params", () => {
    const path = buildPublicDocumentPath("abc", "contract", {
      viewToken: "v",
      signToken: "s",
    });
    expect(path).toContain("/p/abc");
    expect(path).toContain("mode=contract");
    expect(path).toContain("token=v");
    expect(path).toContain("sign=s");
  });

  it("resolvePublicLinkAccess requires sign token for contract signing", async () => {
    const sign = await createPublicLinkToken({
      pid: "proj-1",
      scope: "sign",
      mode: "contract",
    });

    const bare = await resolvePublicLinkAccess("proj-1", "contract", {});
    expect(bare.canView).toBe(true);
    expect(bare.canSign).toBe(false);

    const withSign = await resolvePublicLinkAccess("proj-1", "contract", {
      sign,
    });
    expect(withSign.canSign).toBe(true);
  });
});
