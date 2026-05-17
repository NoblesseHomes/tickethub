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
      {
        protocol: "https",
        hostname: "705e50d34bc6a0e0a734d693f8479dbf.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-3e3f54c47f534f22b4b204f86b9ab4e5.r2.dev",
      },
    ],
  },
};

export default nextConfig;
