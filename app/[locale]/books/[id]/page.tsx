import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Quicksand } from "next/font/google";
import { notFound } from "next/navigation";
import { cache, Suspense, type CSSProperties } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { BookChat } from "@/features/books/components/book-chat";
import { BookDetailHeroAtmosphere } from "@/features/books/components/book-detail-hero-atmosphere";
import { BookDetailTitle } from "@/features/books/components/book-detail-title";
import { HomeBooksSearchProvider } from "@/features/home/components/home-books-search";
import {
  HomeHeader,
  HomeHeaderSkeleton,
} from "@/features/home/components/home-header";
import { resolveBookCoverSrc } from "@/features/home/lib/book-cover-src";
import { EnvVarWarning } from "@/features/shell/components/env-var-warning";
import { Link } from "@/i18n/navigation";
import { hasEnvVars } from "@/lib/utils";
import { getBookByIdWithCategory } from "@/server/books/repositories/books-repository";
import { getHomeFavoritesBootstrap } from "@/server/favorites/services/book-favorites-service";
import { getTranslations } from "next-intl/server";

const idSchema = z.string().uuid();

const loadBookDetail = cache(getBookByIdWithCategory);

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
  display: "swap",
});

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !hasEnvVars) {
    return { title: "Book Read" };
  }
  const book = await loadBookDetail(parsed.data);
  if (!book) {
    return { title: "Book Read" };
  }
  return {
    title: `${book.title} — Book Read`,
    description: book.description?.slice(0, 160) ?? undefined,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  const bookId = parsed.data;
  const t = await getTranslations("bookDetail");

  if (!hasEnvVars) {
    const tHome = await getTranslations("home");
    return (
      <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <Suspense fallback={<HomeHeaderSkeleton />}>
          <HomeHeader />
        </Suspense>
        <main className="mx-auto w-full max-w-content flex-1 px-base py-xl md:px-lg xl:px-xl">
          <p className="text-body-md text-body-color">{tHome("envBanner")}</p>
          <div className="mt-xs">
            <EnvVarWarning />
          </div>
        </main>
      </div>
    );
  }

  const [book, fav] = await Promise.all([
    loadBookDetail(bookId),
    getHomeFavoritesBootstrap(),
  ]);

  if (!book) {
    notFound();
  }

  const coverSrc = resolveBookCoverSrc(book.coverUrl);
  const remote = /^https?:\/\//i.test(coverSrc);
  const categoryLabel =
    book.categoryName?.trim() || t("categoryPlaceholder");

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas font-sans text-ink dark:bg-[#05050c] dark:text-zinc-100">
      <BookDetailHeroAtmosphere />
      <HomeBooksSearchProvider
        initialBooks={[]}
        initialFavoriteBookIds={fav.favoriteBookIds}
        favoritesEnabled
        isLoggedIn={fav.isLoggedIn}
      >
        <div className="relative z-10 flex flex-1 flex-col">
          <Suspense fallback={<HomeHeaderSkeleton appearance="bookDetail" />}>
            <HomeHeader
              appearance="bookDetail"
              leading={
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="-ms-sm gap-xs px-sm font-sans text-body-md text-ink hover:text-ink-primary dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Link href="/">
                    <ChevronLeft className="size-5 shrink-0" aria-hidden />
                    {t("backToLibrary")}
                  </Link>
                </Button>
              }
            />
          </Suspense>
          <main className="mx-auto w-full max-w-content flex-1 px-base py-lg md:px-lg md:py-xl xl:px-xl">
            <div className="flex flex-col gap-xl lg:flex-row lg:items-start lg:gap-2xl">
              <div
                className={`mx-auto flex w-full max-w-cover-tray shrink-0 items-center justify-center rounded-xl border border-transparent bg-surface-cover-tray px-xl py-xl shadow-card md:px-xxl md:py-xxl lg:mx-0 dark:border-white/15 dark:bg-white/5 dark:shadow-[0_12px_48px_rgba(0,0,0,0.45)] dark:backdrop-blur-sm ${quicksand.className}`}
              >
                <div
                  className="relative aspect-cover w-full overflow-hidden rounded-lg shadow-card dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/10"
                  style={
                    {
                      viewTransitionName: `book-cover-${book.id}`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={coverSrc}
                    alt={t("coverAlt", { title: book.title })}
                    fill
                    sizes="(max-width: 1024px) 70vw, 20.5rem"
                    className="object-cover"
                    priority
                    unoptimized={remote}
                  />
                </div>
              </div>

              <div
                className={`min-w-0 flex-1 space-y-md text-ink dark:text-zinc-100 ${quicksand.className}`}
              >
                <BookDetailTitle bookId={book.id}>
                  <h1 className="font-sans text-display-book font-bold leading-tight text-ink-primary dark:text-white">
                    {book.title}
                  </h1>
                </BookDetailTitle>

                <dl className="flex flex-wrap gap-x-lg gap-y-xs text-caption leading-normal md:gap-x-xl">
                  <div className="space-y-xxs">
                    <dt className="font-bold text-brand-muted dark:text-zinc-400">
                      {t("authorLabel")}
                    </dt>
                    <dd className="text-body-sm font-medium text-ink-primary dark:text-zinc-100">
                      {book.author}
                    </dd>
                  </div>
                  <div className="space-y-xxs">
                    <dt className="font-bold text-brand-muted dark:text-zinc-400">
                      {t("categoryLabel")}
                    </dt>
                    <dd className="text-body-sm font-medium text-ink-primary dark:text-zinc-100">
                      {categoryLabel}
                    </dd>
                  </div>
                </dl>

                <div className="max-w-3xl border-t border-hairline pt-md dark:border-white/15">
                  {book.description?.trim() ? (
                    <p className="whitespace-pre-line font-georgia text-title-sm font-medium leading-relaxed text-ink-primary dark:text-zinc-300">
                      {book.description.trim()}
                    </p>
                  ) : (
                    <p className="text-body-md text-brand-muted dark:text-zinc-500">
                      {t("noDescription")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
          <BookChat bookId={book.id} isLoggedIn={fav.isLoggedIn} />
        </div>
      </HomeBooksSearchProvider>
    </div>
  );
}
