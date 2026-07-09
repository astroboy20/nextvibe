import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/admin/",
          "/(app)/",
          "/onboarding/",
          "/purchase/",
          "/check-verification/",
          "/game/",
          "/test-juicyway/",
        ],
      },
    ],
    sitemap: "https://mynextvibe.com/sitemap.xml",
  };
}
