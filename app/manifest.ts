import type { MetadataRoute } from "next"

// Lets phones add the site to the home screen with the SuperVitre icon
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuperVitre – Lavage de vitres sur la Rive-Sud",
    short_name: "SuperVitre",
    description: "Lavage de vitres résidentiel sur toute la Rive-Sud de Montréal.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0b345d",
    lang: "fr-CA",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
