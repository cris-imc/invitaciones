"use client";

import { createContext, useContext, useMemo } from "react";
import { IDIOMA_POR_DEFECTO, type Idioma } from "@/lib/i18n/idiomas";
import { traductorDe, type Traductor } from "@/lib/i18n/texto";
import { formatearMonto, formatearNumero } from "@/lib/i18n/moneda";
import { useDatosDeInvitacion } from "@/components/invitation/ContextoInvitacion";
import type { CodigoPais } from "@/lib/paises";

interface Valor {
  idioma: Idioma;
  t: Traductor;
  /**
   * El país que el servidor sabe CON FIRMEZA para esta carga (la cuenta, la
   * elección a mano o la IP según la cabecera del CDN), o null. Es la única
   * vía por la que la detección por IP llega al navegador: el cliente no ve
   * las cabeceras. Los consumidores lo pasan a `paisDelVisitanteEnCliente`,
   * que lo pone por encima de la zona horaria y por debajo de la elección.
   */
  pais: CodigoPais | null;
}

const Contexto = createContext<Valor | null>(null);

/**
 * Reparte el idioma a los componentes de cliente.
 *
 * El idioma se resuelve SIEMPRE en el servidor y baja como prop: así el HTML
 * que llega ya está en el idioma correcto y no hay un parpadeo de español al
 * hidratar.
 *
 * Se monta dos veces, con distinto valor, y eso es a propósito:
 *
 * 1. En el layout raíz, con el idioma del ANFITRIÓN (su cookie). Cubre el
 *    panel, el wizard y la landing.
 *
 * 2. Dentro de la ruta de una invitación, con el idioma de LA INVITACIÓN.
 *    Pisa al de arriba para todo ese subárbol, que es justo lo que hace
 *    falta: una boda en São Paulo manda su convite en portugués aunque el
 *    invitado tenga el navegador en inglés, y si un tío argentino lo abre lo
 *    tiene que ver igual que todos los demás.
 */
export function ProveedorIdioma({
  idioma,
  pais = null,
  children,
}: {
  idioma: Idioma;
  pais?: CodigoPais | null;
  children: React.ReactNode;
}) {
  const valor = useMemo<Valor>(
    () => ({ idioma, t: traductorDe(idioma), pais }),
    [idioma, pais]
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/**
 * El traductor y el idioma actual, para componentes de cliente.
 *
 * Si no hay proveedor arriba cae al español en vez de romper: es lo que pasa
 * en pantallas sueltas (un modal montado en un portal fuera del árbol, una
 * prueba) y ahí es mejor un texto en español que una pantalla en blanco.
 */
export function useIdioma(): Valor {
  const v = useContext(Contexto);
  return useMemo(
    () => v ?? { idioma: IDIOMA_POR_DEFECTO, t: traductorDe(IDIOMA_POR_DEFECTO), pais: null },
    [v]
  );
}

/** Atajo para el caso común: sólo el traductor. */
export function useTextos(): Traductor {
  return useIdioma().t;
}

/**
 * Un título que el diseño parte en dos renglones, con el segundo en cursiva.
 *
 * El corte NO se guarda como dos textos sueltos. Se guarda la frase entera y
 * una barra marca dónde parte: "¿Qué tema|te hace bailar?". En inglés el
 * corte natural cae en otro lado ("What song|gets you dancing?"), y traducir
 * cada mitad por separado da dos pedazos que en el otro idioma no cierran.
 *
 * El DOM que sale es el mismo de siempre -- texto, <br />, span de acento --
 * así que ninguna plantilla cambia de aspecto.
 */
export function tituloEnDosLineas(texto: string, claseAcento: string): React.ReactNode {
  const corte = texto.indexOf("|");
  if (corte < 0) return texto;
  return (
    <>
      {texto.slice(0, corte).trimEnd()}
      <br />
      <span className={claseAcento}>{texto.slice(corte + 1).trimStart()}</span>
    </>
  );
}

/**
 * El formateador de montos de la invitación actual.
 *
 * Se resuelve acá y no en cada plantilla porque son 342 archivos con la misma
 * función escrita a mano y `es-AR` fijo adentro. La moneda sale del país de
 * la invitación (ver moneda.ts), no del idioma.
 */
export function useFormatoDeMoneda(): (n: number) => string {
  const { idioma } = useIdioma();
  const datos = useDatosDeInvitacion();
  const pais = datos?.pais;
  return useMemo(() => (n: number) => formatearMonto(n, pais, idioma), [pais, idioma]);
}

/** Lo mismo para números sueltos: sólo el separador de miles. */
export function useFormatoDeNumero(): (n: number) => string {
  const { idioma } = useIdioma();
  const datos = useDatosDeInvitacion();
  const pais = datos?.pais;
  return useMemo(() => (n: number) => formatearNumero(n, pais, idioma), [pais, idioma]);
}
