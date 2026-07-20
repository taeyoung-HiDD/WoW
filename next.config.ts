import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep xlsx out of the RSC/server bundle graph
  serverExternalPackages: ["xlsx"],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force CommonJS build — xlsx.mjs breaks webpack module factories in Next 15
      xlsx: path.resolve(process.cwd(), "node_modules/xlsx/xlsx.js"),
    };
    return config;
  },
};

export default nextConfig;
