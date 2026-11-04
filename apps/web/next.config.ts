/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Static export served as its own Vercel site at
  // https://nz-tech-for-good.vercel.app/.
  output: 'export',
};

export default nextConfig;
