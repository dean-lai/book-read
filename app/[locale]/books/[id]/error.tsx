"use client";

import { RouteErrorShell } from "@/features/shell/components/route-shell";

type BookDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BookDetailError({ error, reset }: BookDetailErrorProps) {
  return (
    <RouteErrorShell
      error={error}
      reset={reset}
      variant="book"
      logLabel="Book detail route error:"
    />
  );
}
