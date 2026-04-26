/**
 * Absolute URL for an image path returned by the API (or any http(s) URL).
 */
export function apiFileUrl(relativeOrAbsolute: string): string {
  if (!relativeOrAbsolute) return relativeOrAbsolute;
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const path = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  return `${base}${path}`;
}

/**
 * Maps a stored full-size upload path to its pre-rendered 80×80 thumb path.
 */
export function productImageThumbPath(fullPath: string): string {
  if (!fullPath || !fullPath.includes('/uploads/products/') || fullPath.includes('_thumb.')) {
    return fullPath;
  }
  return fullPath.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
}

/**
 * Resolves a thumb URL for list/avatar use (local uploads use server-generated 80×80 assets).
 */
export function productThumbSrcForDisplay(fullPath: string): string {
  return apiFileUrl(productImageThumbPath(fullPath));
}
