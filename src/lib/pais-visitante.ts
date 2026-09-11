import type { CodigoPais } from "./paises";
import { esCodigoPais } from "./paises";

/**
 * De qué país es quien está mirando la página, ANTES de que se registre.
 *
 * Hace falta porque hay promesas que sólo valen en un país: "3 cuotas sin
 * interés" es de Mercado Pago Argentina, y mostrárselo a un colombiano es
 * prometerle una forma de pago que no va a existir cuando llegue al checkout.
 * Una promesa de pago que no se cumple es peor que no hacerla.
 *
 * NO se usa para nada más. El país del anfitrión -- el que decide los datos
 * bancarios de su invitación -- se le pregunta al registrarse y manda ése,
 * siempre. Esto es sólo para no mentirle a un visitante anónimo.
 *
 * La geolocalización por IP no se hace desde acá pidiéndole a un servicio
 * externo (latencia en la primera pintura y la IP del visitante en manos de
 * un tercero): se toma de la cabecera que deja el CDN cuando hay uno adelante
 * (`cf-ipcountry` de Cloudflare), que es exacta y gratis. Ver
 * `paisSegunCabeceras`.
 *
 * Hay DOS cookies y la diferencia importa:
 *
 * - `pais-visitante`: lo que se DETECTÓ (zona horaria, cabecera). Es un
 *   recuerdo para que la próxima carga del servidor salga bien; una
 *   detección nueva y mejor (la cabecera del CDN) la pisa sin preguntar.
 * - `pais-elegido`: lo que la persona ELIGIÓ a mano en el selector. Manda
 *   sobre cualquier detección: adivinar por encima de una elección explícita
 *   es de las cosas más molestas que puede hacer un sitio.
 *
 * Con una sola cookie no se puede distinguir, y pasaba esto: la primera
 * visita guardaba "AR" por la zona horaria y desde ahí nada -- ni la cabecera
 * del CDN -- podía cambiarlo, o al revés, la cabecera pisaba lo que la
 * persona acababa de elegir.
 */

export const COOKIE_PAIS_VISITANTE = "pais-visitante";
export const COOKIE_PAIS_ELEGIDO = "pais-elegido";

/**
 * Zonas horarias -> país, sólo para los países que manejamos.
 *
 * La zona horaria del navegador es el mejor dato disponible sin red y sin
 * tocar la IP: la pone el sistema operativo al configurarse y casi nadie la
 * cambia. Un VPN no la altera, que para este uso es una ventaja -- lo que
 * importa es dónde vive la persona, no por dónde sale su tráfico.
 */
const ZONAS: Record<string, CodigoPais> = {
  "America/Montevideo": "UY",
  "America/Bogota": "CO",
  // España: la península, Canarias y las ciudades autónomas.
  "Europe/Madrid": "ES",
  "Atlantic/Canary": "ES",
  "Africa/Ceuta": "ES",
};

const PREFIJOS: [string, CodigoPais][] = [
  ["America/Argentina/", "AR"],
  ["America/Buenos_Aires", "AR"],
  ["America/Cordoba", "AR"],
  ["America/Mendoza", "AR"],
];

// México tiene muchas zonas y se listan enteras: adivinarlas por prefijo
// daría falsos positivos (America/Cancun no dice "Mexico" en el nombre).
const MEXICO = new Set([
  "America/Mexico_City", "America/Cancun", "America/Merida", "America/Monterrey",
  "America/Mazatlan", "America/Chihuahua", "America/Hermosillo", "America/Tijuana",
  "America/Ojinaga", "America/Matamoros", "America/Bahia_Banderas",
  "America/Ciudad_Juarez",
]);

/** El país que sugiere una zona horaria IANA, o null si no es de los nuestros. */
export function paisSegunZonaHoraria(zona: string | null | undefined): CodigoPais | null {
  if (!zona) return null;
  if (ZONAS[zona]) return ZONAS[zona];
  if (MEXICO.has(zona)) return "MX";
  if (zona.startsWith("America/Indiana/") || zona.startsWith("America/North_Dakota/")) return "US";
  if (zona.startsWith("US/") || zona.startsWith("America/Kentucky/")) return "US";
  for (const [prefijo, pais] of PREFIJOS) {
    if (zona.startsWith(prefijo)) return pais;
  }
  const ESTADOS_UNIDOS = new Set([
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "America/Anchorage", "America/Detroit", "America/Boise",
    "America/Juneau", "America/Sitka", "America/Nome", "America/Adak",
    "Pacific/Honolulu",
  ]);
  if (ESTADOS_UNIDOS.has(zona)) return "US";
  return null;
}

/** El valor de una cookie dentro de la cabecera `cookie` cruda, o null. */
function cookieEnCabecera(cabecera: string | null, nombre: string): string | null {
  if (!cabecera) return null;
  // Anclado al inicio o a "; " para que `pais-visitante` no matchee dentro
  // de otra cookie con el mismo sufijo.
  const m = cabecera.match(new RegExp(`(?:^|;\\s*)${nombre}=([A-Za-z]{2})`));
  return m ? m[1].toUpperCase() : null;
}

