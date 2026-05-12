import { Suspense } from "react";

import {
  HomeBooksMainSection,
  HomeBooksSearchProvider,
  HomeSearchBar,
} from "@/features/home/components/home-books-search";
import { HomeFavoritesStrip } from "@/features/home/components/home-favorites-strip";
import { HomeFeaturedBookPanel } from "@/features/home/components/home-featured-book";
import { HomeHeroStrip } from "@/features/home/components/home-hero-strip";
import {
  HomeHeader,
  HomeHeaderSkeleton,
} from "@/features/home/components/home-header";
import { EditorialHeroAtmosphere } from "@/features/shell/components/editorial-hero-atmosphere";
import { EnvVarWarning } from "@/features/shell/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import {
  listBooksWithCategory,
  type BookRowWithCategory,
} from "@/server/books/repositories/books-repository";
import {
  getHomeFavoriteBooksPreview,
  getHomeFavoritesBootstrap,
} from "@/server/favorites/services/book-favorites-service";
import { getTranslations } from "next-intl/server";

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const tHome = await getTranslations("home");
  const sp = await searchParams;
  const rawQ = sp.q;
  const initialSearchQuery =
    typeof rawQ === "string" ? rawQ : Array.isArray(rawQ) ? rawQ[0] ?? "" : "";

  const books = hasEnvVars ? await listBooksWithCategory() : [];

  let initialFavoriteBookIds: string[] = [];
  let initialFavoritePreviewBooks: BookRowWithCategory[] = [];
  let isLoggedIn = false;
  if (hasEnvVars) {
    const fav = await getHomeFavoritesBootstrap();
    isLoggedIn = fav.isLoggedIn;
    initialFavoriteBookIds = fav.favoriteBookIds;
    initialFavoritePreviewBooks = await getHomeFavoriteBooksPreview();
  }

  const featuredBook =
    hasEnvVars && books.length > 0 ? (books[0] ?? null) : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans text-ink">
      <EditorialHeroAtmosphere variant="fullPage" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeBooksSearchProvider
          initialBooks={books}
          initialFavoriteBookIds={initialFavoriteBookIds}
          initialFavoritePreviewBooks={initialFavoritePreviewBooks}
          initialFeaturedBook={featuredBook}
          initialSearchQuery={initialSearchQuery}
          favoritesEnabled={Boolean(hasEnvVars)}
          isLoggedIn={isLoggedIn}
        >
          <Suspense fallback={<HomeHeaderSkeleton />}>
            <HomeHeader leading={<HomeSearchBar />} />
          </Suspense>
          {!hasEnvVars ? (
            <div className="border-b border-hairline bg-surface-strong px-base py-sm md:px-lg">
              <p className="mx-auto max-w-content text-body-sm text-body-color">
                {tHome("envBanner")}
              </p>
              <div className="mx-auto mt-xs flex max-w-content">
                <EnvVarWarning />
              </div>
            </div>
          ) : null}
          <HomeHeroStrip
            heroTitle={tHome("heroTitle")}
            heroTagline={tHome("heroTagline")}
          />
          <main className="flex-1">
            <HomeFeaturedBookPanel />
            <HomeFavoritesStrip />
            <HomeBooksMainSection />
          </main>
        </HomeBooksSearchProvider>
      </div>
    </div>
  );
}
