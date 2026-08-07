/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/nz-tech-for-good",
  images: { unoptimized: true },
  transpilePackages: ["@olitreadwell/ui"],
};

export default nextConfig;
