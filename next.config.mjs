/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "www.smsticket.cz",
      },
      {
        protocol: "https",
        hostname: "www.smsticket.cz",
      },
    ],
  },
};

export default nextConfig;
