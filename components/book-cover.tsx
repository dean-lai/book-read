import Image from "next/image";
import { Quicksand } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
  display: "swap",
});

export type BookCoverProps = {
  /** Absolute URL or path under `/public` (e.g. `/covers/foo.jpg`). */
  coverSrc: string;
  bookName?: string;
  authorName?: string;
  coverAlt?: string;
  className?: string;
  /** When set, the card links to the book detail page. */
  href?: string;
  /**
   * When set with `href`, assigns `view-transition-name` for React / Next view
   * transitions (must match the detail page cover for the same book id).
   */
  viewTransitionBookId?: string;
  /** Rendered inside the cover frame (e.g. favorite control). */
  coverAdornment?: ReactNode;
};

/**
 * Book cover + title stack (nRead Figma card pattern). Tokens: see DESIGN.md and tailwind.config
 * (shadow-card, rounded-lg). Quicksand matches product card typography.
 */
export function BookCover({
  coverSrc,
  bookName = "101 cách cua đổ đại lão hàng xóm",
  authorName = "Đồng Vu",
  coverAlt,
  className,
  href,
  viewTransitionBookId,
  coverAdornment,
}: BookCoverProps) {
  const remote = /^https?:\/\//i.test(coverSrc);

  const coverFrameStyle: CSSProperties | undefined =
    href && viewTransitionBookId
      ? { viewTransitionName: `book-cover-${viewTransitionBookId}` }
      : undefined;

  const titleBlock = (
    <div className="mt-sm flex flex-col gap-xxs leading-normal">
      <h3 className="w-full text-body-md font-bold">{bookName}</h3>
      <p className="w-full text-caption font-medium text-body-color">
        {authorName}
      </p>
    </div>
  );

  return (
    <article
      className={cn(
        quicksand.className,
        "relative mx-auto w-full max-w-[248px] text-ink",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-cover w-full overflow-hidden rounded-lg shadow-card transition-transform transition-shadow duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-card-hover",
          coverAdornment ? "group/cover" : null,
        )}
        style={coverFrameStyle}
      >
        <Image
          src={coverSrc}
          alt={coverAlt ?? bookName}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 248px"
          className="object-cover"
          unoptimized={remote}
        />
        {href ? (
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 z-[1]"
          />
        ) : null}
        {coverAdornment ? (
          <div className="pointer-events-none absolute inset-0 z-[2] [&_*]:pointer-events-auto">
            {coverAdornment}
          </div>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="block rounded-md outline-none ring-offset-2 ring-offset-canvas transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {titleBlock}
        </Link>
      ) : (
        titleBlock
      )}
    </article>
  );
}
