import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

function supabaseStorageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const host = new URL(raw).hostname;
    return [
      {
        protocol: "https",
        hostname: host,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  // pdf-parse → pdfjs-dist loads pdf.worker.mjs from package paths; bundling breaks that resolution.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  images: {
    remotePatterns: supabaseStorageRemotePatterns(),
  },
};

export default withNextIntl(nextConfig);
