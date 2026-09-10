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
 * Tampoco se hace geolocalización por IP: pide un servicio externo, agrega
 * latencia a la primera pintura y manda la IP del visitante a un tercero,
 * las tres cosas por un cartelito.
 */

export const COOKIE_PAIS_VISITANTE = "pais-visitante";

/**
 * Zonas horarias -> país, sólo para los países que manejamos.
 *
 * La zona horaria del navegador es el mejor dato disponible sin red y sin
 * tocar la IP: la pone el sistema operativo al configurarse y casi nadie la
 * cambia. Un VPN no la altera, que para este uso es una ventaja -- lo que
 * importa es dónde vive la persona, no por dónde sale su tráfico.
 */
const ZONAS: Record<string, CodigoPais> = {
  "America/Santiago": "CL",
  "America/Punta_Arenas": "CL",
  "Pacific/Easter": "CL",
  "America/Montevideo": "UY",
  "America/Bogota": "CO",
};

const PREFIJOS: [string, CodigoPais][] = [
  ["America/Argentina/", "AR"],
  ["America/Buenos_Aires", "AR"],
  ["America/Cordoba", "AR"],
  ["America/Mendoza", "AR"],
];

// Brasil y México tienen muchas zonas y se listan enteras: adivinarlas por
// prefijo daría falsos positivos (America/Cancun no dice "Mexico" en el
// nombre, y America/Bahia es Brasil pero America/Bahia_Banderas es México).
const BRASIL = new Set([
  "America/Sao_Paulo", "America/Bahia", "America/Fortaleza", "America/Recife",
  "America/Manaus", "America/Belem", "America/Cuiaba", "America/Campo_Grande",
  "America/Porto_Velho", "America/Boa_Vista", "America/Rio_Branco",
  "America/Maceio", "America/Araguaina", "America/Santarem", "America/Eirunepe",
  "America/Noronha",
]);

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
  if (BRASIL.has(zona)) return "BR";
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

/**
 * Lo que se puede saber en el servidor, para la primera pintura.
 *
 * Si hay un CDN adelante (Cloudflare, Vercel) el país viene en una cabecera y
 * es exacto. Hoy no lo hay -- se sirve desde Railway, que no las manda -- así
 * que en la práctica manda la cookie que deja el detector del cliente. Se lee
 * igual para que el día que se ponga un CDN adelante funcione solo.
 */
export function paisSegunCabeceras(get: (nombre: string) => string | null): CodigoPais | null {
  for (const cabecera of ["cf-ipcountry", "x-vercel-ip-country", "x-country-code"]) {
    const v = get(cabecera)?.toUpperCase();
    if (esCodigoPais(v)) return v;
  }

  const cookie = get("cookie");
  if (cookie) {
    const m = cookie.match(new RegExp(`${COOKIE_PAIS_VISITANTE}=([A-Z]{2})`));
    if (m && esCodigoPais(m[1])) return m[1];
  }

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
