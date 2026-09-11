/**
 * Leer una lista de invitados pegada como texto.
 *
 * Se eligió pegar texto y no subir un CSV a propósito: un CSV obliga a abrir
 * Excel, elegir separador y lidiar con acentos rotos. Para alguien no técnico
 * -- que es quien organiza un casamiento -- eso es una barrera más alta que
 * cargar los invitados de a uno, que era justamente el problema a resolver.
 *
 * La sintaxis es tolerante porque nadie va a leer un instructivo antes de
 * pegar una lista:
 *
 *     Juan Gómez                                    -> individual
 *     Familia Pérez, 4                              -> grupo de 4
 *     Los Rodríguez, 2 adultos, 1 niño              -> grupo de 3, con franjas
 *     Ana y Marcos (2)                              -> grupo de 2
 *     Flia Gómez 5                                  -> "Familia Gómez", grupo de 5
 *
 * Nada se guarda al interpretar: esto sólo devuelve qué entendió de cada
 * línea, para que el anfitrión lo revise en una tabla y corrija antes de
 * confirmar.
 */

export type FranjaEdad = "adultos" | "adolescentes" | "ninos";

export interface LineaImportada {
  /** El número de línea original, para poder señalarla en la tabla. */
  linea: number;
  /** El texto tal como lo pegó, por si hay que mostrarlo. */
  original: string;
  nombre: string;
  esGrupo: boolean;
  total: number;
  adultos: number;
  adolescentes: number;
  ninos: number;
  /** Qué no cerró. Si hay error, la línea no se importa. */
  error: string | null;
  /** Algo raro pero importable. Se muestra sin bloquear. */
  aviso: string | null;
}

const MAX_POR_GRUPO = 50;

// Cómo puede escribir cada franja alguien que no leyó ninguna instrucción.
const SINONIMOS: { franja: FranjaEdad; palabras: RegExp }[] = [
  { franja: "adultos", palabras: /\b(adultos?|mayores?|grandes?)\b/i },
  { franja: "adolescentes", palabras: /\b(adolescentes?|adol|teens?|jóvenes?|jovenes?)\b/i },
  { franja: "ninos", palabras: /\b(niños?|ninos?|nenes?|chicos?|menores?|infantes?)\b/i },
];

// "Flia", "Flia.", "Fam." -- así escribe medio mundo una lista de
// casamiento. Antes quedaba tal cual, y "Flia Gómez" y "Familia Gómez"
// terminaban siendo dos nombres distintos para la misma gente: el aviso de
// repetidos no los agarra y en el salón aparecen dos veces.
const ABREVIATURAS: { corta: RegExp; larga: string }[] = [
  { corta: /^(?:flia|flía|fam)\.?\s+/i, larga: "Familia " },
];

function expandirAbreviaturas(nombre: string): string {
  for (const a of ABREVIATURAS) {
    if (a.corta.test(nombre)) return nombre.replace(a.corta, a.larga);
  }
  return nombre;
}

// Nombres que anuncian un grupo aunque no digan cuántos: "Familia Pérez",
// "Los Rodríguez". El número no se puede adivinar -- pero sí avisar, que es
// mejor que cargarlos como una persona sola y que se entere en la fiesta.
const SUENA_A_GRUPO = /^(?:familia|flia|flía|fam|los|las)\b/i;

// Palabras que acompañan a una cantidad sin aportar nada: "5 personas",
// "4 pax". Se ignoran igual que las franjas al decidir si un número que
// aparece dentro del nombre es realmente la cantidad del grupo.
const RELLENO = /^(?:personas?|invitados?|pax|cubiertos?|lugares?|y|e|de|mas|más|\+)$/i;

/**
 * ¿Lo que viene después del nombre son cantidades y nada más?
 *
 * Es la diferencia entre "Flia Gómez 5" (un grupo de cinco) y "Los 3
 * Chiflados" (un nombre que tiene un número adentro). Sin esta pregunta, el
 * segundo se cargaba como un grupo de tres llamado "Los".
 */
