import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // pdf-parse → pdfjs-dist loads pdf.worker.mjs from package paths; bundling breaks that resolution.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
};

export default nextConfig;
