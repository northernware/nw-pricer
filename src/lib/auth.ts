import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { requireEnv } from '@/lib/env';

let signingKey: Uint8Array | null = null;

function getSigningKey(): Uint8Array {
  if (!signingKey) {
    const secret = requireEnv('JWT_SECRET', 'dev-only-jwt-secret-not-for-production');
    signingKey = new TextEncoder().encode(secret);
  }
  return signingKey;
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSigningKey());
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, getSigningKey(), {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('nw_session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch {
    return null;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** Requires a valid admin session cookie. Throws UnauthorizedError if missing. */
export async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new UnauthorizedError();
  }
  return session;
}
