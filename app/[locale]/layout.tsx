import { DocumentLang } from "@/components/document-lang";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center p-6 text-sm">
          ...
        </div>
      }
    >
      <LocaleIntlShell params={params}>{children}</LocaleIntlShell>
    </Suspense>
  );
}

async function LocaleIntlShell({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLang />
      {children}
    </NextIntlClientProvider>
  );
}
