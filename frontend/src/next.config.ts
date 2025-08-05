import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: `${process.env.BACKEND_API_URL || "http://localhost:8900"}/api/:path*`, // Proxy to FastAPI backend
          },
        ]
      : [];
  },
};

export default nextConfig;
