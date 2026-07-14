import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KGN Accessories",
    short_name: "KGN",
    description:
      "Premium mobile accessories in Pakistan. Cash on Delivery available.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f23",
    theme_color: "#4f46e5",
    orientation: "portrait",
    categories: ["shopping", "ecommerce"],
    lang: "en-PK",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
