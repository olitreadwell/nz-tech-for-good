/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Static export so the site can be served from GitHub Pages at
  // https://olitreadwell.github.io/nz-tech-for-good/.
  output: 'export',
  basePath: '/nz-tech-for-good',
};

export default nextConfig;
