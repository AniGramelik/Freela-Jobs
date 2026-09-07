import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Freela Jobs",
    short_name: "Freela Jobs",
    description:
      "Freelancers e empresas se encontram: banco de talentos, mural de vagas, convocações e conversa — tudo num lugar só.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f2338",
    theme_color: "#15324E",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
