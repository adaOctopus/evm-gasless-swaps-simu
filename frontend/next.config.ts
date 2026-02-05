import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use frontend as root so Next doesn't pick parent lockfile and chunk paths stay correct
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
