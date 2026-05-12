import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { HomeHeader, HomeHeaderSkeleton } from "@/features/home/components/home-header";
import { resolveBookCoverSrc } from "@/features/home/lib/book-cover-src";
import { Link } from "@/i18n/navigation";
import { hasEnvVars } from "@/lib/utils";
import { getFavoritesPageCatalog } from "@/server/favorites/services/book-favorites-service";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function FavoritesPage() {
  const [t, tBookDetail] = await Promise.all([
    getTranslations("favorites"),
    getTranslations("bookDetail"),
  ]);

  const headerLeading = (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="-ms-sm gap-xs px-sm font-sans text-body-md text-ink hover:text-ink-primary dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Link href="/">
        <ChevronLeft className="size-5 shrink-0" aria-hidden />
        {tBookDetail("backToLibrary")}
      </Link>
    </Button>
  );

  if (!hasEnvVars) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <Suspense fallback={<HomeHeaderSkeleton />}>
          <HomeHeader leading={headerLeading} />
        </Suspense>
        <main className="mx-auto w-full max-w-content flex-1 px-base py-xl md:px-lg xl:px-xl">
          <h1 className="font-sans text-display-sm font-bold text-ink">
            {t("pageTitle")}
          </h1>
          <p className="mt-sm text-body-md text-brand-muted">{t("envDisabled")}</p>
        </main>
      </div>
    );
  }

  const catalog = await getFavoritesPageCatalog();

  if (catalog.kind === "guest") {
    return (
      <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <Suspense fallback={<HomeHeaderSkeleton />}>
          <HomeHeader leading={headerLeading} />
        </Suspense>
        <main className="mx-auto w-full max-w-content flex-1 px-base py-xl md:px-lg xl:px-xl">
          <h1 className="font-sans text-display-sm font-bold text-ink">
            {t("pageTitle")}
          </h1>
          <p className="mt-sm max-w-md text-body-md text-body-color">
            {t("guestDescription")}
          </p>
          <div className="mt-md flex flex-wrap gap-xs">
            <Button asChild className="rounded-pill font-sans">
              <Link href="/auth/login">{t("signIn")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-pill font-sans">
              <Link href="/auth/sign-up">{t("signUp")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (catalog.kind === "error") {
    return (
      <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <Suspense fallback={<HomeHeaderSkeleton />}>
          <HomeHeader leading={headerLeading} />
        </Suspense>
        <main className="mx-auto w-full max-w-content flex-1 px-base py-xl md:px-lg xl:px-xl">
          <h1 className="font-sans text-display-sm font-bold text-ink">
            {t("pageTitle")}
          </h1>
          <p className="mt-sm text-body-md text-brand-muted">{t("loadError")}</p>
        </main>
      </div>
    );
  }

  const books = catalog.books;

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <Suspense fallback={<HomeHeaderSkeleton />}>
        <HomeHeader leading={headerLeading} />
      </Suspense>
      <main className="mx-auto w-full max-w-content flex-1 px-base py-xl md:px-lg xl:px-xl">
        <h1 className="font-sans text-display-sm font-bold uppercase tracking-tight text-ink/80">
          {t("pageTitle")}
        </h1>
        <p className="mt-xxs text-title-sm font-medium text-body-color">
          {t("pageSubtitle")}
        </p>

        {books.length === 0 ? (
          <p className="mt-md text-body-md text-brand-muted">{t("empty")}</p>
        ) : (
          <ul className="mt-md grid list-none grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-6">
            {books.map((book) => (
              <li key={book.id} className="min-w-0">
                <BookCover
                  href={`/books/${book.id}`}
                  coverSrc={resolveBookCoverSrc(book.coverUrl)}
                  bookName={book.title}
                  authorName={book.author}
                  coverAlt={t("coverAlt", { title: book.title })}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
