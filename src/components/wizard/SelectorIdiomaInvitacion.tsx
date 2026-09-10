"use client";

import { useWizardStore } from "@/store/wizard-store";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import { IDIOMAS, NOMBRES_DE_IDIOMA, idiomaSegunPais, esIdiomaValido, type Idioma } from "@/lib/i18n/idiomas";

/**
 * En qué idioma van a ver la invitación los invitados.
 *
 * NO es el idioma del anfitrión. Son dos cosas distintas y confundirlas rompe
 * el producto: alguien puede tener el panel en español y mandar la invitación
 * en inglés porque la boda es en Miami. Y al revés, un invitado con el
 * navegador en inglés que abre un convite de São Paulo lo tiene que ver en
 * portugués, igual que todos los demás -- el idioma viaja con la invitación,
 * no con quien la mira.
 *
 * Arranca en lo que sugiere el país y se puede cambiar. Es un valor inicial y
 * no una regla: preguntárselo a alguien que ya dijo de qué país es sería
 * preguntarle dos veces lo mismo al 95% de la gente.
 */
export function SelectorIdiomaInvitacion() {
  const { data, setData } = useWizardStore();
  const t = useTextos();

  const actual: Idioma = esIdiomaValido(data.idioma)
    ? data.idioma
    : idiomaSegunPais(data.pais);

  return (
    <div className="space-y-2">
      <label htmlFor="idioma-invitacion" className="text-sm font-medium">
        {t("wizard.basicos.idioma")}
      </label>
      <select
        id="idioma-invitacion"
        value={actual}
        onChange={(e) => setData({ idioma: e.target.value })}
        className="campo-nativo bg-[var(--ink-2)] border border-[var(--campo-borde)] text-[var(--on-ink)] h-12 w-full rounded-xl px-4 text-sm"
      >
        {IDIOMAS.map((i) => (
          <option key={i} value={i}>
            {NOMBRES_DE_IDIOMA[i]}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">{t("wizard.basicos.idiomaAyuda")}</p>
    </div>
  );
}
