'use client';

import DOMPurify from 'dompurify';
import { normalizeTicketFormattedOutput } from './normalizeTicketFormattedOutput';

/**
 * Convert HTML markup into readable plain text for clipboard usage.
 * Keeps basic line breaks while stripping tags so pasted content is clean.
 */
export function htmlToPlainText(input?: string | null): string {
  if (!input) return '';

  const normalized = normalizeTicketFormattedOutput(input);
  const sanitized = DOMPurify.sanitize(normalized, { USE_PROFILES: { html: true } });
  const withoutUiAffordances = sanitized
    .replace(/<span[^>]*>\s*Expand\s*<\/span>/gi, '')
    .replace(/<\/summary>/gi, '</summary>\n');

  const withBreaks = withoutUiAffordances
    // explicit line breaks
    .replace(/<br\s*\/?\s*>/gi, '\n')
    // newline after list items
    .replace(/<\/li>/gi, '</li>\n')
    // blank line after major sections/headings
    .replace(/<\/(p|div|section|article|blockquote|h[1-6]|table|pre)>/gi, '</$1>\n\n')
    // space between lists and surrounding content
    .replace(/<\/(ul|ol)>/gi, '</$1>\n\n');

  // SSR guard — fall back to a quick tag strip if window is unavailable.
  if (typeof window === 'undefined') {
    return withBreaks
      .replace(/<[^>]+>/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ +/g, ' ')
      .trim();
  }

  const div = window.document.createElement('div');
  div.innerHTML = withBreaks;
  const raw = (div as HTMLDivElement).innerText || div.textContent || '';

  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
