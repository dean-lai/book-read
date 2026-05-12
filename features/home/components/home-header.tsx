import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/features/shell/components/theme-switcher";
import { cn } from "@/lib/utils";

/** `bookDetail` — light bar in light mode, glass bar in dark mode (book detail hero). */
export type HomeHeaderAppearance = "default" | "bookDetail";

type HomeHeaderSkeletonProps = {
  appearance?: HomeHeaderAppearance;
};

export function HomeHeaderSkeleton({
  appearance = "default",
}: HomeHeaderSkeletonProps) {
  const book = appearance === "bookDetail";
  return (
    <header
      className={cn(
        "border-b border-hairline bg-surface-card",
        book &&
          "dark:border-white/15 dark:bg-black/30 dark:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-black/25",
      )}
    >
      <div className="mx-auto flex h-nav w-full max-w-content items-center px-base md:px-lg xl:px-xl">
        <div
          className={cn(
            "h-9 flex-1 max-w-md animate-pulse rounded-md bg-muted",
            book && "dark:bg-white/10",
          )}
        />
      </div>
    </header>
  );
}

type HomeHeaderProps = {
  /** Left side of the nav row (e.g. search on home, back link on book detail). */
  leading?: ReactNode;
  /** Book detail: default surface in light mode, glass on holographic in dark mode. */
  appearance?: HomeHeaderAppearance;
};

export async function HomeHeader({
  leading,
  appearance = "default",
}: HomeHeaderProps) {
  const t = await getTranslations("home");
  const tFavorites = await getTranslations("favorites");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const email =
    typeof claims === "object" && claims && "email" in claims
      ? String((claims as { email?: string }).email ?? "")
      : "";

  const displayName = email.includes("@")
    ? email.slice(0, email.indexOf("@"))
    : email || t("guest");

  const book = appearance === "bookDetail";

  return (
    <header
      className={cn(
        "border-b border-hairline bg-surface-card",
        book &&
          "dark:border-white/15 dark:bg-black/30 dark:text-white dark:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-black/25",
      )}
    >
      <div className="mx-auto flex h-nav w-full max-w-content items-center justify-between gap-base px-base md:px-lg xl:px-xl">
        {leading ? (
          <div className="flex min-w-0 flex-1 justify-start">{leading}</div>
        ) : null}
        <div
          className={cn(
            "flex shrink-0 items-center gap-lg",
            book &&
              "[&_button]:text-ink [&_button]:dark:text-white [&_svg]:text-ink [&_svg]:dark:text-white/90 [&_.text-muted-foreground]:text-muted-foreground [&_.text-muted-foreground]:dark:text-white/70",
          )}
        >
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "shrink-0 text-ink",
              book &&
                "dark:text-white dark:hover:bg-white/10 dark:hover:text-white",
            )}
            aria-label={tFavorites("navAria")}
          >
            <Link href="/favorites" title={tFavorites("navLink")}>
              <Heart className="size-5" />
            </Link>
          </Button>
          <LocaleSwitcher
            triggerClassName={cn(
              "h-10 px-sm",
              book &&
                "dark:text-white dark:hover:bg-white/10 dark:hover:text-white",
            )}
          />
          {email ? (
            <div className="flex items-center gap-sm">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-sans text-caption font-semibold uppercase text-muted-foreground",
                  book && "dark:bg-white/15 dark:text-white",
                )}
                aria-hidden
              >
                {displayName.slice(0, 1)}
              </div>
              <span
                className={cn(
                  "max-w-[140px] truncate font-sans text-body-sm font-medium text-ink max-sm:hidden",
                  book && "dark:text-white",
                )}
              >
                {displayName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-xs">
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-pill font-sans",
                  book &&
                    "dark:border-white/40 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                <Link href="/auth/login">{t("signIn")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className={cn(
                  "rounded-pill font-sans",
                  book &&
                    "dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90 dark:hover:text-zinc-900",
                )}
              >
                <Link href="/auth/sign-up">{t("signUp")}</Link>
              </Button>
            </div>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
