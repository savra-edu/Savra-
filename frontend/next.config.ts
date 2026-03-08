import type { NextConfig } from "next";

const basePatterns = [
  { protocol: "http" as const, hostname: "localhost", port: "3001", pathname: "/api/upload/file/**" },
  { protocol: "https" as const, hostname: "api.dicebear.com" },
  { protocol: "https" as const, hostname: "www.google.com" },
  { protocol: "https" as const, hostname: "www.apple.com" },
  { protocol: "https" as const, hostname: "www.facebook.com" },
];

type RemotePattern =
  | { protocol: "http" | "https"; hostname: string; port?: string; pathname?: string };

const extraPatterns: RemotePattern[] = [];
try {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const u = new URL(apiUrl);
    extraPatterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      port: u.port || "",
      pathname: "/api/upload/file/**",
    });
  }
} catch {}

const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
if (r2Domain) {
  extraPatterns.push({
    protocol: "https",
    hostname: r2Domain,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [...basePatterns, ...extraPatterns],
  },
};

export default nextConfig;
