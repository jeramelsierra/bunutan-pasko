/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },
  async headers() {
    return [
      {
        source: "/audio/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
    ];
  },
};

export default nextConfig;