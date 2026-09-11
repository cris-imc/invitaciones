"use client";

import { useState } from "react";

/**
 * El logo de quien cobra, al lado del botón de pago.
 *
 * Por qué está: el visitante está por poner plata en un sitio que no conoce.
 * Ver la marca de quien procesa el cobro le dice que no le está dando la
 * tarjeta a un desconocido, sino a una empresa que ya usó antes.
 *
 * Son los archivos OFICIALES, bajados de cada marca (ver public/marcas/LEEME.txt).
 * No se dibujan a ojo por dos motivos: un logo mal calcado se nota y logra lo
 * contrario de lo que busca -- desconfianza --, y las dos marcas piden
 * expresamente que se use el archivo que ellas publican.
 *
 * Mientras el archivo no esté, se muestra el nombre en el color de la marca:
 * es honesto, se lee, y no finge ser un logo.
 */

const MARCAS = {
  mercadopago: {
    nombre: "Mercado Pago",
    // PNG y no SVG porque Mercado Pago publica el logo a color sólo en PNG:
    // el único SVG suyo que hay es la versión en blanco del pie de su sitio,
    // que es una silueta de un solo trazo y no se puede colorear. Viene a
    // 284x74 con fondo transparente, que sobra para dibujarlo a 20px de alto.
    archivo: "/marcas/mercadopago.png",
    // Azul de marca, el mismo que ya se usa en NoCreditsDialog.
    color: "#009EE3",
  },
  paypal: {
    nombre: "PayPal",
    archivo: "/marcas/paypal.svg",
    color: "#003087",
  },
} as const;

export function LogoDePago({ marca, className }: { marca: keyof typeof MARCAS; className?: string }) {
  const m = MARCAS[marca];
  const [sinArchivo, setSinArchivo] = useState(false);

  if (sinArchivo) {
    return (
      <span
        className={`font-semibold text-sm tracking-tight ${className ?? ""}`}
        style={{ color: m.color }}
      >
        {m.nombre}
      </span>
    );
  }

  // Va sobre una pastilla blanca, y no suelto sobre el fondo de la página.
  //
  // Los dos logos son azul oscuro (#2D3277 y #003087) sobre transparente:
  // encima del verde casi negro del modo oscuro no se leen. Las dos marcas
  // publican además una versión en blanco para fondos oscuros, pero usar una
  // u otra según el tema significa mantener cuatro archivos y adivinar el
  // tema antes de pintar.
  //
  // La pastilla resuelve las dos cosas de una: es lo que las dos guías de
  // marca piden cuando el logo va sobre un fondo que no es claro, se ve igual
  // en los dos temas, y de paso se lee como un sello de pago, que es
  // justamente la señal de confianza que se busca.
  return (
    <span
      className={`inline-flex items-center rounded-md bg-white px-2 py-1 ${className ?? ""}`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,.10)" }}
    >
      <img
        src={m.archivo}
        alt={m.nombre}
        // `onError` y no una comprobación previa: si el archivo no está, el
        // navegador nos avisa y se cae al nombre sin dejar un ícono roto.
        onError={() => setSinArchivo(true)}
        className="h-5 w-auto block"
      />
    </span>
  );
}
