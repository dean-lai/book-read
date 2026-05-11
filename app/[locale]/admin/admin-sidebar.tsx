import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const hrefs = [
  "/admin",
  "/admin/books",
  "/admin/books/new",
  "/admin/categories",
] as const;

const keys = [
  "sidebarDashboard",
  "sidebarBooks",
  "sidebarNewBook",
  "sidebarCategories",
] as const;

export async function AdminSidebar() {
  const t = await getTranslations("admin");

  return (
    <aside className="w-52 shrink-0 border-r border-hairline bg-surface-strong p-base">
      <nav className="flex flex-col gap-xxs">
        {hrefs.map((href, i) => (
          <Link
            key={href}
            href={href}
            className="rounded-md px-sm py-xs font-sans text-nav-link font-medium text-ink transition-colors hover:bg-hairline-soft"
          >
            {t(keys[i])}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
