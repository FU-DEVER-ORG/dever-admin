import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/app/i18n/index.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: false,
  images: {
    // Cloudflare Workers runtime has no built-in Next image optimizer; serve images as-is.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "aiartshop.com" },
      { protocol: "https", hostname: "th.bing.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "example.com" },
    ],
  },
};

export default withNextIntl(nextConfig);

// Enables Cloudflare bindings (env, R2, etc.) during `next dev`. No-op in production build.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
