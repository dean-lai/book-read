"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { BookChat } from "@/features/books/components/book-chat";
import { BookSummaryListen } from "@/features/books/components/book-summary-listen";
import type { SummaryContentLanguage } from "@/features/books/types/summary-content-language";

export type BookDetailFloatingDockProps = {
  bookId: string;
  isLoggedIn: boolean;
  listen:
    | {
        plainTextForSpeech: string;
        resolvedLang: SummaryContentLanguage;
      }
    | null;
};

type Panel = "none" | "chat" | "listen";

export function BookDetailFloatingDock({
  bookId,
  isLoggedIn,
  listen,
}: BookDetailFloatingDockProps) {
  const tListen = useTranslations("bookListen");
  const [panel, setPanel] = useState<Panel>("none");

  const setListenOpen = useCallback((open: boolean) => {
    setPanel(open ? "listen" : "none");
  }, []);

  const setChatOpen = useCallback((open: boolean) => {
    setPanel(open ? "chat" : "none");
  }, []);

  useEffect(() => {
    if (panel === "none") {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel("none");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel]);

  return (
    <>
      {panel !== "none" ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-ink/25 backdrop-blur-[1px]"
          onClick={() => setPanel("none")}
          aria-label={tListen("backdropDismiss")}
        />
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end pb-[max(1rem,env(safe-area-inset-bottom))] pl-4 pr-4 pt-2 sm:pb-6 sm:pl-6 sm:pr-6">
        <div className="pointer-events-auto flex w-full max-w-md flex-col items-end gap-3">
          {listen ? (
            <BookSummaryListen
              bookId={bookId}
              plainTextForSpeech={listen.plainTextForSpeech}
              resolvedLang={listen.resolvedLang}
              open={panel === "listen"}
              onOpenChange={setListenOpen}
            />
          ) : null}
          <BookChat
            bookId={bookId}
            isLoggedIn={isLoggedIn}
            embedded
            open={panel === "chat"}
            onOpenChange={setChatOpen}
          />
        </div>
      </div>
    </>
  );
}
