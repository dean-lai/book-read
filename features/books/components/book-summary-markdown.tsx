import ReactMarkdown from "react-markdown";

import type { SummaryContentLanguage } from "@/features/books/types/summary-content-language";

type BookSummaryMarkdownProps = {
  markdown: string;
  resolvedLang: SummaryContentLanguage;
};

const body = "text-ink-primary dark:text-zinc-300";

export function BookSummaryMarkdown({
  markdown,
  resolvedLang,
}: BookSummaryMarkdownProps) {
  return (
    <article
      lang={resolvedLang === "other" ? undefined : resolvedLang}
      className={`space-y-sm font-georgia text-body-md leading-relaxed ${body} [&_a]:break-words [&_a]:text-primary [&_a]:underline-offset-2 [&_a]:hover:underline`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3
              className={`mb-xs mt-md font-sans text-title-md font-bold first:mt-0 ${body} dark:text-white`}
            >
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4
              className={`mb-xxs mt-md font-sans text-title-sm font-semibold ${body} dark:text-white`}
            >
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5
              className={`mb-xxs mt-sm font-sans text-body-md font-semibold ${body} dark:text-white`}
            >
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="my-xs leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-sm list-disc space-y-xxs ps-md">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-sm list-decimal space-y-xxs ps-md">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink-primary dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-sm border-s-2 border-brand-muted ps-sm italic text-brand-muted">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const block = typeof className === "string" && className.includes("language-");
            if (block) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-muted px-1 py-px font-mono text-body-sm text-ink"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-sm overflow-x-auto rounded-lg bg-muted p-sm font-mono text-body-sm text-ink">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline-offset-4 hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
