"use client";

import { useState } from "react";

/**
 * El logo de quien cobra, al lado del botón de pago.
 *
 * Por qué está: el visitante está por poner plata en un sitio que no conoce.
 * Ver la marca de quien procesa el cobro le dice que no le está dando la
 * tarjeta a un desconocido, sino a una empresa que ya usó antes.
 *
 * USA LOS ARCHIVOS OFICIALES, que van en public/marcas/. No se dibujan a ojo
 * por dos motivos: un logo mal calcado se nota y logra lo contrario de lo que
 * busca -- desconfianza --, y las dos marcas piden expresamente que se use el
 * archivo que ellas publican.
 *
 * Mientras el archivo no esté, se muestra el nombre en el color de la marca:
 * es honesto, se lee, y no finge ser un logo.
 */

const MARCAS = {
  mercadopago: {
    nombre: "Mercado Pago",
    archivo: "/marcas/mercadopago.svg",
    // Azul de marca, el mismo que ya se usa en NoCreditsDialog.
    color: "#009EE3",
    alto: "h-5",
  },
  paypal: {
    nombre: "PayPal",
    archivo: "/marcas/paypal.svg",
    color: "#003087",
    alto: "h-5",
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

  return (
    <img
      src={m.archivo}
      alt={m.nombre}
      // `onError` y no una comprobación previa: si el archivo no está, el
      // navegador nos avisa y se cae al nombre sin dejar un ícono roto.
      onError={() => setSinArchivo(true)}
      className={`${m.alto} w-auto ${className ?? ""}`}
    />
  );
}
