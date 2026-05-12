import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import type { RouteShellVariant } from "./types";

function notFoundHref(variant: RouteShellVariant): "/" | "/admin" {
  return variant === "admin" ? "/admin" : "/";
}

type RouteNotFoundShellProps = {
  variant: RouteShellVariant;
};

export async function RouteNotFoundShell({ variant }: RouteNotFoundShellProps) {
  const t = await getTranslations(`routeShell.notFound.${variant}`);
  const href = notFoundHref(variant);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-content flex-col items-center justify-center gap-3 px-base text-center md:min-h-[60vh] md:px-lg">
      <h1 className="text-title-lg font-semibold text-ink">{t("title")}</h1>
      <p className="text-body-md text-brand-muted">{t("description")}</p>
      <Link
        href={href}
        className="text-body-sm font-medium text-ink-primary underline-offset-4 hover:underline"
      >
        {t("link")}
      </Link>
    </main>
  );
}
