"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { IDIOMAS, NOMBRES_DE_IDIOMA, SIGLAS, COOKIE_IDIOMA, esIdiomaValido, type Idioma } from "@/lib/i18n/idiomas";
import { useIdioma } from "./ProveedorIdioma";

interface Props {
  className?: string;
}

function leerCookie(nombre: string): string | null {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.split("=").slice(1).join("=")) : null;
}

/**
 * El idioma del PANEL, elegido libremente por el anfitrión.
 *
 * Es independiente del país de la cuenta a propósito: dónde vivís no dice qué
 * idioma hablás. Alguien de México puede querer el panel en inglés, y le va a
 * seguir pidiendo una CLABE porque los datos bancarios dependen del país, no
 * del idioma.
 *
 * Y es independiente del idioma de cada invitación, que se elige aparte en el
 * wizard: el panel lo ve el anfitrión, la invitación la ven sus invitados.
 *
 * El país sí es fijo dentro del panel y no se toca acá (ver
 * PreferenciasUsuario): de él dependen los precios, la moneda y los datos
 * bancarios de invitaciones que quizás ya están publicadas.
 */
export function SelectorIdioma({ className }: Props) {
  const { idioma: delContexto } = useIdioma();
  const [idioma, setIdioma] = useState<Idioma>(delContexto);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const guardado = leerCookie(COOKIE_IDIOMA);
    if (esIdiomaValido(guardado)) setIdioma(guardado);
  }, []);

  const elegir = (nuevo: Idioma) => {
    // Un año, en la raíz: la preferencia es de la persona, no de la página.
    document.cookie = `${COOKIE_IDIOMA}=${nuevo}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setIdioma(nuevo);
    setAbierto(false);
    // Recarga completa: los textos se resuelven en el servidor, así que hay
    // que volver a pedir la página para verlos.
    window.location.reload();
  };

  return (
    <div className={`selector-idioma ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Idioma: ${NOMBRES_DE_IDIOMA[idioma]}`}
        className="selector-idioma-boton"
      >
        <Languages className="w-3.5 h-3.5" />
        {SIGLAS[idioma]}
      </button>

      {abierto && (
        <>
          {/* Capa para cerrar tocando afuera, sin dejar oyentes en el documento. */}
          <div className="selector-idioma-fuera" onClick={() => setAbierto(false)} />
          <ul className="selector-idioma-lista" role="listbox">
            {IDIOMAS.map((i) => (
              <li key={i}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === idioma}
                  onClick={() => elegir(i)}
                  className={`selector-idioma-opcion ${i === idioma ? "elegida" : ""}`}
                >
                  <span className="selector-idioma-sigla">{SIGLAS[i]}</span>
                  {NOMBRES_DE_IDIOMA[i]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