function esSoloCantidades(texto: string): boolean {
  const palabras = texto.trim().split(/[\s,]+/).filter(Boolean);
  if (palabras.length === 0) return false;
  return palabras.every(
    (p) =>
      /^\d+$/.test(p) ||
      RELLENO.test(p) ||
      SINONIMOS.some((s) => s.palabras.test(p))
  );
}

/** Quita numeración de lista ("1.", "-", "•") que suele venir al pegar. */
function limpiarPrefijo(texto: string): string {
  return texto.replace(/^\s*(?:\d+[.)]\s*|[-–—*•]\s*)/, "").trim();
}

function parsearLinea(bruta: string, numero: number): LineaImportada | null {
  const original = bruta.trim();
  if (!original) return null;

  const texto = limpiarPrefijo(original);
  if (!texto) return null;

  const base: LineaImportada = {
    linea: numero,
    original,
    nombre: "",
    esGrupo: false,
    total: 1,
    adultos: 0,
    adolescentes: 0,
    ninos: 0,
    error: null,
    aviso: null,
  };

  // "Ana y Marcos (2)" -- el paréntesis final se trata igual que una coma.
  const conParentesis = texto.match(/^(.*?)\s*\((\d+)\)\s*$/);
  const cuerpo = conParentesis ? `${conParentesis[1]}, ${conParentesis[2]}` : texto;

  const partes = cuerpo.split(",").map((p) => p.trim()).filter(Boolean);
  let nombre = partes.shift() ?? "";

  // Sin ninguna coma, pero con un número adentro: "Flia Gómez 5", "Familia
  // Pérez 2 adultos 1 niño". Es como escribe media lista, y antes el número
  // se quedaba pegado al nombre: el grupo entraba como un invitado solo
  // llamado "Flia Gómez 5". Se corta en el primer número y lo que sigue se
  // lee igual que si hubiera puesto la coma.
  if (partes.length === 0) {
    const corte = nombre.search(/\s\d/);
    // Sólo si lo que sigue al número son cantidades, y no un nombre que
    // casualmente tiene un número adentro: "Los 3 Chiflados" es un nombre
    // entero, no un grupo de tres apellidado "Los".
    if (corte > 0 && esSoloCantidades(nombre.slice(corte + 1))) {
      partes.push(nombre.slice(corte + 1).trim());
      nombre = nombre.slice(0, corte).trim();
    }
  }

  nombre = expandirAbreviaturas(nombre);

  if (!nombre) {
    return { ...base, error: "No encontré un nombre" };
  }
  if (nombre.length > 80) {
    return { ...base, nombre: nombre.slice(0, 80), error: "El nombre es demasiado largo" };
  }
  base.nombre = nombre;

  if (partes.length === 0) {
    // Sólo un nombre: individual. Si el nombre anuncia un grupo se avisa,
    // porque casi siempre es que se olvidó de poner cuántos son.
    return {
      ...base,
      total: 1,
      adultos: 1,
      aviso: SUENA_A_GRUPO.test(nombre)
        ? "Parece un grupo pero no dice cuántos. Lo cargo como 1."
        : null,
    };
  }

  // Se buscan pares "número + palabra" en todo el resto de la línea, no parte
  // por parte: nadie separa siempre con comas. "2 mayores y 1 nene" viene en
  // una sola parte y tiene dos franjas adentro.
  const resto = partes.join(" , ");
  let totalExplicito: number | null = null;
  const franjas: Record<FranjaEdad, number> = { adultos: 0, adolescentes: 0, ninos: 0 };
  const noEntendidas: string[] = [];

  const pares = [...resto.matchAll(/(\d+)\s*(?:de\s+)?([a-záéíóúñ]+)?/gi)];
  if (pares.length === 0) {
    return { ...base, error: `No entendí "${resto}"` };
  }

  for (const par of pares) {
    const cantidad = parseInt(par[1], 10);
    const palabra = (par[2] ?? "").trim();
    if (!Number.isFinite(cantidad) || cantidad < 0) continue;

    const conFranja = SINONIMOS.find((s) => palabra && s.palabras.test(palabra));
    if (conFranja) {
      franjas[conFranja.franja] += cantidad;
    } else {
      // Número sin franja: es el total del grupo. Se queda el último, que es
      // lo que uno esperaría si escribió dos.
      totalExplicito = cantidad;
    }
  }

  // Lo que quedó sin número ni sentido, para avisar sin bloquear.
  const sobrante = resto
    .replace(/(\d+)\s*(?:de\s+)?([a-záéíóúñ]+)?/gi, " ")
    .replace(/[\s,]+|(\by\b|\be\b)/gi, " ")
    .trim();
  if (sobrante) noEntendidas.push(sobrante);

  const sumaFranjas = franjas.adultos + franjas.adolescentes + franjas.ninos;

  if (sumaFranjas > 0) {
    base.adultos = franjas.adultos;
    base.adolescentes = franjas.adolescentes;
    base.ninos = franjas.ninos;
    base.total = sumaFranjas;

    if (totalExplicito !== null && totalExplicito > sumaFranjas) {
      // "5, 2 niños" = cinco personas, dos de ellas niños. El resto son
      // adultos: es la lectura natural y evita hacerle escribir lo obvio.
      base.adultos += totalExplicito - sumaFranjas;
      base.total = totalExplicito;
    } else if (totalExplicito !== null && totalExplicito < sumaFranjas) {
      // Acá sí hay contradicción. Mandan las franjas, que son más
      // específicas, y se avisa en vez de elegir en silencio.
      base.aviso = `Dice ${totalExplicito} pero las franjas suman ${sumaFranjas}. Uso ${sumaFranjas}.`;
    }

    base.esGrupo = base.total > 1;
  } else if (totalExplicito !== null) {
    if (totalExplicito < 1) {
      return { ...base, error: "La cantidad tiene que ser al menos 1" };
    }
    base.total = totalExplicito;
    base.esGrupo = totalExplicito > 1;
    base.adultos = totalExplicito;
  } else {
    return {
      ...base,
      error: `No entendí "${noEntendidas.join(", ")}"`,
    };
  }

  if (base.total > MAX_POR_GRUPO) {
    return { ...base, error: `${base.total} personas en un grupo es demasiado` };
  }

  if (noEntendidas.length > 0 && !base.aviso) {
    base.aviso = `Ignoré "${noEntendidas.join(", ")}"`;
  }

  return base;
}

