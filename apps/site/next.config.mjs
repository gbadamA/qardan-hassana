/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Les packages du monorepo sont livrés en TypeScript brut : Next doit les transpiler.
  transpilePackages: ["@qardan/design-tokens", "@qardan/shared", "@qardan/supabase"],
};

export default nextConfig;
