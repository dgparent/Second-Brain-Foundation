import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    HYPERBROWSER_API_KEY: process.env.HYPERBROWSER_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_SUMMARY_MODEL: process.env.OPENAI_SUMMARY_MODEL,
    VEO3_API_KEY: process.env.VEO3_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    VEO_MODEL: process.env.VEO_MODEL,
  },
};

export default nextConfig;
