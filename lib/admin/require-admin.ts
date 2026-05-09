import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** `app_metadata.role` set via Supabase Auth Admin API / Dashboard. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/");
  }

  return user;
}
