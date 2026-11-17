import type { NextConfig } from "next";

/* Static export for GitHub Pages (custom domain wisbox.jp). trailingSlash writes each page as <page>/index.html,
 * so both /business and /business/ open (GitHub Pages redirects the first to the second). */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  typedRoutes: true,
};

export default nextConfig;
