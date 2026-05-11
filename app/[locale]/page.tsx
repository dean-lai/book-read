import { Suspense } from "react";

import {
  HomeBooksMainSection,
  HomeBooksSearchProvider,
  HomeSearchBar,
} from "@/features/home/components/home-books-search";
import {
  HomeHeader,
  HomeHeaderSkeleton,
} from "@/features/home/components/home-header";
import { EnvVarWarning } from "@/features/marketing/components/env-var-warning";
import { ThemeSwitcher } from "@/features/shell/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { listBooksWithCategory } from "@/server/books/repositories/books-repository";
import { getHomeFavoritesBootstrap } from "@/server/favorites/services/book-favorites-service";
import { getTranslations } from "next-intl/server";

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const tFooter = await getTranslations("footer");
  const tHome = await getTranslations("home");
  const sp = await searchParams;
  const rawQ = sp.q;
  const initialSearchQuery =
    typeof rawQ === "string" ? rawQ : Array.isArray(rawQ) ? rawQ[0] ?? "" : "";

  const books = hasEnvVars ? await listBooksWithCategory() : [];

  let initialFavoriteBookIds: string[] = [];
  let isLoggedIn = false;
  if (hasEnvVars) {
    const fav = await getHomeFavoritesBootstrap();
    isLoggedIn = fav.isLoggedIn;
    initialFavoriteBookIds = fav.favoriteBookIds;
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <HomeBooksSearchProvider
        initialBooks={books}
        initialFavoriteBookIds={initialFavoriteBookIds}
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
        <main className="flex-1">
          <HomeBooksMainSection />
        </main>
      </HomeBooksSearchProvider>
      <footer className="border-t border-hairline bg-surface-card py-lg">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-md px-base text-caption text-brand-muted">
          <p>
            {tFooter.rich("poweredBy", {
              s: (chunks) => (
                <a
                  href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                  target="_blank"
                  className="font-medium text-ink-primary underline-offset-4 hover:underline"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  );
}
