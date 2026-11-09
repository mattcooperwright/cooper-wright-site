import type { NextConfig } from "next";

// Static export. The built page is served by the main site from /mesh-gradient-studio/;
// vite.config.ts sets the matching base path for asset URLs.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
