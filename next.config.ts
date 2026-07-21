import type { NextConfig } from "next";

// next-pwa v5 is a CommonJS module with no TS types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "honorboundfit.com",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // We ship our own sw.js — tell workbox not to generate one
  // (remove the line below to let next-pwa auto-generate the SW)
  // swSrc: "public/sw.js",
})(nextConfig);
