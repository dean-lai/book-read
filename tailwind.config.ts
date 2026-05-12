import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Colors ──────────────────────────────────────────────────────────────
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ── Brand tokens (ElevenLabs-style editorial) ──────────────────────────
        // All reference CSS variables defined in globals.css :root / .dark
        // so they respond correctly to theme switching.

        // Primary / Ink
        ink: {
          DEFAULT: "var(--color-ink)",
          primary: "var(--color-primary)",
          "primary-active": "var(--color-primary-active)",
        },

        // Text hierarchy
        "body-color": {
          DEFAULT: "var(--color-body)",
          strong: "var(--color-body-strong)",
        },
        brand: {
          muted: "var(--color-muted)",
          "muted-soft": "var(--color-muted-soft)",
        },

        // Hairlines / dividers
        hairline: {
          DEFAULT: "var(--color-hairline)",
          soft: "var(--color-hairline-soft)",
          strong: "var(--color-hairline-strong)",
        },

        // Canvas / page surfaces
        canvas: {
          DEFAULT: "var(--color-canvas)",
          soft: "var(--color-canvas-soft)",
          deep: "var(--color-canvas-deep)",
        },

        // Elevated surfaces
        surface: {
          card: "var(--color-surface-card)",
          strong: "var(--color-surface-strong)",
          /** nRead book detail — cover panel behind jacket (Figma). */
          "cover-tray": "var(--color-surface-cover-tray)",
          dark: "var(--color-surface-dark)",
          "dark-elevated": "var(--color-surface-dark-elevated)",
        },

        // On-color text
        "on-primary": "var(--color-on-primary)",
        "on-dark": {
          DEFAULT: "var(--color-on-dark)",
          soft: "var(--color-on-dark-soft)",
        },

        // Atmospheric gradient orbs (decoration only — never fills or text)
        gradient: {
          mint: "#a7e5d3",
          peach: "#f4c5a8",
          lavender: "#c8b8e0",
          sky: "#a8c8e8",
          rose: "#e8b8c4",
        },

        // nRead home — language pill (Figma)
        home: {
          cta: "#009fff",
        },

        // Semantic states
        semantic: {
          error: "#dc2626",
          success: "#16a34a",
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        // Waldenburg substitute: EB Garamond (open-source) via CSS variable set in layout.tsx
        display: ["var(--font-display)", "'Times New Roman'", "serif"],
        // Inter — body, nav, captions, buttons
        sans: ["var(--font-sans)", "sans-serif"],
      },

      fontSize: {
        // Display scale — Waldenburg Light (300) editorial signature
        "display-mega": [
          "64px",
          { lineHeight: "1.05", letterSpacing: "-1.92px" },
        ],
        "display-xl": [
          "48px",
          { lineHeight: "1.08", letterSpacing: "-0.96px" },
        ],
        "display-lg": [
          "36px",
          { lineHeight: "1.17", letterSpacing: "-0.36px" },
        ],
        "display-md": [
          "32px",
          { lineHeight: "1.13", letterSpacing: "-0.32px" },
        ],
        /** Quicksand book title on detail (nRead Figma ~40px). */
        "display-book": [
          "40px",
          { lineHeight: "1.2", letterSpacing: "-0.4px" },
        ],
        "display-sm": ["24px", { lineHeight: "1.2", letterSpacing: "0" }],

        // Title scale — Inter Medium (500)
        "title-md": ["20px", { lineHeight: "1.35", letterSpacing: "0" }],
        "title-sm": ["18px", { lineHeight: "1.44", letterSpacing: "0.18px" }],

        // Body scale — Inter Regular (400)
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0.16px" }],
        "body-strong-size": [
          "16px",
          { lineHeight: "1.5", letterSpacing: "0.16px" },
        ],
        "body-sm": ["15px", { lineHeight: "1.47", letterSpacing: "0.15px" }],

        // Utility
        caption: ["14px", { lineHeight: "1.5", letterSpacing: "0" }],
        "caption-upper": [
          "12px",
          { lineHeight: "1.4", letterSpacing: "0.96px" },
        ],
        "btn": ["15px", { lineHeight: "1.0", letterSpacing: "0" }],
        "nav-link": ["15px", { lineHeight: "1.4", letterSpacing: "0" }],
      },

      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
      },

      // ─── Spacing ─────────────────────────────────────────────────────────────
      // Base unit: 4px. Tokens sit alongside Tailwind's defaults.
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        base: "16px",
        md: "20px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },

      // ─── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        none: "0px",
        xs: "4px",   // inline tags
        sm: "6px",   // compact rows
        md: "8px",   // form inputs
        lg: "var(--radius)", // 12px — compact cards; shadcn compat via CSS var
        xl: "16px",  // feature cards, pricing tiers
        xxl: "24px", // gradient orb cards
        pill: "9999px", // all CTAs and badges
        full: "9999px", // voice icons, avatars
      },

      // ─── Shadows ─────────────────────────────────────────────────────────────
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "card-strong": "var(--shadow-card-strong)",
        float: "var(--shadow-float)",
      },

      // ─── Max Width ────────────────────────────────────────────────────────────
      maxWidth: {
        content: "1200px",
        /** Book detail cover column (nRead). */
        "cover-tray": "20.5rem",
      },

      aspectRatio: {
        /** Standard jacket proportion used by BookCover / detail. */
        cover: "248 / 363",
      },

      // ─── Height ───────────────────────────────────────────────────────────────
      height: {
        nav: "64px",
        "btn-default": "40px",
        "input-default": "44px",
        "voice-icon": "32px",
      },

      // ─── Width ────────────────────────────────────────────────────────────────
      width: {
        "voice-icon": "32px",
      },

      // ─── Background Image (gradient orb helpers) ──────────────────────────────
      backgroundImage: {
        "orb-mint":
          "radial-gradient(ellipse 60% 60% at 50% 50%, #a7e5d3 0%, transparent 70%)",
        "orb-peach":
          "radial-gradient(ellipse 60% 60% at 50% 50%, #f4c5a8 0%, transparent 70%)",
        "orb-lavender":
          "radial-gradient(ellipse 60% 60% at 50% 50%, #c8b8e0 0%, transparent 70%)",
        "orb-sky":
          "radial-gradient(ellipse 60% 60% at 50% 50%, #a8c8e8 0%, transparent 70%)",
        "orb-rose":
          "radial-gradient(ellipse 60% 60% at 50% 50%, #e8b8c4 0%, transparent 70%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
