import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/checkout/", "/profile/", "/api/"],
      },
      {
        // Block GPTBot and other AI scrapers
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
    ],
    sitemap: "https://kgnaccessories.pk/sitemap.xml",
    host: "https://kgnaccessories.pk",
  };
}
