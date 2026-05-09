import { requireAdmin } from "@/lib/admin/require-admin";

import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Admin — CMS</h1>
        <p className="text-muted-foreground text-sm">
          Manage books, summaries, and categories
        </p>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
