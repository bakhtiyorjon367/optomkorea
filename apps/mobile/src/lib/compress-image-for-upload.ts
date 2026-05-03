import imageCompression from 'browser-image-compression';

/** Shown in UI when in-browser compression fails. */
export const IMAGE_COMPRESS_FAILED = 'IMAGE_COMPRESS_FAILED';

/** Aligned with API Sharp resize; keeps uploads small and upload fast. */
const MAX_WIDTH_OR_HEIGHT = 1920;
/** Target cap per file (MB) before upload; under typical 6–10MB server multer limits. */
const MAX_SIZE_MB = 0.85;
/** Skip work for tiny files (icons, already compressed). */
const SKIP_BELOW_BYTES = 180_000;

/**
 * Shrinks and re-encodes photos in the browser so uploads fit server limits and finish faster.
 *
 * Args:
 *   file (File): Original from `<input type="file">` or camera.
 *
 * Returns:
 *   File: JPEG (usually much smaller) or the original on unlikely failure.
 */
export async function compressImageFileForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }
  if (file.size < SKIP_BELOW_BYTES) {
    return file;
  }
  try {
    return await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    });
  } catch {
    throw new Error(IMAGE_COMPRESS_FAILED);
  }
}
