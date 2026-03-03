import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js to build a static HTML/CSS/JS version
  output: "export",

  basePath: "/paws-and-prefs",

  // Disables Next.js default image optimization since it doesn't work with static exports
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
