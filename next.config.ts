import type { NextConfig } from "next";

/* Static export for GitHub Pages (custom domain wisbox.jp). Each page becomes an .html file in out/. */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  typedRoutes: true,
};

export default nextConfig;
