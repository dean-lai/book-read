import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    const locale = await getLocale();
    if (!error) {
      redirect({ href: next, locale });
    } else {
      redirect({
        href: `/auth/error?error=${encodeURIComponent(error.message)}`,
        locale,
      });
    }
  }

  redirect({
    href: "/auth/error?error=No token hash or type",
    locale: await getLocale(),
  });
}
