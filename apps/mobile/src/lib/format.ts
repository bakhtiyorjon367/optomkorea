/**
 * Formats an integer amount as Uzbek som with space-separated thousands.
 *
 * Args:
 *   amount (number): Value in UZS (integer, no decimals).
 *
 * Returns:
 *   string: Formatted string like "150 000 so'm".
 */
export function formatUZS(amount: number): string {
  const formatted = new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} so'm`;
}

/**
 * Formats a date using locale-aware Intl.DateTimeFormat.
 *
 * Args:
 *   date (string | Date): Date value to format.
 *   locale (string): BCP 47 locale tag (e.g. 'uz', 'ru').
 *
 * Returns:
 *   string: Locale-formatted date string.
 */
export function formatDate(date: string | Date, locale: string = 'uz'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
