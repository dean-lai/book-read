"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { BookCover } from "@/components/book-cover";
import { Link } from "@/i18n/navigation";

import { BookFavoriteHeartButton } from "./book-favorite-heart-button";
import { resolveBookCoverSrc } from "../lib/book-cover-src";
import { useHomeBooksSearch } from "./home-books-search";

export function HomeFavoritesStrip() {
  const t = useTranslations("home");
  const {
    activeQuery,
    isLoggedIn,
    favoritesEnabled,
    favoriteBookIds,
    favoritePreviewBooks,
    toggleFavorite,
    openFavoriteLoginDialog,
    featuredBook,
  } = useHomeBooksSearch();

  const stripBooks = useMemo(() => {
    const rows = favoritePreviewBooks.filter((b) => favoriteBookIds.has(b.id));
    if (!featuredBook) {
      return rows;
    }
    return rows.filter((b) => b.id !== featuredBook.id);
  }, [favoriteBookIds, favoritePreviewBooks, featuredBook]);

  if (
    !isLoggedIn ||
    !favoritesEnabled ||
    activeQuery.length > 0 ||
    stripBooks.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-content px-base pb-md md:px-lg xl:px-xl"
      aria-labelledby="favorites-strip-heading"
    >
      <div className="mb-sm flex items-center justify-between gap-sm">
        <h2
          id="favorites-strip-heading"
          className="font-sans text-title-md font-semibold text-ink"
        >
          {t("favoritesStripTitle")}
        </h2>
        <Link
          href="/favorites"
          className="inline-flex shrink-0 items-center gap-xxs font-sans text-body-sm font-medium text-ink-primary underline-offset-4 hover:underline"
        >
          {t("favoritesStripAll")}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div
        className="-mx-base flex gap-sm overflow-x-auto px-base pb-xs pt-xxs md:-mx-lg md:px-lg xl:-mx-xl xl:px-xl"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {stripBooks.map((book) => (
          <div
            key={book.id}
            className="w-36 shrink-0 scroll-ms-4"
            style={{ scrollSnapAlign: "start" }}
          >
            <BookCover
              href={`/books/${book.id}`}
              coverSrc={resolveBookCoverSrc(book.coverUrl)}
              bookName={book.title}
              authorName={book.author}
              coverAlt={t("coverAlt", { title: book.title })}
              className="max-w-36"
              coverAdornment={
                <BookFavoriteHeartButton
                  bookId={book.id}
                  isFavorite={favoriteBookIds.has(book.id)}
                  isLoggedIn={isLoggedIn}
                  onToggle={(id) => toggleFavorite(id, book)}
                  onRequireLogin={openFavoriteLoginDialog}
                />
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
