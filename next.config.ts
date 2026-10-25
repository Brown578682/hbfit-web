import type { NextConfig } from "next";

// next-pwa v5 is a CommonJS module with no TS types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "honorboundfit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hbfit-uploads.s3.us-east-1.amazonaws.com",
        pathname: "/member-photos/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
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
  fallbacks: {
    document: "/offline",
  },
  // Append push notification handlers to the generated service worker
  swSrc: "public/sw-push.js",
})(nextConfig);
