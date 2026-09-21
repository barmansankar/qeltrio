import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Presigned uploads go direct to R2; no large proxy body required. */
};

export default nextConfig;