/**
 * Lo que se sabe del país con FIRMEZA, en el servidor: la elección a mano y
 * la cabecera de país del CDN (Cloudflare la manda en `cf-ipcountry` con el
 * plan gratis; es la única detección por IP real que hay -- Railway solo no
 * la manda). Null si no hay ninguna de las dos.
 *
 * Es lo que baja al navegador como pista (ver ProveedorIdioma): sólo estas
 * dos fuentes merecen pasar por encima de la zona horaria del dispositivo.
 * Las señales débiles del servidor -- la cookie detectada y sobre todo la
 * región del `accept-language` -- no bajan, porque un navegador instalado
 * en "es-AR" no dice dónde está la persona y la zona horaria sí.
 */
export function paisFirmeSegunCabeceras(get: (nombre: string) => string | null): CodigoPais | null {
  const elegido = cookieEnCabecera(get("cookie"), COOKIE_PAIS_ELEGIDO);
  if (esCodigoPais(elegido)) return elegido;

  for (const cabecera of ["cf-ipcountry", "x-vercel-ip-country", "x-country-code"]) {
    const v = get(cabecera)?.toUpperCase();
    if (esCodigoPais(v)) return v;
  }
  return null;
}

/**
 * Lo que se puede saber en el servidor, para la primera pintura.
 *
 * Orden, de más a menos confiable:
 *
 * 1. Lo que la persona eligió a mano (`pais-elegido`).
 * 2. La cabecera de país del CDN, si hay uno adelante.
 * 3. Lo detectado antes en el navegador (`pais-visitante`, por zona horaria).
 * 4. La región del `accept-language` ("es-AR" sí, "es" a secas no).
 *
 * Devuelve null cuando no se puede afirmar nada: es preferible no mostrar
 * una promesa de pago a mostrarla mal.
 */
export function paisSegunCabeceras(get: (nombre: string) => string | null): CodigoPais | null {
  const firme = paisFirmeSegunCabeceras(get);
  if (firme) return firme;

  const detectado = cookieEnCabecera(get("cookie"), COOKIE_PAIS_VISITANTE);
  if (esCodigoPais(detectado)) return detectado;

  // El idioma no dice el país, pero "es-AR" sí. "es" a secas, "es-419" o
  // "pt-BR" sin región útil no alcanzan y se devuelven como desconocido: es
  // preferible no mostrar la promesa a mostrarla mal.
  const idiomas = get("accept-language");
  if (idiomas) {
    const m = idiomas.match(/[a-z]{2}-([A-Z]{2})/);
    if (m && esCodigoPais(m[1])) return m[1];
  }

  return null;
}


/* ------------------------------------------------------------------ *
 * Detección del lado del cliente
 * ------------------------------------------------------------------ */

function leerCookieCruda(nombre: string): string | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.split("=").slice(1).join("=")) : null;
}

/**
 * El país de quien está mirando, resuelto en el navegador.
 *
 * Orden: lo que eligió a mano; lo que el servidor sabe con firmeza
 * (`sugeridoPorElServidor`: la cuenta o la IP según el CDN, baja por
 * ProveedorIdioma); lo detectado en una visita anterior; y si no hay nada, la
 * zona horaria. Devuelve null cuando no se puede afirmar
 * nada, para que cada pantalla decida su propio respaldo en vez de recibir un
 * "Argentina" inventado.
 *
 * El dato del servidor va ANTES que la cookie detectada a propósito: es la
 * única forma de que una detección mejor (la IP) le gane a una peor que quedó
 * guardada (la zona horaria de la primera visita).
 *
 * Se usa en el registro y en el wizard del embudo, donde no hay cuenta de la
 * cual sacar el país: sin esto, un colombiano que entra por "Empezar gratis"
 * arrancaba con formulario argentino y datos bancarios de CBU.
 */
export function paisDelVisitanteEnCliente(
  sugeridoPorElServidor?: string | null
): CodigoPais | null {
  const elegido = leerCookieCruda(COOKIE_PAIS_ELEGIDO);
  if (esCodigoPais(elegido)) return elegido;

  if (esCodigoPais(sugeridoPorElServidor)) return sugeridoPorElServidor;

  const guardado = leerCookieCruda(COOKIE_PAIS_VISITANTE);
  if (esCodigoPais(guardado)) return guardado;

  try {
    return paisSegunZonaHoraria(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return null;
  }
}

function guardarCookieDeUnAnio(nombre: string, valor: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${nombre}=${valor}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Deja registrado el país DETECTADO para que la próxima carga del servidor ya
 * salga bien (precios, medios de pago y textos se resuelven allá). No pisa
 * una elección a mano: si hay `pais-elegido`, esa sigue mandando.
 */
export function recordarPaisDelVisitante(pais: CodigoPais): void {
  guardarCookieDeUnAnio(COOKIE_PAIS_VISITANTE, pais);
}

/**
 * Deja registrado el país que la persona ELIGIÓ a mano. Desde acá manda ése
 * sobre cualquier detección, hasta que vuelva a elegir otro.
 */
export function recordarPaisElegido(pais: CodigoPais): void {
  guardarCookieDeUnAnio(COOKIE_PAIS_ELEGIDO, pais);
  guardarCookieDeUnAnio(COOKIE_PAIS_VISITANTE, pais);
}
