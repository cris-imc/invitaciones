"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Loader2, AlertTriangle, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { interpretarLista, type LineaImportada } from "@/lib/importar-invitados";

interface Props {
  slug: string;
  /** Para refrescar la lista cuando terminó de importar. */
  onImportado: () => void;
  onCerrar: () => void;
}

const EJEMPLO = `Familia Pérez, 2 adultos, 2 adolescentes, 1 niño
Juan Gómez
Los Rodríguez, 4
Ana y Marcos (2)`;

// Cada renglón del ejemplo con lo que hace, para poder mostrarlo como tabla y
// no como un bloque de texto que hay que descifrar.
const EJEMPLO_EXPLICADO: { linea: string; queHace: string }[] = [
  { linea: "Juan Gómez", queHace: "un invitado solo" },
  { linea: "Los Rodríguez, 4", queHace: "un grupo de 4" },
  { linea: "Flia Gómez 5", queHace: "igual, sin coma" },
  { linea: "Ana y Marcos (2)", queHace: "igual, entre paréntesis" },
  { linea: "Familia Pérez, 2 adultos, 1 niño", queHace: "grupo de 3, con las edades" },
  { linea: "Los Díaz, 5, 2 niños", queHace: "5 en total: 2 niños y 3 adultos" },
];

// Alto de las dos mitades del modal. Es el mismo número para las dos a
// propósito: el campo donde se pega y la revisión tienen que arrancar y
// terminar a la misma altura, o dejan de leerse como dos caras de lo mismo.
const ALTO_PANEL = 300;

// Alto de cada fila de la revisión. Está acá y no sólo en el CSS porque con
// él se calcula cuántas entran sin cortar ninguna por la mitad: una fila
// tajada al ras del borde se lee como un error de la página.
const ALTO_FILA = 27;

// El pie del "+N" ocupa el lugar de una fila.
const CABEN = Math.floor(ALTO_PANEL / ALTO_FILA);

/**
 * Importar invitados pegando una lista.
 *
 * Dos pasos y no uno: primero se ve qué entendió de cada línea, después se
 * confirma. Importar setenta invitados sin poder mirarlos antes es pedirle a
 * alguien que confíe a ciegas en un parser, y el que después tiene que
 * corregir uno por uno es él.
 */
