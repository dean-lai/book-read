"use client";

import Image from "next/image";
import { Quicksand } from "next/font/google";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveBookCoverSrc } from "@/features/home/lib/book-cover-src";
import { cn } from "@/lib/utils";
import { useHomeBooksSearch } from "./home-books-search";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
  display: "swap",
});

export function HomeFeaturedBookPanel() {
  const t = useTranslations("home");
  const tDetail = useTranslations("bookDetail");
  const { activeQuery, featuredBook: book } = useHomeBooksSearch();

  if (!book || activeQuery.length > 0) {
    return null;
  }

  const coverSrc = resolveBookCoverSrc(book.coverUrl);
  const remote = /^https?:\/\//i.test(coverSrc);
  const categoryLabel =
    book.categoryName?.trim() || tDetail("categoryPlaceholder");
  const detailHref = `/books/${book.id}`;
  const viewTransitionStyle = {
    viewTransitionName: `book-cover-${book.id}`,
  } as React.CSSProperties;

  return (
    <section
      className="mx-auto w-full max-w-content px-base pb-lg pt-md md:px-lg xl:px-xl"
      aria-labelledby="featured-heading"
    >
      <h2
        id="featured-heading"
        className="mb-md font-sans text-title-md font-semibold text-ink"
      >
        {t("featuredTitle")}
      </h2>
      <article
        className={cn(
          quicksand.className,
          "flex flex-col gap-md rounded-xl border border-hairline bg-surface-card p-md shadow-card md:flex-row md:items-stretch md:gap-lg md:p-lg",
        )}
      >
        <div className="mx-auto w-full max-w-cover-tray shrink-0 md:mx-0">
          <div
            className="relative aspect-cover w-full overflow-hidden rounded-lg shadow-card"
            style={viewTransitionStyle}
          >
            <Image
              src={coverSrc}
              alt={t("coverAlt", { title: book.title })}
              fill
              sizes="(max-width: 768px) 70vw, 20.5rem"
              className="object-cover"
              priority
              unoptimized={remote}
            />
            <Link
              href={detailHref}
              tabIndex={-1}
              aria-hidden
              className="absolute inset-0 z-[1]"
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-sm">
          <h3 className="font-sans text-display-sm font-bold leading-tight text-ink-primary">
            {book.title}
          </h3>
          <dl className="flex flex-wrap gap-x-lg gap-y-xs text-caption">
            <div>
              <dt className="font-bold text-brand-muted">{tDetail("authorLabel")}</dt>
              <dd className="text-body-sm font-medium text-body-color">
                {book.author}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">
                {tDetail("categoryLabel")}
              </dt>
              <dd className="text-body-sm font-medium text-body-color">
                {categoryLabel}
              </dd>
            </div>
          </dl>
          <div className="pt-sm">
            <Button asChild className="rounded-pill font-sans">
              <Link href={detailHref}>{t("featuredCta")}</Link>
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
}
