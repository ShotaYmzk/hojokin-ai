/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercelでのビルド時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScriptエラーも無視（必要に応じて）
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
