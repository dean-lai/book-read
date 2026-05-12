"use client";

import { RouteErrorShell } from "@/features/shell/components/route-shell";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <RouteErrorShell
      error={error}
      reset={reset}
      variant="admin"
      logLabel="Admin route error:"
    />
  );
}
