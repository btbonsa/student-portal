import type { NextConfig } from "next";

// Allow next/image to load images served by the backend API host
const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
let apiImagePattern: { protocol: "http" | "https"; hostname: string; port?: string } | null = null;
try {
  if (apiUrl) {
    const u = new URL(apiUrl);
    apiImagePattern = {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    };
  }
} catch {}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.5'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      ...(apiImagePattern ? [apiImagePattern] : []),
    ],
  },
};

export default nextConfig;
