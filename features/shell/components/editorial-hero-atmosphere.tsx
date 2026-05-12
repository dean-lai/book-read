import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/** Editorial light canvas — soft pastel mesh (readable in light theme). */
const LIGHT_HERO_MESH: CSSProperties = {
  backgroundColor: "#f5f5f5",
  backgroundImage: [
    "radial-gradient(ellipse 100% 88% at 0% 100%, rgba(167, 139, 250, 0.28), transparent 58%)",
    "radial-gradient(ellipse 92% 82% at 100% 0%, rgba(244, 197, 168, 0.35), transparent 54%)",
    "radial-gradient(ellipse 70% 65% at 72% 58%, rgba(168, 200, 232, 0.22), transparent 50%)",
    "radial-gradient(ellipse 55% 50% at 14% 14%, rgba(167, 229, 211, 0.18), transparent 44%)",
    "linear-gradient(168deg, #fafafa 0%, #f5f5f5 45%, #f0f4f8 100%)",
  ].join(", "),
};

/** Dark “holographic” mesh (cyan / violet / magenta on deep navy) — dark theme only. */
const DARK_HOLOGRAPHIC_MESH: CSSProperties = {
  backgroundColor: "#05050c",
  backgroundImage: [
    "radial-gradient(ellipse 100% 88% at 0% 100%, rgba(34, 211, 238, 0.38), transparent 56%)",
    "radial-gradient(ellipse 92% 80% at 100% 0%, rgba(139, 92, 246, 0.42), transparent 54%)",
    "radial-gradient(ellipse 72% 68% at 78% 62%, rgba(244, 114, 182, 0.2), transparent 50%)",
    "radial-gradient(ellipse 58% 52% at 12% 16%, rgba(45, 212, 191, 0.16), transparent 44%)",
    "radial-gradient(ellipse 50% 45% at 50% 0%, rgba(99, 102, 241, 0.12), transparent 40%)",
    "linear-gradient(168deg, #020208 0%, #0c0820 40%, #051018 78%, #03030a 100%)",
  ].join(", "),
};

export type EditorialHeroAtmosphereVariant =
  | "immersive"
  | "strip"
  /** Full scroll height behind the home shell (no bottom fade into canvas). */
  | "fullPage";

type EditorialHeroAtmosphereProps = {
  variant: EditorialHeroAtmosphereVariant;
};

/**
 * Shared editorial mesh (light pastels / dark holographic) used on book detail,
 * the home page, and compact strips.
 */
export function EditorialHeroAtmosphere({
  variant,
}: EditorialHeroAtmosphereProps) {
  const strip = variant === "strip";
  const fullPage = variant === "fullPage";
  const largeOrbs = strip === false;

  return (
    <div
      className={cn(
        "pointer-events-none select-none overflow-hidden",
        strip ? "absolute inset-0" : "absolute inset-0 min-h-full w-full",
      )}
      aria-hidden
    >
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0" style={LIGHT_HERO_MESH} />
        <div
          className={cn(
            "absolute rounded-full opacity-40 blur-3xl",
            largeOrbs
              ? "-left-[18%] top-[-25%] h-[65vmin] w-[85vmin]"
              : "-left-[14%] top-[-18%] h-[38vmin] w-[52vmin]",
          )}
          style={{
            background:
              "conic-gradient(from 200deg at 50% 50%, rgba(200,184,224,0.35), rgba(167,229,211,0.25), rgba(168,200,232,0.3), rgba(200,184,224,0.35))",
          }}
        />
        {!fullPage ? (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas to-transparent",
              strip ? "h-16" : "h-24",
            )}
          />
        ) : null}
      </div>

      <div className="absolute inset-0 hidden dark:block">
        <div className="absolute inset-0" style={DARK_HOLOGRAPHIC_MESH} />
        <div
          className={cn(
            "absolute rounded-full opacity-50 blur-3xl",
            largeOrbs
              ? "-left-[20%] top-[-30%] h-[70vmin] w-[90vmin]"
              : "-left-[14%] top-[-22%] h-[42vmin] w-[56vmin]",
          )}
          style={{
            background:
              "conic-gradient(from 210deg at 50% 50%, rgba(34,211,238,0.25), rgba(167,139,250,0.2), rgba(244,114,182,0.18), rgba(34,211,238,0.22))",
          }}
        />
        <div
          className={cn(
            "absolute rounded-full opacity-35 blur-3xl",
            largeOrbs
              ? "-right-[25%] bottom-[10%] h-[55vmin] w-[70vmin]"
              : "-right-[18%] bottom-[6%] h-[34vmin] w-[44vmin]",
          )}
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, rgba(139,92,246,0.22), rgba(52,211,153,0.14), rgba(56,189,248,0.2), rgba(139,92,246,0.2))",
          }}
        />
        {!fullPage ? (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas to-transparent dark:from-canvas",
              strip ? "h-16" : "h-24",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