export function ImportarInvitados({ slug, onImportado, onCerrar }: Props) {
  const [texto, setTexto] = useState("");
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [fallidos, setFallidos] = useState<string[]>([]);
  const [verEjemplo, setVerEjemplo] = useState(false);

  const resultado = useMemo(() => interpretarLista(texto), [texto]);
  const hayAlgo = texto.trim().length > 0;

  const avisos = resultado.lineas.filter((l) => !l.error && l.aviso);

  // Qué filas entran en la mitad derecha.
  //
  // LAS ÚLTIMAS, no las primeras: mientras se escribe, la línea que importa es
  // la que se acaba de agregar. Si la lista arrancara por arriba, el renglón
  // recién tipeado sería justamente el que no se ve, que es el único momento
  // en que uno mira esta columna.
  //
  // Y no scrollea: el texto completo está del lado izquierdo. Acá alcanza con
  // saber cuántas quedaron fuera, y eso lo dice el "+N" del pie.
  const { aLaVista, ocultas } = useMemo(() => {
    const todas = resultado.lineas;
    if (todas.length <= CABEN) return { aLaVista: todas, ocultas: 0 };
    // Una fila menos, que es el lugar que se lleva el pie del "+N".
    const entran = CABEN - 1;
    return { aLaVista: todas.slice(-entran), ocultas: todas.length - entran };
  }, [resultado.lineas]);

  const importar = async () => {
    const aImportar = resultado.lineas.filter((l) => !l.error);
    if (aImportar.length === 0) return;

    setImportando(true);
    setProgreso(0);
    const errores: string[] = [];

    // De a uno y en serie, no todos juntos: el endpoint valida el límite de
    // invitados del plan contra el total actual, y setenta pedidos en paralelo
    // leerían todos el mismo total viejo y se pasarían del tope.
    for (let i = 0; i < aImportar.length; i++) {
      const l = aImportar[i];
      try {
        const res = await fetch(`/api/invitations/${slug}/guests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: l.nombre,
            type: l.esGrupo ? "FAMILY" : "INDIVIDUAL",
            expectedCount: l.total,
            expectedAdults: l.adultos,
            expectedTeens: l.adolescentes,
            expectedChildren: l.ninos,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errores.push(`${l.nombre}: ${data.error || "no se pudo agregar"}`);
        }
      } catch {
        errores.push(`${l.nombre}: falló la conexión`);
      }
      setProgreso(i + 1);
    }

    setFallidos(errores);
    setImportando(false);
    onImportado();

    // Sin errores no hay nada más que mirar; con errores, la lista queda
    // abierta para que vea cuáles fallaron y por qué.
    if (errores.length === 0) onCerrar();
  };

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto && !importando) onCerrar();
      }}
    >
      {/* Más ancho que un modal común. Esto vivía dentro de la tarjeta de
          invitados, que es una columna angosta, y ahí la tabla de revisión no
          entraba: los nombres salían cortados ("Familia Pe...") y el detalle
          de cada fila se partía en tres renglones. Con ancho, cada línea
          pegada es una línea de la tabla. */}
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 shrink-0" />
            Pegar una lista de invitados
          </DialogTitle>
          <DialogDescription className="pt-1">
            Una línea por invitado o grupo. Podés pegar desde el celular, un mail
            o una planilla.
          </DialogDescription>
        </DialogHeader>

        {/* Lo que se escribe a la izquierda, lo que se entendió a la derecha,
            a la misma altura y mirándose de frente. Así se corrige mientras se
            escribe en vez de pegar a ciegas y después bajar a revisar.

            En el celular no hay dos mitades: la misma idea, una debajo de la
            otra, que es lo único que entra en 390px de ancho. */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* ── Izquierda: donde se pega ── */}
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Pegá acá
            </p>
            {/* Alto fijo y `resize-none`: si la lista pasa el alto, scrollea
                adentro. Si el campo creciera, las dos mitades dejarían de
                estar a la misma altura y volvería el chorizo. */}
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={EJEMPLO}
              disabled={importando}
              style={{ height: ALTO_PANEL }}
              className="w-full resize-none overflow-y-auto rounded-lg bg-[var(--tinte-1)] border border-[var(--campo-borde)] px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--foreground)]/50 disabled:opacity-50"
            />

            {/* El ejemplo, a mano en todo momento. Antes vivía en el
                placeholder, que desaparece con la primera tecla: justo cuando
                uno duda de cómo se escribe algo, ya no está. */}
            <button
              type="button"
              onClick={() => setVerEjemplo(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              Cómo se escribe cada línea
            </button>
          </div>

          {/* ── Derecha: lo que entendió ── */}
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Lo que entendí
            </p>
            <div
              style={{ height: ALTO_PANEL }}
              className="rounded-lg border border-[var(--campo-borde-suave)] bg-[var(--tinte-1)] overflow-hidden flex flex-col"
            >
              {!hayAlgo ? (
                <p className="m-auto px-4 text-center text-xs text-muted-foreground">
                  Acá vas a ver, línea por línea, qué entendió de lo que pegues.
                </p>
              ) : (
                <>
                  <table className="w-full text-xs table-fixed">
                    <tbody>
                      {aLaVista.map((l) => (
                        <FilaPrevia key={l.linea} l={l} />
                      ))}
                    </tbody>
                  </table>

                  {/* No scrollea: el que quiere ver todo lo tiene entero del
                      lado izquierdo, que para eso es el texto original. Acá
                      alcanza con saber cuántas quedaron fuera de cuadro. */}
                  {ocultas > 0 && (
                    <p className="mt-auto border-t border-[var(--campo-borde-suave)] px-2.5 py-1.5 text-xs text-muted-foreground">
                      +{ocultas} {ocultas === 1 ? "línea más" : "líneas más"}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      <Dialog open={verEjemplo} onOpenChange={setVerEjemplo}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Cómo se escribe cada línea</DialogTitle>
            <DialogDescription className="pt-1">
              Una línea por invitado o grupo. No hay formato obligatorio: se
              entienden todas estas formas.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-[var(--campo-borde-suave)] overflow-hidden mt-2">
            <table className="w-full text-sm">
              <tbody>
                {EJEMPLO_EXPLICADO.map((e) => (
                  <tr
                    key={e.linea}
                    className="align-baseline border-b border-[var(--campo-borde-suave)] last:border-0"
                  >
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{e.linea}</td>
                    {/* Sin esto, los dos ejemplos más largos se parten en dos
                        renglones y la tabla deja de leerse como una lista de
                        equivalencias. */}
                    <td className="px-3 py-2 text-muted-foreground text-right whitespace-nowrap">
                      {e.queHace}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Las edades son opcionales. Si ponés el total y sólo algunas, el
            resto entran como adultos.
          </p>

          <button
            type="button"
            onClick={() => {
              setTexto(EJEMPLO);
              setVerEjemplo(false);
            }}
            className="w-full rounded-full bg-[var(--accent)] text-[var(--ink)] text-sm font-semibold py-2.5 transition-all hover:brightness-110"
          >
            Copiar un ejemplo al campo
          </button>
        </DialogContent>
      </Dialog>

      {hayAlgo && (
        <>
          {/* Los totales, debajo de las dos mitades y a lo ancho: es lo último
              que se mira antes de apretar. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="text-emerald-400 font-semibold">
              {resultado.validas} {resultado.validas === 1 ? "línea lista" : "líneas listas"}
            </span>
            <span className="text-muted-foreground">
              {resultado.totalPersonas} personas en total
            </span>
            {avisos.length > 0 && (
              <span className="text-amber-400">
                {avisos.length} para mirar
              </span>
            )}
            {resultado.conError > 0 && (
              <span className="text-red-400">
                {resultado.conError} sin importar
              </span>
            )}
          </div>

          {/* En la fila el aviso es sólo un triángulo -- ponerle su propio
              renglón rompía el alto parejo del panel. El texto va acá, que
              además es donde se mira antes de apretar, y en el celular se lee
              igual (un `title` ahí no existe). */}
          {avisos.length > 0 && (
            <div className="space-y-1">
              {avisos.slice(0, 3).map((a) => (
                <p key={a.linea} className="flex items-start gap-2 text-xs text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>
                    <strong className="font-semibold">{a.nombre}:</strong> {a.aviso}
                  </span>
                </p>
              ))}
              {avisos.length > 3 && (
                <p className="text-xs text-amber-400/70 pl-5">
                  y {avisos.length - 3} más.
                </p>
              )}
            </div>
          )}

          {resultado.duplicadosEnLaLista.length > 0 && (
            <p className="flex items-start gap-2 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
              <span>
                Hay nombres repetidos ({resultado.duplicadosEnLaLista.join(", ")}).
                Si es a propósito está bien; si se coló al copiar, sacalos antes.
              </span>
            </p>
          )}

          {fallidos.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 space-y-1">
              <p className="text-xs font-semibold text-red-300">
                No se pudieron agregar {fallidos.length}:
              </p>
              {fallidos.slice(0, 5).map((f) => (
                <p key={f} className="text-xs text-red-200/80">{f}</p>
              ))}
              {fallidos.length > 5 && (
                <p className="text-xs text-red-200/60">y {fallidos.length - 5} más…</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={importar}
            disabled={importando || resultado.validas === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-[var(--ink)] text-sm font-semibold py-2.5 transition-all hover:brightness-110 disabled:opacity-40"
          >
            {importando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agregando {progreso} de {resultado.validas}…
              </>
            ) : (
              `Agregar ${resultado.validas} ${resultado.validas === 1 ? "invitado" : "invitados"}`
            )}
          </button>
        </>
      )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Una línea de la revisión: el nombre a la izquierda, qué entendió a la
 * derecha. UN RENGLÓN EXACTO, siempre.
 *
 * Que midan todas lo mismo no es sólo prolijidad: con eso se calcula cuántas
 * entran en el panel (ver ALTO_FILA). Una sola fila de dos renglones y la
 * última queda cortada por la mitad contra el borde.
 *
 * Por eso el nombre se recorta y el detalle no se parte. Es la misma decisión
 * mirada de los dos lados: si ninguno cede, "Grupo de 2 (2 adultos)" ocupa
 * tres renglones. Cede el nombre, que se lee entero del lado izquierdo, tal
 * como lo escribió.
 *
 * El aviso va como triángulo, con el texto en el `title` y contado abajo en
 * "N para mirar": puesto en su propio renglón era justamente lo que rompía el
 * alto parejo.
 */
function FilaPrevia({ l }: { l: LineaImportada }) {
  const clasesFila =
    "border-b border-[var(--campo-borde-suave)] last:border-0 h-[27px]";

  if (l.error) {
    return (
      <tr className={`${clasesFila} bg-red-500/5`} title={l.error}>
        <td className="px-2.5 text-red-300/80 line-through truncate">{l.original}</td>
        <td className="px-2.5 text-red-400 text-right truncate">{l.error}</td>
      </tr>
    );
  }

  const franjas = [
    l.adultos > 0 && `${l.adultos} adultos`,
    l.adolescentes > 0 && `${l.adolescentes} adol.`,
    l.ninos > 0 && `${l.ninos} niños`,
  ].filter(Boolean);

  return (
    <tr className={clasesFila}>
      <td className="px-2.5 font-medium truncate">
        <span className="inline-flex items-center gap-1 max-w-full">
          {l.aviso && (
            <AlertTriangle
              className="w-3 h-3 shrink-0 text-amber-400"
              aria-label={l.aviso}
            />
          )}
          <span className="truncate" title={l.aviso ?? undefined}>
            {l.nombre}
          </span>
        </span>
      </td>
      <td className="px-2.5 text-right text-muted-foreground truncate">
        <span className={l.esGrupo ? "text-[var(--accent)]" : ""}>
          {l.esGrupo ? `Grupo de ${l.total}` : "Individual"}
        </span>
        {franjas.length > 0 && l.esGrupo && (
          <span className="ml-1.5 opacity-60">({franjas.join(" · ")})</span>
        )}
      </td>
    </tr>
  );
}
