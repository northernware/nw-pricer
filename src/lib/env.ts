/**
 * Read a required environment variable.
 * In production, missing values throw. In development, an optional fallback may be used.
 */
export function requireEnv(name: string, devFallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} environment variable is required in production`);
  }
  if (devFallback !== undefined) return devFallback;
  throw new Error(`${name} environment variable is required`);
}

/** First set var from `names`, else requireEnv(primary, devFallback). */
export function resolveEnv(
  names: string[],
  devFallback?: string
): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  const primary = names[0];
  return requireEnv(primary, devFallback);
}

/** Admin login password (`CRM_PASSWORD`, legacy `ADMIN_PASSWORD`). */
export function getCrmPassword(): string {
  return resolveEnv(['CRM_PASSWORD', 'ADMIN_PASSWORD'], 'northernware');
}

/** JWT signing secret (`JWT_SECRET`, legacy `AUTH_SECRET`). */
export function getJwtSecret(): string {
  return resolveEnv(
    ['JWT_SECRET', 'AUTH_SECRET'],
    'dev-only-jwt-secret-not-for-production'
  );
}
