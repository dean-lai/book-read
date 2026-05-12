"use client";

import {
  ChevronUp,
  FastForward,
  Loader2,
  Pause,
  Play,
  Rewind,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { splitPlainTextIntoSpeechSegments } from "@/features/books/lib/split-summary-segments";
import type { SummaryContentLanguage } from "@/features/books/types/summary-content-language";
import { cn } from "@/lib/utils";

export type BookSummaryListenProps = {
  bookId: string;
  plainTextForSpeech: string;
  resolvedLang: SummaryContentLanguage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CloudStatus = "ready" | "quota_exceeded" | "unavailable";

class TtsQuotaError extends Error {
  constructor() {
    super("tts_quota_exceeded");
    this.name = "TtsQuotaError";
  }
}
class TtsUnavailableError extends Error {
  constructor() {
    super("tts_unavailable");
    this.name = "TtsUnavailableError";
  }
}

export function BookSummaryListen({
  bookId,
  plainTextForSpeech,
  resolvedLang,
  open,
  onOpenChange,
}: BookSummaryListenProps) {
  const t = useTranslations("bookListen");
  const panelId = `book-listen-panel-${bookId}`;

  const segments = useMemo(() => {
    if (resolvedLang !== "en" && resolvedLang !== "vi") {
      return [];
    }
    return splitPlainTextIntoSpeechSegments(plainTextForSpeech, resolvedLang);
  }, [plainTextForSpeech, resolvedLang]);

  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("ready");

  const pausedRef = useRef(true);
  const segmentsRef = useRef(segments);
  const resolvedLangRef = useRef(resolvedLang);
  const segmentIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    segmentIndexRef.current = segmentIndex;
  }, [segmentIndex]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    resolvedLangRef.current = resolvedLang;
  }, [resolvedLang]);

  useEffect(() => {
    const cache = audioCacheRef.current;
    cache.forEach((url) => URL.revokeObjectURL(url));
    cache.clear();
    setSegmentIndex(0);
    setIsLoadingAudio(false);
    setCloudStatus("ready");
  }, [segments]);

  useEffect(() => {
    const cache = audioCacheRef.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const stopPlayback = useCallback(() => {
    pausedRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.onplaying = null;
      audio.pause();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopPlayback();
    }
  }, [open, stopPlayback]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const fetchSegmentAudio = useCallback(
    async (index: number): Promise<string> => {
      const cached = audioCacheRef.current.get(index);
      if (cached) {
        return cached;
      }
      const text = segmentsRef.current[index];
      const lang = resolvedLangRef.current;
      if ((lang !== "en" && lang !== "vi") || !text) {
        throw new TtsUnavailableError();
      }
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (resp.status === 429) {
        throw new TtsQuotaError();
      }
      if (!resp.ok) {
        throw new TtsUnavailableError();
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(index, url);
      return url;
    },
    [],
  );

  const speakFrom = useCallback(
    (startIndex: number) => {
      const list = segmentsRef.current;
      if (startIndex < 0 || startIndex >= list.length) {
        setIsPlaying(false);
        return;
      }

      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const playNext = (i: number) => {
        if (pausedRef.current) {
          return;
        }
        if (i >= list.length) {
          setSegmentIndex(0);
          setIsPlaying(false);
          return;
        }

        setSegmentIndex(i);
        setIsLoadingAudio(true);
        fetchSegmentAudio(i)
          .then((url) => {
            if (pausedRef.current) {
              setIsLoadingAudio(false);
              return;
            }
            audio.src = url;
            audio.onended = () => {
              if (pausedRef.current) {
                return;
              }
              playNext(i + 1);
            };
            audio.onerror = () => {
              setCloudStatus("unavailable");
              setIsPlaying(false);
              setIsLoadingAudio(false);
              pausedRef.current = true;
            };
            audio.onplaying = () => {
              setIsLoadingAudio(false);
            };
            if (i + 1 < list.length) {
              void fetchSegmentAudio(i + 1).catch(() => {
                /* prefetch failure is non-fatal */
              });
            }
            audio.play().catch(() => {
              setIsPlaying(false);
              setIsLoadingAudio(false);
            });
          })
          .catch((err: unknown) => {
            setIsLoadingAudio(false);
            setIsPlaying(false);
            pausedRef.current = true;
            if (err instanceof TtsQuotaError) {
              setCloudStatus("quota_exceeded");
            } else {
              setCloudStatus("unavailable");
            }
          });
      };

      playNext(startIndex);
    },
    [fetchSegmentAudio],
  );

  const isSupportedLang = resolvedLang === "en" || resolvedLang === "vi";
  const hasSegments = segments.length > 0;
  const cloudBlocked = cloudStatus !== "ready";
  const canUseTts = isSupportedLang && hasSegments && !cloudBlocked;

  const onPlayPause = () => {
    if (!canUseTts) {
      return;
    }
    if (isPlaying) {
      stopPlayback();
      return;
    }
    pausedRef.current = false;
    setIsPlaying(true);
    speakFrom(segmentIndexRef.current);
  };

  const onRewind = () => {
    stopPlayback();
    setSegmentIndex((i) => Math.max(0, i - 1));
  };

  const onForward = () => {
    stopPlayback();
    setSegmentIndex((i) =>
      Math.max(0, Math.min(segments.length - 1, i + 1)),
    );
  };

  const onStop = () => {
    stopPlayback();
    setSegmentIndex(0);
  };

  const total = segments.length;
  const part = total > 0 ? Math.min(segmentIndex + 1, total) : 0;
  const progress = total > 0 ? (segmentIndex + 1) / total : 0;

  const statusMessage = !isSupportedLang
    ? t("unsupportedLanguage")
    : !hasSegments
      ? t("noSegments")
      : cloudStatus === "quota_exceeded"
        ? t("quotaExceeded")
        : cloudStatus === "unavailable"
          ? t("cloudUnavailable")
          : null;

  return (
    <>
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
                onClick={() => onOpenChange(false)}
                aria-expanded={true}
              >
                {t("collapse")}
                <ChevronUp className="size-4" aria-hidden />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-md px-md pb-md pt-sm">
            <div className="rounded-lg border border-hairline-strong bg-canvas/40 p-sm">
              {!canUseTts ? (
                <p
                  role={cloudBlocked ? "status" : undefined}
                  aria-live={cloudBlocked ? "polite" : undefined}
                  className={cn(
                    "text-body-sm",
                    cloudBlocked
                      ? "rounded-md border border-amber-300 bg-amber-50 px-sm py-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                      : "text-brand-muted",
                  )}
                >
                  {statusMessage}
                </p>
              ) : (
                <>
                  <p
                    className="text-caption text-brand-muted"
                    aria-live="polite"
                  >
                    {t("segmentProgress", { current: part, total })}
                  </p>
                  <div
                    className="mt-sm h-1 w-full overflow-hidden rounded-full bg-muted"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="mt-sm flex flex-wrap items-center justify-center gap-xs">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      disabled={!canUseTts || segmentIndex <= 0}
                      onClick={onRewind}
                      aria-label={t("rewindAria")}
                    >
                      <Rewind className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="default"
                      className="shrink-0"
                      disabled={!canUseTts}
                      onClick={onPlayPause}
                      aria-label={isPlaying ? t("pauseAria") : t("playAria")}
                    >
                      {isLoadingAudio ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden
                        />
                      ) : isPlaying ? (
                        <Pause className="size-4" aria-hidden />
                      ) : (
                        <Play className="size-4" aria-hidden />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      disabled={!canUseTts || segmentIndex >= total - 1}
                      onClick={onForward}
                      aria-label={t("forwardAria")}
                    >
                      <FastForward className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      disabled={!canUseTts}
                      onClick={onStop}
                      aria-label={t("stopAria")}
                    >
                      <Square className="size-4" aria-hidden />
                    </Button>
                  </div>
                </>
              )}
            </div>
            <audio ref={audioRef} preload="auto" className="hidden" />
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
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-label={open ? t("fabCloseAria") : t("fabOpenAria")}
      >
        {open ? (
          <X className="size-6 shrink-0" aria-hidden />
        ) : (
          <>
            <Volume2 className="size-6 shrink-0" aria-hidden />
            <span className="max-w-[12rem] truncate text-body-sm font-semibold sm:max-w-[14rem]">
              {t("title")}
            </span>
          </>
        )}
      </Button>
    </>
  );
}
