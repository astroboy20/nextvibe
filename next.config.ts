import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Skip type checking during dev
  },

  // Redirect old /dashboard/* paths to new clean paths for back-compat
  async redirects() {
    return [
      { source: "/dashboard/events",              destination: "/events",        permanent: true },
      { source: "/dashboard/events/:id",           destination: "/events/:id",    permanent: true },
      { source: "/dashboard/events/:id/postcards", destination: "/events/:id/postcards", permanent: true },
      { source: "/dashboard/social",               destination: "/social",        permanent: true },
      { source: "/dashboard/messages",             destination: "/messages",      permanent: true },
      { source: "/dashboard/notifications",        destination: "/notifications", permanent: true },
      { source: "/dashboard/profile",              destination: "/profile",       permanent: true },
      { source: "/dashboard/profile/edit",         destination: "/profile/edit",  permanent: true },
      { source: "/dashboard/settings",             destination: "/settings",      permanent: true },
      { source: "/dashboard/postcards/:id",        destination: "/postcards/:id", permanent: true },
      { source: "/dashboard/user/:id",             destination: "/users/:id",     permanent: true },
    ];
  },

  // Explicit public rewrites — ensures SEO pages, sitemap, and robots
  // are reachable through any reverse proxy or CDN layer in front of Next.js
  async rewrites() {
    return [
      // Crawl infrastructure
      { source: "/sitemap.xml",  destination: "/sitemap.xml" },
      { source: "/robots.txt",   destination: "/robots.txt" },

      // SEO landing pages — party photo sharing & event memory
      { source: "/party-photo-sharing", destination: "/party-photo-sharing" },
      { source: "/event-memory-app",    destination: "/event-memory-app" },
      { source: "/alternatives",        destination: "/alternatives" },

      // Use-case pages
      { source: "/use-cases/weddings",         destination: "/use-cases/weddings" },
      { source: "/use-cases/birthday-parties", destination: "/use-cases/birthday-parties" },
      { source: "/use-cases/festivals",        destination: "/use-cases/festivals" },
      { source: "/use-cases/corporate-events", destination: "/use-cases/corporate-events" },

      // Core public pages
      { source: "/about",       destination: "/about" },
      { source: "/how-it-works",destination: "/how-it-works" },
      { source: "/faq",         destination: "/faq" },
      { source: "/pricing",     destination: "/pricing" },
      { source: "/contact",     destination: "/contact" },
      { source: "/privacy",     destination: "/privacy" },
      { source: "/terms",       destination: "/terms" },
    ];
  },

  images: {
    unoptimized: true, // Skip image optimization for faster builds
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.mos.cms.futurecdn.net",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "nextvibe.co",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "minio-production-5cff.up.railway.app",
        port: "",
        pathname: "**",
      },
    ],
  },

};

export default nextConfig;
