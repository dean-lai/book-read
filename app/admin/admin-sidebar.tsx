import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/books/new", label: "New book" },
  { href: "/admin/categories", label: "Categories" },
] as const;

export function AdminSidebar() {
  return (
    <aside className="bg-muted/30 w-52 shrink-0 border-r p-4">
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
