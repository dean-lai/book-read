import { getTranslations } from "next-intl/server";

import type { RouteShellVariant } from "./types";

type RouteLoadingShellProps = {
  variant: RouteShellVariant;
};

export async function RouteLoadingShell({ variant }: RouteLoadingShellProps) {
  const t = await getTranslations("routeShell.loading");
  const message = t(variant);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-base text-body-sm text-brand-muted md:p-6">
      {message}
    </div>
  );
}