/**
 * Cuántas líneas entran en el cupo que queda del plan.
 *
 * Cuenta PERSONAS, no renglones: una familia de cinco se lleva cinco lugares.
 * Y corta en la primera que no entra en vez de seguir buscando alguna más
 * chica -- importar salteado dejaría una lista distinta de la que se pegó, y
 * el orden de la lista es el que la persona entiende.
 */
export function cuantasEntran(lineas: LineaImportada[], cupo: number): number {
  let lugares = cupo;
  let n = 0;
  for (const l of lineas) {
    if (l.error) continue;
    if (l.total > lugares) break;
    lugares -= l.total;
    n++;
  }
  return n;
}

export interface ResultadoImportacion {
  lineas: LineaImportada[];
  validas: number;
  conError: number;
  totalPersonas: number;
  duplicadosEnLaLista: string[];
}

export function interpretarLista(texto: string): ResultadoImportacion {
  const lineas: LineaImportada[] = [];
  texto.split(/\r?\n/).forEach((l, i) => {
    const r = parsearLinea(l, i + 1);
    if (r) lineas.push(r);
  });

  // Nombres repetidos dentro de lo pegado. No es un error -- puede haber dos
  // "Familia Pérez" de verdad -- pero casi siempre es una línea duplicada por
  // accidente al copiar, y conviene que lo vea antes de importar.
  const vistos = new Map<string, number>();
  const duplicados: string[] = [];
  for (const l of lineas) {
    if (l.error) continue;
    const clave = l.nombre.toLowerCase().trim();
    const n = (vistos.get(clave) ?? 0) + 1;
    vistos.set(clave, n);
    if (n === 2) duplicados.push(l.nombre);
  }

  const validas = lineas.filter((l) => !l.error);

  return {
    lineas,
    validas: validas.length,
    conError: lineas.length - validas.length,
    totalPersonas: validas.reduce((a, l) => a + l.total, 0),
    duplicadosEnLaLista: duplicados,
  };
}
