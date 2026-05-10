import { describe, it, expect, beforeEach } from 'vitest';
import {
  readRecentSearches,
  addRecentSearch,
  removeRecentSearch,
} from '../../src/lib/recent-searches';

const store: Record<string, string> = {};

/**
 * Minimal localStorage stub for node test environment.
 */
function mockLocalStorage(): void {
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  mockLocalStorage();
});

describe('recent-searches', () => {
  it('adds newest first and caps at 10', () => {
    for (let i = 1; i <= 12; i += 1) {
      addRecentSearch(`q${i}`);
    }
    const r = readRecentSearches();
    expect(r).toHaveLength(10);
    expect(r[0]).toBe('q12');
    expect(r[9]).toBe('q3');
  });

  it('dedupes case-insensitive', () => {
    addRecentSearch('Soap');
    addRecentSearch('soap');
    expect(readRecentSearches()).toEqual(['soap']);
  });

  it('removeRecentSearch removes exact term', () => {
    addRecentSearch('a');
    addRecentSearch('b');
    removeRecentSearch('a');
    expect(readRecentSearches()).toEqual(['b']);
  });
});
