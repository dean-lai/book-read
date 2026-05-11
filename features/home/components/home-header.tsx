import { Bell, Heart } from "lucide-react";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export function HomeHeaderSkeleton() {
  return (
    <header className="border-b border-hairline bg-surface-card">
      <div className="mx-auto flex h-nav w-full max-w-content items-center px-base md:px-lg xl:px-xl">
        <div className="bg-muted h-9 flex-1 max-w-md animate-pulse rounded-md" />
      </div>
    </header>
  );
}

type HomeHeaderProps = {
  searchBar?: ReactNode;
};

export async function HomeHeader({ searchBar }: HomeHeaderProps) {
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

  return (
    <header className="border-b border-hairline bg-surface-card">
      <div className="mx-auto flex h-nav w-full max-w-content items-center justify-between gap-base px-base md:px-lg xl:px-xl">
        {searchBar ? (
          <div className="flex min-w-0 flex-1 justify-start">{searchBar}</div>
        ) : null}
        <div className="flex shrink-0 items-center gap-lg">
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-ink"
            aria-label={tFavorites("navAria")}
          >
            <Link href="/favorites" title={tFavorites("navLink")}>
              <Heart className="size-5" />
            </Link>
          </Button>
          <LocaleSwitcher
            buttonLabel={t("language")}
            triggerClassName={cn(
              "h-10 rounded-pill border-0 bg-home-cta px-md text-on-primary shadow-none hover:bg-home-cta/90 hover:text-on-primary",
            )}
          />
          {email ? (
            <div className="flex items-center gap-sm">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-sans text-caption font-semibold uppercase text-muted-foreground"
                aria-hidden
              >
                {displayName.slice(0, 1)}
              </div>
              <span className="max-w-[140px] truncate font-sans text-title-sm font-bold text-ink max-sm:hidden">
                {displayName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-xs">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-pill font-sans"
              >
                <Link href="/auth/login">{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-pill font-sans">
                <Link href="/auth/sign-up">{t("signUp")}</Link>
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-ink"
            aria-label={t("notificationsAria")}
            disabled
          >
            <Bell className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
