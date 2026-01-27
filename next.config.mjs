import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'uploads.mangadex.org' },
      { protocol: 'https', hostname: 'cmdxd98sb0x3yprd.mangadex.network' }, // Add other MangaDex mirrors if needed
      { protocol: 'https', hostname: '*.mangadex.network' },
      { protocol: 'https', hostname: '*.mangadex.org' },
    ],
  },
};

export default withPWA(nextConfig);
