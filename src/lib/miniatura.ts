import { esUrlDeImagenOptimizable } from "./imagen-optimizable";

/**
 * Lo que cambia en una invitación cuando se dibuja como MINIATURA: el recuadro
 * de 170px de /modelos, sin poder tocarse.
 *
 * Lo que de verdad tumbaba /modelos en el teléfono no era el JavaScript ni la
 * animación: eran las fotos. Una foto de portada sacada con el celular tiene
 * 12 MP, y el navegador la decodifica ENTERA aunque la dibuje en 170px:
 * 3024×4032×4 bytes = 48 MB de RAM por foto, por capa. Con dos fotos por
 * portada (móvil y escritorio) y 8 miniaturas vivas son ~780 MB sólo de
 * píxeles -- medido: 1,5 GB de proceso con 8 miniaturas. iOS mata la pestaña
 * mucho antes.
 *
 * La solución es pedirle al optimizador de Next una versión chica de cada
 * imagen (`/_next/image?...&w=`). A 170px de ancho y 3 píxeles por punto la
 * portada necesita ~510px; con el margen del Ken Burns, 640 sobra. Las demás
 * imágenes ni se ven en el recuadro (quedan debajo del pliegue) y con 384
 * alcanza de sobra. El resultado se ve idéntico: mismas fotos, misma
 * animación, sólo menos píxeles de los que nadie iba a ver.
 *
 * Se hace sobre los DATOS y no tocando las 365 plantillas: cada una recibe
 * una URL y la usa como siempre.
 */

/** Ancho pedido para las fotos de portada (las únicas que se ven). */
export const ANCHO_PORTADA_MINIATURA = 640;
/** Ancho para el resto: galerías, despedida, etc. No se ven en el recuadro. */
export const ANCHO_RESTO_MINIATURA = 384;

/** Campos con UNA imagen. */
const CAMPOS_PORTADA = ["portadaImagenFondo", "portadaImagenFondoDesktop"] as const;
const CAMPOS_SUELTOS = ["despedidaFoto", "imagenCelebremosJuntos"] as const;
/** Campos con un JSON de lista de imágenes. */
const CAMPOS_LISTA = ["galeriaPrincipalFotos", "galeriaSecundariaFotos"] as const;

/**
 * La URL de una imagen, reducida al ancho pedido a través del optimizador de
 * Next. Devuelve la original cuando no se puede optimizar (un dominio que el
 * optimizador no acepta, algo que no es URL): mejor la foto grande que una
 * rota.
 */
export function urlDeImagenReducida(url: string, ancho: number): string {
  if (!esUrlDeImagenOptimizable(url)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${ancho}&q=75`;
}

function reducirLista(json: string, ancho: number): string {
  try {
    const lista = JSON.parse(json);
    if (!Array.isArray(lista)) return json;
    return JSON.stringify(
      lista.map((item) => {
        if (typeof item === "string") return urlDeImagenReducida(item, ancho);
        // Algunas galerías guardan objetos {url, ...}: se reduce sólo la url.
        if (item && typeof item === "object" && typeof item.url === "string") {
          return { ...item, url: urlDeImagenReducida(item.url, ancho) };
        }
        return item;
      })
    );
  } catch {
    return json;
  }
}

/**
 * La invitación lista para dibujarse como miniatura: sin mapa (un Google
 * Maps vivo por miniatura también tumbaba el teléfono) y con todas las
 * imágenes reducidas.
 */
export function invitacionParaMiniatura<T extends Record<string, unknown>>(invitacion: T): T {
  const salida: Record<string, unknown> = { ...invitacion, mapUrl: null };
  for (const campo of CAMPOS_PORTADA) {
    const v = salida[campo];
    if (typeof v === "string" && v) salida[campo] = urlDeImagenReducida(v, ANCHO_PORTADA_MINIATURA);
  }
  for (const campo of CAMPOS_SUELTOS) {
    const v = salida[campo];
    if (typeof v === "string" && v) salida[campo] = urlDeImagenReducida(v, ANCHO_RESTO_MINIATURA);
  }
  for (const campo of CAMPOS_LISTA) {
    const v = salida[campo];
    if (typeof v === "string" && v) salida[campo] = reducirLista(v, ANCHO_RESTO_MINIATURA);
  }
  return salida as T;
}
