/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Garantir que o output seja otimizado
  reactStrictMode: true,
}

export default nextConfig;