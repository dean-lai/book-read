"use client";

import { RouteErrorShell } from "@/features/shell/components/route-shell";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  return (
    <RouteErrorShell
      error={error}
      reset={reset}
      variant="locale"
      logLabel="Locale route error:"
    />
  );
}
