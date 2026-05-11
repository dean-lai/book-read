import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const t = await getTranslations("authButton");

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const email =
    typeof user === "object" && user && "email" in user
      ? String((user as { email?: string }).email ?? "")
      : "";

  return user ? (
    <div className="flex items-center gap-4">
      {t("greeting", { email })}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{t("signIn")}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{t("signUp")}</Link>
      </Button>
    </div>
  );
}
