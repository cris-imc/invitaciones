/**
 * La planilla que se le manda al salón: quién se sienta dónde y qué no come.
 *
 * POR QUÉ EXISTE. El plano de mesas vive en la pantalla del anfitrión, y el
 * salón necesita el mismo dato en papel o en Excel el día anterior. Hasta
 * ahora había que copiarlo a mano, y las restricciones alimentarias -- que
 * las contesta cada invitado al confirmar -- estaban en otra pantalla
 * distinta. La cocina no arma los platos por invitado: los arma por mesa, así
 * que las dos cosas tienen que salir juntas o no sirve.
 *
 * POR QUÉ CSV Y NO UN .xlsx DE VERDAD. Excel lo abre de un doble clic y no
 * agrega una dependencia de 800 kB al panel para generar un formato que acá
 * no necesita ni fórmulas ni formato. Es el mismo camino que ya usan la lista
 * de invitados y la playlist del DJ.
 *
 * QUIEN NO ESTÁ SENTADO TAMBIÉN VA, al final y marcado. Una planilla que sólo
 * trae a los ubicados le esconde al salón justo a los que faltan resolver.
 */

export interface MesaDeLaPlanilla {
  numero: number;
  alias: string | null;
  sillas: number;
  lugares: { guestId: string; lugares: number }[];
}

export interface InvitadoDeLaPlanilla {
  id: string;
  name: string;
  status: string;
  dietaryRestrictions?: string | null;
  /** Cuánta gente hay que sentar de este invitado. */
  aSentar: number;
}

export interface FilaDeLaPlanilla {
  mesa: string;
  invitado: string;
  personas: number;
  restricciones: string;
  estado: string;
}

const ESTADOS: Record<string, string> = {
  CONFIRMED: "Confirmado",
  DECLINED: "No viene",
  PENDING: "Sin responder",
};

/** Lo que Excel muestra en la columna de la mesa. */
function nombreDeMesa(m: MesaDeLaPlanilla): string {
  return m.alias ? `${m.alias} (mesa ${m.numero})` : `Mesa ${m.numero}`;
}

/**
 * Arma las filas, en el orden en que las va a leer el salón: mesa por mesa y,
 * adentro de cada una, por nombre.
 */
export function filasDeLaPlanilla(
  mesas: MesaDeLaPlanilla[],
  invitados: InvitadoDeLaPlanilla[]
): FilaDeLaPlanilla[] {
  const porId = new Map(invitados.map((g) => [g.id, g]));
  const filas: FilaDeLaPlanilla[] = [];
  const sentados = new Set<string>();

  const ordenadas = [...mesas].sort((a, b) => a.numero - b.numero);

  for (const m of ordenadas) {
    const deEstaMesa = m.lugares
      .map((l) => ({ lugar: l, g: porId.get(l.guestId) }))
      .filter((x): x is { lugar: { guestId: string; lugares: number }; g: InvitadoDeLaPlanilla } => Boolean(x.g))
      .sort((a, b) => a.g.name.localeCompare(b.g.name, "es"));

    // Una mesa sin nadie igual figura: el salón la tiene que armar, y una
    // planilla donde no aparece le dice que esa mesa no existe.
    if (deEstaMesa.length === 0) {
      filas.push({
        mesa: nombreDeMesa(m),
        invitado: "(sin invitados asignados)",
        personas: 0,
        restricciones: "",
        estado: "",
      });
      continue;
    }

    for (const { lugar, g } of deEstaMesa) {
      sentados.add(g.id);
      filas.push({
        mesa: nombreDeMesa(m),
        invitado: g.name,
        // Los lugares QUE OCUPA EN ESTA MESA, no los que tiene en total: una
        // familia de seis puede quedar cuatro en una mesa y dos en otra, y al
        // salón le importa cuántos platos pone en cada una.
        personas: lugar.lugares,
        restricciones: (g.dietaryRestrictions || "").trim(),
        estado: ESTADOS[g.status] ?? g.status,
      });
    }
  }

  // Los que todavía no tienen mesa, al final. Los que avisaron que no vienen
  // no van: no hay nada que resolver con ellos.
  const sinMesa = invitados
    .filter((g) => !sentados.has(g.id) && g.status !== "DECLINED" && g.aSentar > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  for (const g of sinMesa) {
    filas.push({
      mesa: "SIN MESA",
      invitado: g.name,
      personas: g.aSentar,
      restricciones: (g.dietaryRestrictions || "").trim(),
      estado: ESTADOS[g.status] ?? g.status,
    });
  }

  return filas;
}

/**
 * El CSV, listo para abrir con Excel.
 *
 * Punto y coma y no coma: es lo que espera el Excel en español, y los nombres
 * y las restricciones traen comas todo el tiempo ("sin TACC, vegetariano").
 * Y arranca con BOM, sin el cual Excel se come los acentos.
 */
export function planillaDelSalonCsv(
  mesas: MesaDeLaPlanilla[],
  invitados: InvitadoDeLaPlanilla[]
): string {
  const filas = filasDeLaPlanilla(mesas, invitados);
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;

  const encabezado = ["Mesa", "Invitado", "Personas", "Restricciones alimentarias", "Estado"]
    .map(esc)
    .join(";");

  const cuerpo = filas
    .map((f) => [esc(f.mesa), esc(f.invitado), String(f.personas), esc(f.restricciones), esc(f.estado)].join(";"))
    .join("\n");

  const total = filas.filter((f) => f.mesa !== "SIN MESA").reduce((a, f) => a + f.personas, 0);
  const faltan = filas.filter((f) => f.mesa === "SIN MESA").reduce((a, f) => a + f.personas, 0);

  // Una línea de totales al pie: es lo primero que mira el salón para saber
  // cuántos cubiertos poner.
  const pie = [
    "",
    [esc("TOTAL SENTADOS"), esc(""), String(total), esc(""), esc("")].join(";"),
    faltan > 0 ? [esc("TOTAL SIN MESA"), esc(""), String(faltan), esc(""), esc("")].join(";") : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return "﻿" + encabezado + "\n" + cuerpo + pie;
}
