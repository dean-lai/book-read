import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Book Read",
  description: "An editorial reading experience",
};

/**
 * EB Garamond — open-source substitute for Waldenburg Light.
 * Waldenburg is licensed; EB Garamond at weight 400 is the closest
 * open-source equivalent (a classical serif with similar editorial presence).
 * Mapped to --font-display CSS variable consumed by tailwind `font-display`.
 */
const ebGaramond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

/**
 * Inter — carries body, navigation, captions, and buttons.
 * Mapped to --font-sans CSS variable consumed by tailwind `font-sans`.
 */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ebGaramond.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
