import { LocaleSwitcher } from "@/components/locale-switcher";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AdminSidebar } from "./admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="text-brand-muted flex min-h-screen items-center justify-center p-base text-body-sm">
          Loading admin…
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}

async function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const t = await getTranslations("admin");

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="flex items-start justify-between gap-base border-b border-hairline bg-surface-card px-base py-md md:px-lg">
        <div>
          <h1 className="font-sans text-title-md font-semibold tracking-tight text-ink">
            {t("layoutTitle")}
          </h1>
          <p className="text-body-sm text-brand-muted">{t("layoutSubtitle")}</p>
        </div>
        <LocaleSwitcher />
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 overflow-auto p-base md:p-lg">{children}</div>
      </div>
    </div>
  );
}
