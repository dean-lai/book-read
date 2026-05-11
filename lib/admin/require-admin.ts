import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

/** `app_metadata.role` set via Supabase Auth Admin API / Dashboard. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect({ href: "/auth/login", locale: await getLocale() });
  }

  const user = authUser!;

  if (user.app_metadata?.role !== "admin") {
    redirect({ href: "/", locale: await getLocale() });
  }

  return user;
}
