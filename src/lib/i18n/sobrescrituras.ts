import type { CodigoPais } from "@/lib/paises";
import type { Idioma } from "./idiomas";

/**
 * Textos que cambian por PAÍS, no por idioma.
 *
 * El caso que obliga a que exista: en Estados Unidos no se festejan los
 * quince, se festejan los Sweet 16 -- un año después y con otro nombre.
 *
 * Podría parecer que alcanza con traducirlo en el diccionario inglés, porque
 * el inglés se le sirve a Estados Unidos. Pero el idioma de una INVITACIÓN se
 * elige aparte del país: un argentino que casa a su hija en Miami manda la
 * invitación en inglés, y eso sigue siendo una quinceañera. Si el cambio
 * colgara del idioma, esa invitación diría "Sweet 16", que es otra fiesta.
 *
 * Por eso el diccionario inglés dice "quinceañera" -- que es la palabra que
 * se usa en inglés para esa fiesta -- y acá se sobrescribe sólo cuando el
 * país es Estados Unidos.
 */

/**
 * Las sobrescrituras cuelgan de PAÍS + IDIOMA, y que dependan también del
 * idioma no es un detalle de implementación: es lo que hace que el caso
 * difícil salga bien.
 *
 * En Estados Unidos pasan las dos cosas. Una familia latina festeja la
 * quinceañera de su hija, en español y con el 15; y una familia
 * angloparlante festeja el Sweet 16, en inglés y con el 16. El país solo no
 * alcanza para distinguirlas -- el idioma que eligió el anfitrión sí.
 *
 * Por eso US + inglés dice Sweet 16, y US + español sigue diciendo
 * quinceañera. Las dos son correctas, cada una para quien la manda.
 */
type Sobrescrituras = Partial<Record<Idioma, Record<string, string>>>;

/**
 * HOY NO HAY NINGUNA SOBRESCRITURA, y es una decisión, no un olvido.
 *
 * Acá vivía el caso del Sweet 16: en Estados Unidos, en inglés, los quince
 * pasaban a ser un Sweet 16 -- otro nombre, otra edad y otro número en la
 * portada. Se sacó porque el público de Estados Unidos para este producto es
 * la comunidad hispana, que festeja los quince igual que en el resto de
 * Latinoamérica. Mostrarle "Sweet 16" a una familia que está organizando unos
 * quince era cambiarle la fiesta.
 *
 * El mecanismo queda porque el problema que resuelve es real y va a volver
 * apenas haya un país que llame distinto a algo (o si algún día se apunta
 * también al público angloparlante de Estados Unidos): sumar un país es
 * agregarle una entrada a este objeto.
 */
const POR_PAIS: Partial<Record<CodigoPais, Sobrescrituras>> = {};

/** El texto propio de ese país para esa clave, si lo hay. */
export function sobrescritura(
  pais: string | null | undefined,
  idioma: Idioma,
  clave: string
): string | undefined {
  if (!pais) return undefined;
  return POR_PAIS[pais as CodigoPais]?.[idioma]?.[clave];
}
