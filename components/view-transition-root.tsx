"use client";

import type { ReactNode } from "react";
import { ViewTransition } from "react";

type ViewTransitionRootProps = {
  children: ReactNode;
};

/**
 * Enables React + Next.js view transitions for client navigations when
 * `experimental.viewTransition` is set in next.config.
 */
export function ViewTransitionRoot({ children }: ViewTransitionRootProps) {
  return <ViewTransition>{children}</ViewTransition>;
}
