/** Cryptographically secure ID for projects (public /p/[id] links). */
export function generateId(): string {
  return crypto.randomUUID();
}
