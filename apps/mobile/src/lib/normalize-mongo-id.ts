/**
 * Normalizes MongoDB ids from lean JSON (string, ObjectId-like, or populated { _id }).
 *
 * Args:
 *   value (unknown): Raw ref from API.
 *
 * Returns:
 *   string: Hex id or empty string if missing.
 */
export function normalizeMongoId(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object' && '_id' in value) {
    const inner = (value as { _id: unknown })._id;
    return inner === null || inner === undefined ? '' : String(inner);
  }
  return String(value);
}
