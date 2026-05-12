import { Quicksand } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { BookDetailHeroAtmosphere } from "@/features/books/components/book-detail-hero-atmosphere";
import { HomeHeaderSkeleton } from "@/features/home/components/home-header";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
  display: "swap",
});

function pulseBar(className: string) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted dark:bg-white/10 ${className}`}
      aria-hidden
    />
  );
}

export default async function BookDetailLoading() {
  const t = await getTranslations("routeShell.loading");

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas font-sans text-ink dark:bg-[#05050c] dark:text-zinc-100">
      <BookDetailHeroAtmosphere />
      <div className="relative z-10 flex flex-1 flex-col">
        <HomeHeaderSkeleton appearance="bookDetail" />
        <main className="mx-auto w-full max-w-content flex-1 px-base py-lg md:px-lg md:py-xl xl:px-xl">
          <div
            className="flex flex-col gap-xl lg:flex-row lg:items-start lg:gap-2xl"
            role="status"
            aria-busy="true"
            aria-live="polite"
            aria-label={t("book")}
          >
            <div
              className={`mx-auto flex w-full max-w-cover-tray shrink-0 items-center justify-center rounded-xl border border-transparent bg-surface-cover-tray px-xl py-xl shadow-card md:px-xxl md:py-xxl lg:mx-0 dark:border-white/15 dark:bg-white/5 dark:shadow-[0_12px_48px_rgba(0,0,0,0.45)] dark:backdrop-blur-sm ${quicksand.className}`}
            >
              <div className="relative aspect-cover w-full overflow-hidden rounded-lg shadow-card dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/10">
                {pulseBar("absolute inset-0")}
              </div>
            </div>

            <div
              className={`min-w-0 flex-1 space-y-md text-ink dark:text-zinc-100 ${quicksand.className}`}
            >
              <div className="flex items-start gap-sm">
                <div className="min-w-0 flex-1 space-y-sm">
                  {pulseBar("h-9 w-full max-w-xl")}
                  {pulseBar("h-9 w-4/5 max-w-lg")}
                </div>
                <div
                  className="size-10 shrink-0 animate-pulse rounded-full bg-muted dark:bg-white/10"
                  aria-hidden
                />
              </div>

              <dl className="flex flex-wrap gap-x-lg gap-y-xs text-caption leading-normal md:gap-x-xl">
                <div className="space-y-xxs">
                  {pulseBar("h-3 w-14")}
                  {pulseBar("h-4 w-36 md:w-44")}
                </div>
                <div className="space-y-xxs">
                  {pulseBar("h-3 w-20")}
                  {pulseBar("h-4 w-28 md:w-36")}
                </div>
              </dl>

              <div className="max-w-3xl space-y-xs border-t border-hairline pt-md dark:border-white/15">
                {pulseBar("h-4 w-full")}
                {pulseBar("h-4 w-full")}
                {pulseBar("h-4 w-[92%]")}
                {pulseBar("h-4 w-[68%]")}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
