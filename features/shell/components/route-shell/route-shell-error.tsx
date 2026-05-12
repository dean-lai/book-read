"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import type { RouteShellVariant } from "./types";

type RouteErrorShellProps = {
  error: Error & { digest?: string };
  reset: () => void;
  variant: RouteShellVariant;
  logLabel?: string;
};

export function RouteErrorShell({
  error,
  reset,
  variant,
  logLabel,
}: RouteErrorShellProps) {
  const t = useTranslations(`routeShell.error.${variant}`);

  useEffect(() => {
    console.error(logLabel ?? "Route error:", error);
  }, [error, logLabel]);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-content flex-col items-center justify-center gap-3 px-base text-center md:min-h-[60vh] md:px-lg">
      <h1 className="text-title-lg font-semibold text-ink">{t("title")}</h1>
      <p className="text-body-md text-brand-muted">{t("description")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-hairline px-4 py-2 text-body-sm font-medium text-ink hover:bg-surface-hover"
      >
        {t("retry")}
      </button>
    </main>
  );
}
