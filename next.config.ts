import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // O catálogo serve imagens pela CDN da Sharky. Libere o host aqui se for
    // usar next/image (o projeto usa <img> puro para simplicidade).
    remotePatterns: [{ protocol: "https", hostname: "sharky.b-cdn.net" }],
  },
  async redirects() {
    // O site já foi bilíngue em /pt e /en; links antigos caem na home.
    return [{ source: "/:lang(pt|en)", destination: "/", permanent: true }];
  },
};

export default nextConfig;
