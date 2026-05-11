/** Local SVG when `books.cover_url` is empty (see DESIGN / Figma placeholder tone). */
export const BOOK_COVER_PLACEHOLDER = "/covers/book-placeholder.svg";

export function resolveBookCoverSrc(
  coverUrl: string | null | undefined,
): string {
  const trimmed = coverUrl?.trim();
  return trimmed ? trimmed : BOOK_COVER_PLACEHOLDER;
}
