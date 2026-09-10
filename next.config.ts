import type { NextConfig } from "next";

// Un año para lo que nunca cambia de contenido bajo el mismo nombre, 30 días
// para lo que sólo cambia con un deploy. Sin esto, Next sirve todo lo de
// public/ con `max-age=0`: cada visita revalida cada fondo, cada foto y cada
// audio, y el hosting cobra ese tráfico de nuevo.
const UN_ANO = 60 * 60 * 24 * 365;
const TREINTA_DIAS = 60 * 60 * 24 * 30;

const nextConfig: NextConfig = {
  images: {
    // Obligatorio a partir de Next 16: sin la lista, el optimizador acepta
    // cualquier calidad que le pidan por query string.
    qualities: [75],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Las subidas llevan timestamp + random en el nombre, así que un
        // nombre dado nunca cambia de contenido: se pueden marcar inmutables
        // sin riesgo de servir una versión vieja.
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${UN_ANO}, immutable` },
        ],
      },
      {
        // Assets de diseño: sólo cambian cuando se hace un deploy con arte
        // nueva. 30 días acota cuánto puede quedar desactualizado un visitante
        // que ya los tenga, y aun así evita casi todas las descargas repetidas.
        // Si alguna vez pisás un archivo con arte distinta bajo el mismo
        // nombre, cambiale el nombre para que los cachés lo tomen enseguida.
        source: "/:dir(fondos|mockup-preview|music|landing|video|lordicon)/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${TREINTA_DIAS}` },
        ],
      },
      {
        source: "/:file(collage-invitacion.png|video-demo.mp4|video-demo-mobile.mp4|video-demo-poster.webp)",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${TREINTA_DIAS}` },
        ],
      },
    ];
  },
};

export default nextConfig;
