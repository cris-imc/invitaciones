import { cookies, headers } from "next/headers";
import { COOKIE_IDIOMA, IDIOMA_POR_DEFECTO, esIdiomaValido, idiomaSegunNavegador, type Idioma } from "./idiomas";
import { traductorDe, type Traductor } from "./texto";
import { paisSegunCabeceras } from "@/lib/pais-visitante";

/**
 * El idioma del anfitrión, resuelto en el servidor.
 *
 * Se resuelve acá y no en el cliente porque las páginas se arman del lado del
 * servidor: si el idioma se decidiera al hidratar, la primera pintura saldría
 * en español y cambiaría a la vista, que es exactamente el parpadeo que el
 * script de tema del layout evita para los colores.
 *
 * Orden: lo que la persona eligió, y sólo si nunca eligió, lo que pide el
 * navegador. Adivinar por encima de una elección explícita es de las cosas
 * más molestas que puede hacer un sitio.
 */
export async function idiomaDelAnfitrion(): Promise<Idioma> {
  const guardado = (await cookies()).get(COOKIE_IDIOMA)?.value;
  if (esIdiomaValido(guardado)) return guardado;

  try {
    return idiomaSegunNavegador((await headers()).get("accept-language"));
  } catch {
    // En contextos donde las cabeceras no están disponibles (generación
    // estática), el default alcanza: la cookie manda apenas hay una visita.
    return IDIOMA_POR_DEFECTO;
  }
}

/**
 * Atajo para un Server Component que sólo necesita traducir.
 *
 * Resuelve el país además del idioma, y no es opcional: hay textos que
 * cambian por país (ver sobrescrituras.ts). Sin esto, un Server Component
 * mostraba "quinceañera" a un estadounidense mientras el componente de
 * cliente de al lado, que sí recibe el país por el proveedor, mostraba
 * "Sweet 16" -- las dos palabras en la misma pantalla.
 */
export async function textosDelAnfitrion(): Promise<Traductor> {
  const [idioma, pais] = await Promise.all([idiomaDelAnfitrion(), paisDelAnfitrion()]);
  return traductorDe(idioma, pais);
}

/**
 * El país del anfitrión (o del visitante que todavía no se registró).
 *
 * Se usa para los textos que cambian por país y no por idioma -- ver
 * sobrescrituras.ts. Sale de lo mismo que la landing usa para decidir si
 * mostrar las cuotas, así que las dos cosas no pueden discrepar.
 */
export async function paisDelAnfitrion(): Promise<string | null> {
  try {
    const cabeceras = await headers();
    return paisSegunCabeceras((n) => cabeceras.get(n));
  } catch {
    return null;
  }
}
