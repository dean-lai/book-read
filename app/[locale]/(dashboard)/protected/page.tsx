import { FetchDataSteps } from "@/features/marketing/components/tutorial/fetch-data-steps";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { InfoIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;
  if (error || !claims) {
    redirect({ href: "/auth/login", locale: await getLocale() });
  }

  return JSON.stringify(claims, null, 2);
}

export default async function ProtectedPage() {
  const t = await getTranslations("protected");

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          {t("banner")}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">{t("userDetails")}</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">{t("nextSteps")}</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
