const STORAGE_KEY = 'recentSearches';
const MAX_ITEMS = 10;

/**
 * Reads recent search strings from localStorage (newest first, max 10).
 *
 * Returns:
 *   string[]: Parsed list or empty array if missing/invalid.
 */
export function readRecentSearches(): string[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

/**
 * Persists the recent searches list to localStorage.
 *
 * Args:
 *   items (string[]): List to store (caller caps length).
 *
 * Returns:
 *   void
 */
export function writeRecentSearches(items: string[]): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Adds a term to recents (deduped case-insensitive, newest first, max 10).
 *
 * Args:
 *   term (string): Search text to record.
 *
 * Returns:
 *   void
 */
export function addRecentSearch(term: string): void {
  const t = term.trim();
  if (!t) {
    return;
  }
  const prev = readRecentSearches().filter((x) => x.toLowerCase() !== t.toLowerCase());
  const next = [t, ...prev].slice(0, MAX_ITEMS);
  writeRecentSearches(next);
}

/**
 * Removes one term from recents.
 *
 * Args:
 *   term (string): Exact string to remove.
 *
 * Returns:
 *   void
 */
export function removeRecentSearch(term: string): void {
  const next = readRecentSearches().filter((x) => x !== term);
  writeRecentSearches(next);
}
