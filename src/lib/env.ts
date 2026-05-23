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
