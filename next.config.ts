import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async rewrites() {
    return [
      {
        source: "/es",
        destination: "/?lang=es",
      },
      {
        source: "/pt",
        destination: "/?lang=pt",
      },
    ];
  },
};

export default nextConfig;
