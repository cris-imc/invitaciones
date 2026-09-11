"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Loader2, AlertTriangle, X } from "lucide-react";
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

  const resultado = useMemo(() => interpretarLista(texto), [texto]);
  const hayAlgo = texto.trim().length > 0;

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
    <div className="rounded-xl border border-white/10 bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Pegar una lista de invitados
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Una línea por invitado o grupo. Podés pegar desde el celular, un mail
            o una planilla.
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={EJEMPLO}
        rows={7}
        disabled={importando}
        className="w-full rounded-lg bg-black/25 border border-white/10 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--accent)] placeholder:text-white/20 disabled:opacity-50"
      />

      {!hayAlgo && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sólo el nombre es un invitado individual. Con un número es un grupo
          (&quot;Los Rodríguez, 4&quot;). Si detallás las edades las carga
          (&quot;2 adultos, 1 niño&quot;), y si ponés un total y sólo algunas
          edades, el resto van como adultos.
        </p>
      )}

      {hayAlgo && (
        <>
          {/* La tabla de qué entendió. Es el corazón de esto: sin verla, uno
              importa setenta invitados a ciegas. */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="max-h-[280px] overflow-y-auto">
              <table className="w-full text-xs">
                <tbody>
                  {resultado.lineas.map((l) => (
                    <FilaPrevia key={l.linea} l={l} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="text-emerald-400 font-semibold">
              {resultado.validas} {resultado.validas === 1 ? "línea lista" : "líneas listas"}
            </span>
            <span className="text-muted-foreground">
              {resultado.totalPersonas} personas en total
            </span>
            {resultado.conError > 0 && (
              <span className="text-red-400">
                {resultado.conError} sin importar
              </span>
            )}
          </div>

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
    </div>
  );
}

function FilaPrevia({ l }: { l: LineaImportada }) {
  if (l.error) {
    return (
      <tr className="border-b border-white/5 last:border-0 bg-red-500/5">
        <td className="px-2.5 py-1.5 text-red-300/80 line-through truncate max-w-0 w-1/2">
          {l.original}
        </td>
        <td className="px-2.5 py-1.5 text-red-400 text-right">{l.error}</td>
      </tr>
    );
  }

  const franjas = [
    l.adultos > 0 && `${l.adultos} adultos`,
    l.adolescentes > 0 && `${l.adolescentes} adol.`,
    l.ninos > 0 && `${l.ninos} niños`,
  ].filter(Boolean);

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-2.5 py-1.5 font-medium truncate max-w-0 w-1/2">{l.nombre}</td>
      <td className="px-2.5 py-1.5 text-right text-muted-foreground">
        <span className={l.esGrupo ? "text-[var(--accent)]" : ""}>
          {l.esGrupo ? `Grupo de ${l.total}` : "Individual"}
        </span>
        {franjas.length > 0 && l.esGrupo && (
          <span className="ml-1.5 opacity-60">({franjas.join(" · ")})</span>
        )}
        {l.aviso && (
          <span className="block text-[10px] text-amber-400/90 leading-tight">{l.aviso}</span>
        )}
      </td>
    </tr>
  );
}
