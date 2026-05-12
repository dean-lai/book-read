"use client";

import { ChevronUp, Loader2, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const THREAD_STORAGE_PREFIX = "book-read:chat-thread:";
const SEND_DEBOUNCE_MS = 500;

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ApiMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

function getOrCreateThreadId(bookId: string): string {
  const key = `${THREAD_STORAGE_PREFIX}${bookId}`;
  let id = window.localStorage.getItem(key);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export type BookChatProps = {
  bookId: string;
  isLoggedIn: boolean;
  /** Parent supplies backdrop + fixed shell (e.g. book detail dock). */
  embedded?: boolean;
  /** Controlled open state (requires `onOpenChange` when set). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BookChat({
  bookId,
  isLoggedIn,
  embedded = false,
  open: openControlled,
  onOpenChange,
}: BookChatProps) {
  const t = useTranslations("bookChat");
  const locale = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled =
    typeof openControlled === "boolean" && typeof onOpenChange === "function";
  const open = controlled ? openControlled : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled) {
        onOpenChange!(next);
      } else {
        setInternalOpen(next);
      }
    },
    [controlled, onOpenChange],
  );
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const [questionsLimit, setQuestionsLimit] = useState(15);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSendAt = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open || !isLoggedIn) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, isLoggedIn]);

  useEffect(() => {
    if (!open || !isLoggedIn) {
      return;
    }
    const threadId = getOrCreateThreadId(bookId);
    let cancelled = false;
    setLoadError(null);

    void (async () => {
      try {
        const res = await fetch(
          `/api/books/${bookId}/chat?threadId=${encodeURIComponent(threadId)}`,
          { method: "GET", credentials: "same-origin" },
        );
        if (!res.ok) {
          throw new Error(`load_${res.status}`);
        }
        const data = (await res.json()) as {
          messages: ApiMessage[];
          questionsUsedToday: number;
          questionsLimit: number;
        };
        if (cancelled) return;
        const ui: UiMessage[] = data.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: m.id,
            role: m.role as UiMessage["role"],
            content: m.content,
          }));
        setMessages(ui);
        setQuestionsUsedToday(data.questionsUsedToday);
        setQuestionsLimit(data.questionsLimit);
      } catch {
        if (!cancelled) {
          setLoadError(t("loadError"));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, isLoggedIn, bookId, t]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !isLoggedIn || isPending) {
      return;
    }
    const now = Date.now();
    if (now - lastSendAt.current < SEND_DEBOUNCE_MS) {
      return;
    }
    lastSendAt.current = now;

    const threadId = getOrCreateThreadId(bookId);
    const tempUserId = `local-${crypto.randomUUID()}`;
    setSendError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: "user", content: trimmed },
    ]);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/chat`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, threadId }),
        });
        const data = (await res.json()) as {
          error?: string;
          reply?: string;
          fromCache?: boolean;
          questionsUsedToday?: number;
          questionsLimit?: number;
        };

        if (res.status === 429) {
          setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
          setInput(trimmed);
          setSendError(t("rateLimit"));
          if (typeof data.questionsUsedToday === "number") {
            setQuestionsUsedToday(data.questionsUsedToday);
          }
          return;
        }

        if (!res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
          setInput(trimmed);
          setSendError(
            data.error === "rag_failed" ? t("ragError") : t("sendError"),
          );
          return;
        }

        if (data.reply) {
          setMessages((prev) => {
            const withoutTemp = prev.filter((m) => m.id !== tempUserId);
            return [
              ...withoutTemp,
              { id: tempUserId, role: "user", content: trimmed },
              {
                id: `local-a-${crypto.randomUUID()}`,
                role: "assistant",
                content: data.reply!,
              },
            ];
          });
        }

        if (typeof data.questionsUsedToday === "number") {
          setQuestionsUsedToday(data.questionsUsedToday);
        }
        if (typeof data.questionsLimit === "number") {
          setQuestionsLimit(data.questionsLimit);
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
        setInput(trimmed);
        setSendError(t("sendError"));
      }
    });
  };

  const loginHref = `/${locale}/auth/login`;

  const panelId = `book-chat-panel-${bookId}`;

  return (
    <>
      {!embedded && open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-ink/25 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-label={t("backdropDismiss")}
        />
      ) : null}

      <div
        className={cn(
          embedded
            ? "flex w-full flex-col items-end gap-3"
            : cn(
                "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end",
                "pb-[max(1rem,env(safe-area-inset-bottom))] pl-4 pr-4 pt-2 sm:pb-6 sm:pl-6 sm:pr-6",
              ),
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex w-full flex-col items-end gap-3",
            !embedded && "max-w-md",
          )}
        >
          {open ? (
            <Card
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${panelId}-title`}
              className="flex max-h-[min(72dvh,32rem)] w-full min-w-0 flex-col overflow-hidden border border-hairline-strong bg-float-dock-panel shadow-float"
            >
              <CardHeader className="shrink-0 space-y-0 border-b border-hairline-strong p-md pb-sm">
                <div className="flex items-start justify-between gap-sm">
                  <CardTitle
                    id={`${panelId}-title`}
                    className="text-title-sm font-bold text-ink"
                  >
                    {t("title")}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-xs text-body-sm"
                    onClick={() => setOpen(false)}
                    aria-expanded={true}
                  >
                    {t("collapse")}
                    <ChevronUp className="size-4" aria-hidden />
                  </Button>
                </div>
                {isLoggedIn ? (
                  <p className="mt-xs text-caption text-brand-muted">
                    {t("quota", {
                      used: questionsUsedToday,
                      limit: questionsLimit,
                    })}
                  </p>
                ) : null}
              </CardHeader>

              <CardContent className="flex min-h-0 flex-1 flex-col gap-md overflow-hidden px-md pb-md pt-sm">
                {!isLoggedIn ? (
                  <div className="flex flex-col items-start gap-sm rounded-lg border border-dashed border-hairline bg-surface-cover-tray/50 p-md">
                    <MessageCircle
                      className="size-5 text-brand-muted"
                      aria-hidden
                    />
                    <p className="text-body-sm text-body-color">
                      {t("loginPrompt")}
                    </p>
                    <Button asChild size="sm" variant="default">
                      <Link href={loginHref}>{t("signIn")}</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {loadError ? (
                      <p className="text-body-sm text-destructive">
                        {loadError}
                      </p>
                    ) : null}
                    {sendError ? (
                      <p className="text-body-sm text-destructive">
                        {sendError}
                      </p>
                    ) : null}

                    <div
                      className="min-h-0 flex-1 space-y-sm overflow-y-auto rounded-lg border border-hairline-strong bg-canvas/40 p-sm"
                      role="log"
                      aria-live="polite"
                    >
                      {messages.length === 0 && !loadError ? (
                        <p className="text-body-sm text-brand-muted">
                          {t("empty")}
                        </p>
                      ) : null}
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "flex",
                            m.role === "user"
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-lg px-sm py-xs text-body-sm leading-relaxed",
                              m.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isPending ? (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-xs rounded-lg bg-muted px-sm py-xs text-body-sm text-brand-muted">
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden
                            />
                            {t("thinking")}
                          </div>
                        </div>
                      ) : null}
                      <div ref={bottomRef} />
                    </div>

                    <div className="flex shrink-0 flex-col gap-sm sm:flex-row sm:items-end">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("placeholder")}
                        rows={2}
                        disabled={isPending}
                        className="min-h-14 flex-1 resize-none border-hairline-strong text-ink"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={sendMessage}
                        disabled={isPending || !input.trim()}
                        className="shrink-0 sm:self-stretch"
                      >
                        {isPending ? (
                          <Loader2
                            className="size-4 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          t("send")
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Button
            type="button"
            size="lg"
            variant="default"
            className={cn(
              "h-14 gap-sm rounded-full px-5 shadow-float",
              "sm:min-w-[3.5rem]",
            )}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-haspopup="dialog"
            aria-label={open ? t("fabCloseAria") : t("fabOpenAria")}
          >
            {open ? (
              <X className="size-6 shrink-0" aria-hidden />
            ) : (
              <>
                <MessageCircle className="size-6 shrink-0" aria-hidden />
                <span className="max-w-[12rem] truncate text-body-sm font-semibold sm:max-w-[14rem]">
                  {t("title")}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
