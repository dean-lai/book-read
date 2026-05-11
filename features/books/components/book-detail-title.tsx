"use client";

import type { ReactNode } from "react";

import { BookFavoriteHeartButton } from "@/features/home/components/book-favorite-heart-button";
import { useHomeBooksSearch } from "@/features/home/components/home-books-search";

export type BookDetailTitleProps = {
  bookId: string;
  children: ReactNode;
};

export function BookDetailTitle({ bookId, children }: BookDetailTitleProps) {
  const {
    favoritesEnabled,
    isLoggedIn,
    favoriteBookIds,
    toggleFavorite,
    openFavoriteLoginDialog,
  } = useHomeBooksSearch();

  return (
    <div className="flex items-start gap-sm">
      <div className="min-w-0 flex-1">{children}</div>
      {favoritesEnabled ? (
        <BookFavoriteHeartButton
          variant="toolbar"
          bookId={bookId}
          isFavorite={favoriteBookIds.has(bookId)}
          isLoggedIn={isLoggedIn}
          onToggle={toggleFavorite}
          onRequireLogin={openFavoriteLoginDialog}
        />
      ) : null}
    </div>
  );
}
