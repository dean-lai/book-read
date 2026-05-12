"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { BookRowWithCategory } from "@/server/books/repositories/books-repository";

type BookFavoriteHeartButtonProps = {
  bookId: string;
  isFavorite: boolean;
  isLoggedIn: boolean;
  disabled?: boolean;
  onToggle: (bookId: string, snapshot?: BookRowWithCategory) => void;
  onRequireLogin: () => void;
  /** `on-cover` — corner overlay, reveals on hover. `toolbar` — always visible (e.g. book detail). */
  variant?: "on-cover" | "toolbar";
};

export function BookFavoriteHeartButton({
  bookId,
  isFavorite,
  isLoggedIn,
  disabled,
  onToggle,
  onRequireLogin,
  variant = "on-cover",
}: BookFavoriteHeartButtonProps) {
  const t = useTranslations("favorites");
  const isToolbar = variant === "toolbar";

  return (
    <div
      className={cn(
        "flex justify-end",
        isToolbar ? "shrink-0 pt-0.5" : "absolute right-2 top-2",
      )}
    >
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        disabled={disabled}
        className={cn(
          "rounded-full border-0 bg-canvas/90 text-ink shadow-card backdrop-blur-sm transition-opacity",
          isToolbar &&
            "dark:border dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15 dark:hover:text-white",
          isToolbar
            ? "opacity-100"
            : isFavorite
              ? "opacity-100"
              : "opacity-0 group-hover/cover:opacity-100 focus-within:opacity-100",
        )}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isLoggedIn) {
            onRequireLogin();
            return;
          }
          onToggle(bookId);
        }}
      >
        <Heart
          className={cn(
            "size-5",
            isFavorite
              ? "fill-current text-red-500"
              : isToolbar
                ? "text-ink dark:text-white"
                : "text-ink",
          )}
        />
      </Button>
    </div>
  );
}
