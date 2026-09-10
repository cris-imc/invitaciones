import { DICCIONARIOS, type Diccionario } from "./diccionario/index";
import { IDIOMA_POR_DEFECTO, type Idioma } from "./idiomas";
import { sobrescritura } from "./sobrescrituras";

/**
 * Todas las claves posibles, como "panel.mesas.agregarMesa".
 *
 * Se genera desde el diccionario en español, así que escribir una clave que no
 * existe no compila. Es la diferencia entre enterarse del error al escribirlo
 * y enterarse cuando un cliente ve "panel.mesas.agregarMesa" en la pantalla.
 */
type Rutas<T, Prefijo extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefijo}${K}`
    : Rutas<T[K], `${Prefijo}${K}.`>;
}[keyof T & string];

export type ClaveTexto = Rutas<Diccionario>;

function buscar(dic: unknown, clave: string): string | undefined {
  const valor = clave.split(".").reduce<unknown>((actual, parte) => {
    if (actual && typeof actual === "object" && parte in actual) {
      return (actual as Record<string, unknown>)[parte];
    }
    return undefined;
  }, dic);
  return typeof valor === "string" ? valor : undefined;
}

/**
 * Reemplaza {llaves} por valores.
 *
 * Con llaves y no concatenando: el orden de las palabras cambia entre idiomas.
 * "Faltan 3 invitados" y "3 guests remaining" no ponen el número en el mismo
 * lugar, y armar la frase pegando trozos hace imposible traducirla bien.
 */
function reemplazar(texto: string, valores?: Record<string, string | number>): string {
  if (!valores) return texto;
  return texto.replace(/\{(\w+)\}/g, (original, nombre: string) => {
    const v = valores[nombre];
    return v === undefined ? original : String(v);
  });
}

/**
 * El traductor de un idioma.
 *
 * Si a un idioma le falta una clave, cae al español en vez de mostrar la clave
 * cruda: un texto en español dentro de una pantalla en inglés se lee mal, pero
 * "panel.mesas.agregarMesa" en un botón no se lee de ninguna manera.
 */
/**
 * @param pais El país de quien lee -- el del anfitrión en el panel, el de la
 * invitación cuando la ve un invitado. Hay textos que cambian por país y no
 * por idioma: en Estados Unidos no se festejan los quince sino los Sweet 16,
 * y una invitación argentina escrita en inglés sigue siendo una quinceañera.
 * Ver sobrescrituras.ts.
 */
export function traductorDe(idioma: Idioma, pais?: string | null) {
  const dic = DICCIONARIOS[idioma] ?? DICCIONARIOS[IDIOMA_POR_DEFECTO];

  return function t(clave: ClaveTexto, valores?: Record<string, string | number>): string {
    const texto =
      sobrescritura(pais, idioma, clave) ??
      buscar(dic, clave) ??
      buscar(DICCIONARIOS[IDIOMA_POR_DEFECTO], clave);

    if (texto === undefined) {
      // No debería pasar -- el tipo lo impide -- pero si pasa, que se vea en
      // los registros y no en la cara del usuario.
      console.error(`Falta el texto "${clave}" en todos los idiomas`);
      return "";
    }

    return reemplazar(texto, valores);
  };
}

export type Traductor = ReturnType<typeof traductorDe>;
