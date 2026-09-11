"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BanderaPais } from "./BanderaPais";
import { PAISES_ORDENADOS, type CodigoPais } from "@/lib/paises";
import {
  paisDelVisitanteEnCliente,
  recordarPaisDelVisitante,
  recordarPaisElegido,
} from "@/lib/pais-visitante";
import { COOKIE_IDIOMA, idiomaSegunPais } from "@/lib/i18n/idiomas";
import { useIdioma } from "./ProveedorIdioma";

interface Props {
  className?: string;
}

// Las cookies no avisan cuando cambian; el valor se relee en cada render y
// al elegir se recarga la página entera, así que no hay nada que suscribir.
const suscribirANada = () => () => {};

function guardarCookie(nombre: string, valor: string) {
  // Un año, en la raíz: la preferencia es de la persona, no de la página.
  document.cookie = `${nombre}=${valor}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Selector de PAÍS, no de idioma.
 *
 * El país es el dato que decide todo: los datos bancarios que se piden, la
 * moneda, los medios de pago y qué funciones tiene sentido ofrecer. Sin él
 * quedaría abierta la combinación absurda de "estoy en Colombia pero
 * mostrame pesos argentinos y cuotas sin interés".
 *
 * El idioma ya no se deriva de acá: hoy la app entera va en español para
 * todos los países (ver MULTIIDIOMA_HABILITADO en lib/i18n/idiomas.ts).
 *
 * Al elegir se guardan el país (como ELECCIÓN, que manda sobre cualquier
 * detección, ver lib/pais-visitante.ts) y el idioma, porque el servidor lee
 * cada cookie por su lado.
 *
 * Arranca en el país que el servidor ya resolvió para esta carga (baja por
 * ProveedorIdioma; con un CDN adelante es la IP real). Así la bandera sale
 * bien desde el primer HTML, sin parpadeo de "AR" y sin diferencia entre lo
 * que renderiza el servidor y lo que hidrata el cliente. Recién si el
 * servidor no pudo, se recurre a la zona horaria del navegador.
 */
export function SelectorPais({ className }: Props) {
  const { pais: delServidor } = useIdioma();
  // useSyncExternalStore y no useState+useEffect: durante la hidratación
  // React usa el valor del servidor (sin mismatch) y recién después el del
  // navegador, que además puede mirar cookies y zona horaria. Sin Argentina
  // inventada: es el último recurso cuando nada se puede afirmar, porque es
  // el mercado principal y el único con el cobro resuelto.
  const pais = useSyncExternalStore<CodigoPais>(
    suscribirANada,
    () => paisDelVisitanteEnCliente(delServidor) ?? "AR",
    () => delServidor ?? "AR"
  );
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const detectado = paisDelVisitanteEnCliente(delServidor);
    if (!detectado) return;
    // Se deja la cookie DETECTADA (no la de elección) para que la próxima
    // carga del servidor ya salga bien aun sin CDN. No se recarga la página
    // por esto.
    recordarPaisDelVisitante(detectado);
    guardarCookie(COOKIE_IDIOMA, idiomaSegunPais(detectado));
  }, [delServidor]);

  const elegir = (nuevo: CodigoPais) => {
    recordarPaisElegido(nuevo);
    guardarCookie(COOKIE_IDIOMA, idiomaSegunPais(nuevo));
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
