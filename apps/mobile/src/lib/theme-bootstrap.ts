export const THEME_STORAGE_KEY = 'themePreference';

export type ThemePreference = 'dark' | 'light';

/**
 * Resolves active theme from manual storage or system preference.
 *
 * Returns:
 *   ThemePreference: 'dark' or 'light'.
 */
export function getResolvedTheme(): ThemePreference {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies theme to the document root via data-theme attribute.
 *
 * Args:
 *   theme (ThemePreference): Theme to apply.
 *
 * Returns:
 *   void
 */
export function applyDocumentTheme(theme: ThemePreference): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Persists user theme choice and applies it to the document.
 *
 * Args:
 *   theme (ThemePreference): Theme to persist.
 *
 * Returns:
 *   void
 */
export function persistAndApplyTheme(theme: ThemePreference): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  applyDocumentTheme(theme);
}

/**
 * Sets initial data-theme before React paint (system or saved preference).
 *
 * Returns:
 *   void
 */
export function bootstrapTheme(): void {
  applyDocumentTheme(getResolvedTheme());
}
