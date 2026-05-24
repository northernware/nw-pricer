import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/env";

export type PublicLinkScope = "view" | "sign";

export interface PublicLinkClaims {
  pid: string;
  scope: PublicLinkScope;
  mode?: string;
  inv?: string;
}

const ISSUER = "nw-pricer-public-link";
const DEFAULT_EXP_DAYS = 90;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

/** When true, contract signing requires a `sign` token; bare contract URLs are view-only. */
export function isPublicLinkSigningEnabled(): boolean {
  if (process.env.PUBLIC_LINK_SIGNING === "true") return true;
  if (process.env.PUBLIC_LINK_SIGNING === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function createPublicLinkToken(
  claims: PublicLinkClaims,
  expDays = DEFAULT_EXP_DAYS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expDays * 24 * 60 * 60;
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setExpirationTime(exp)
    .sign(secretKey());
}

export async function verifyPublicLinkToken(
  token: string
): Promise<PublicLinkClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
    });
    const pid = payload.pid;
    const scope = payload.scope;
    if (typeof pid !== "string" || (scope !== "view" && scope !== "sign")) {
      return null;
    }
    return {
      pid,
      scope,
      mode: typeof payload.mode === "string" ? payload.mode : undefined,
      inv: typeof payload.inv === "string" ? payload.inv : undefined,
    };
  } catch {
    return null;
  }
}

export type PublicDocumentMode = "proposal" | "contract" | "invoice" | "quote";

export function buildPublicDocumentPath(
  projectId: string,
  mode: PublicDocumentMode,
  options?: { viewToken?: string; signToken?: string; invoiceId?: string }
): string {
  const params = new URLSearchParams();
  params.set("mode", mode);
  if (options?.invoiceId) params.set("invoiceId", options.invoiceId);
  if (options?.viewToken) params.set("token", options.viewToken);
  if (options?.signToken) params.set("sign", options.signToken);
  return `/p/${projectId}?${params.toString()}`;
}

export async function resolvePublicLinkAccess(
  projectId: string,
  mode: string,
  searchParams: { token?: string; sign?: string }
): Promise<{ canView: boolean; canSign: boolean }> {
  if (!isPublicLinkSigningEnabled()) {
    return { canView: true, canSign: mode === "contract" };
  }

  const viewClaims = searchParams.token
    ? await verifyPublicLinkToken(searchParams.token)
    : null;
  const signClaims = searchParams.sign
    ? await verifyPublicLinkToken(searchParams.sign)
    : null;

  const viewOk =
    !searchParams.token ||
    (viewClaims?.pid === projectId &&
      (viewClaims.scope === "view" || viewClaims.scope === "sign"));
  const signOk =
    signClaims?.pid === projectId && signClaims.scope === "sign";

  // Bare URLs remain viewable; signing requires an explicit sign token.
  const canView = viewOk;
  const canSign = mode === "contract" && signOk;

  return { canView, canSign };
}
