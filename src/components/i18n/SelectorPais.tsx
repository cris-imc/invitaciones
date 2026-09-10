"use client";

import { useEffect, useState } from "react";
import { BanderaPais } from "./BanderaPais";
import { PAISES_ORDENADOS, esCodigoPais, type CodigoPais } from "@/lib/paises";
import { COOKIE_PAIS_VISITANTE, paisSegunZonaHoraria } from "@/lib/pais-visitante";
import { COOKIE_IDIOMA, idiomaSegunPais } from "@/lib/i18n/idiomas";

interface Props {
  className?: string;
}

function leerCookie(nombre: string): string | null {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.split("=").slice(1).join("=")) : null;
}

function guardarCookie(nombre: string, valor: string) {
  // Un año, en la raíz: la preferencia es de la persona, no de la página.
  document.cookie = `${nombre}=${valor}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Selector de PAÍS, no de idioma.
 *
 * El país es el dato que decide todo: el idioma sale de él (Brasil en
 * portugués, Estados Unidos en inglés, el resto en español) y también los
 * medios de pago y qué funciones tiene sentido ofrecer. Pedir las dos cosas
 * por separado sería pedirle dos veces lo mismo al 95% de la gente, y dejaría
 * abierta la combinación absurda de "estoy en Brasil pero mostrame pesos
 * argentinos y cuotas sin interés".
 *
 * Al elegir se guardan las dos cookies -- país e idioma -- porque el servidor
 * lee cada una por su lado y así ninguna pantalla tiene que volver a derivar
 * el idioma del país.
 *
 * La primera vez arranca en lo que sugiere la zona horaria del navegador, que
 * es lo mejor que se puede saber sin pedirle nada a nadie ni mirar la IP.
 */
export function SelectorPais({ className }: Props) {
  const [pais, setPais] = useState<CodigoPais>("AR");
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const guardado = leerCookie(COOKIE_PAIS_VISITANTE);
    if (esCodigoPais(guardado)) {
      setPais(guardado);
      return;
    }
    // Sin elección previa: lo que sugiere la zona horaria. No se recarga la
    // página por esto -- se deja la cookie y la próxima carga ya sale bien.
    try {
      const sugerido = paisSegunZonaHoraria(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (sugerido) {
        setPais(sugerido);
        guardarCookie(COOKIE_PAIS_VISITANTE, sugerido);
        guardarCookie(COOKIE_IDIOMA, idiomaSegunPais(sugerido));
      }
    } catch {
      // Sin zona horaria disponible se queda en Argentina, que es el mercado
      // principal y el único con el cobro resuelto.
    }
  }, []);

  const elegir = (nuevo: CodigoPais) => {
    guardarCookie(COOKIE_PAIS_VISITANTE, nuevo);
    guardarCookie(COOKIE_IDIOMA, idiomaSegunPais(nuevo));
    setPais(nuevo);
    setAbierto(false);
    // Recarga completa y no un cambio de estado: los textos y los precios se
    // resuelven en el servidor, así que hay que volver a pedir la página.
    window.location.reload();
  };

  const actual = PAISES_ORDENADOS.find((p) => p.codigo === pais);

  return (
    <div className={`selector-idioma ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`País: ${actual?.nombre ?? pais}`}
        className="selector-idioma-boton"
      >
        <BanderaPais pais={pais} className="w-[18px] h-3" />
        {pais}
      </button>

      {abierto && (
        <>
          {/* Capa para cerrar tocando afuera, sin escuchar en todo el
              documento: menos código y no deja oyentes sueltos. */}
          <div className="selector-idioma-fuera" onClick={() => setAbierto(false)} />
          <ul className="selector-idioma-lista" role="listbox">
            {PAISES_ORDENADOS.map((p) => (
              <li key={p.codigo}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.codigo === pais}
                  onClick={() => elegir(p.codigo)}
                  className={`selector-idioma-opcion ${p.codigo === pais ? "elegida" : ""}`}
                >
                  <BanderaPais pais={p.codigo} className="w-[18px] h-3 shrink-0" />
                  <span className="selector-idioma-sigla">{p.codigo}</span>
                  {p.nombre}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
