import { BookCover } from "@/components/book-cover";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "bookCoverShowcase",
  });
  return {
    title: t("metaTitle"),
  };
}

export default async function BookCoverShowcasePage() {
  const t = await getTranslations("bookCoverShowcase");
  const tCommon = await getTranslations("common");

  return (
    <main className="min-h-screen bg-canvas px-5 py-12 font-sans text-ink">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm text-brand-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            {tCommon("home")}
          </Link>
        </p>
        <h1 className="font-display text-3xl font-normal tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-body-color">
          {t.rich("intro", {
            c: (chunks) => (
              <code className="rounded bg-surface-strong px-1.5 py-0.5 text-sm">
                {chunks}
              </code>
            ),
          })}
        </p>

        <section className="mt-10 flex flex-wrap gap-10 gap-y-12">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
              {t("sectionDefaults")}
            </p>
            <BookCover coverSrc="/auth-login/wind-in-the-willows.png" />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
              {t("sectionCustomTitle")}
            </p>
            <BookCover
              coverSrc="/auth-login/les-miserables.png"
              bookName="Les Misérables"
              authorName="Victor Hugo"
              coverAlt="Les Misérables cover"
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
              {t("sectionLongTitle")}
            </p>
            <BookCover
              coverSrc="/auth-login/around-the-world.png"
              bookName="Around the World in Eighty Days"
              authorName="Jules Verne"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
