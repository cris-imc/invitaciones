"use client";

import { useEffect, useState } from "react";
import { ModeloThumbnail } from "./ModeloThumbnail";

interface Item {
  slug: string;
  label: string;
}

type TabId = "personalizado" | "xv" | "boda" | "evento";

const TAB_LABELS: Record<TabId, string> = {
  xv: "XV",
  boda: "Boda",
  evento: "Evento",
  personalizado: "Personalizado",
};

const TAB_ORDER: TabId[] = ["boda", "xv", "evento", "personalizado"];

export function ModelosTabs({ xv, boda, evento, personalizado }: { xv: Item[]; boda: Item[]; evento: Item[]; personalizado: Item[] }) {
  const byTab: Record<TabId, Item[]> = { personalizado, xv, boda, evento };
  const visibleTabs = TAB_ORDER.filter((id) => byTab[id].length > 0);
  const [active, setActive] = useState<TabId>(visibleTabs[0] ?? "xv");

  // Los thumbnails de la pestaña recien montada son iframes nuevos que
  // ModelosLazyLoader todavia no vio (su efecto corre una sola vez, al
  // montar la pagina) -- disparar un resize sintetico reusa el mismo
  // listener de scroll/resize para que los detecte y arranque su carga, sin
  // duplicar la logica de concurrencia limitada en otro lado.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    return () => cancelAnimationFrame(id);
  }, [active]);

  if (visibleTabs.length === 0) return null;

  const items = byTab[active] ?? [];

  return (
    <div>
      <div className="flex justify-center items-center gap-6 sm:gap-10 mb-10 flex-wrap">
        {visibleTabs.map((id, i) => (
          <div key={id} className="flex items-center gap-6 sm:gap-10">
            {i > 0 && <span className="h-3 w-px bg-white/15" aria-hidden="true" />}
            <button
              type="button"
              onClick={() => setActive(id)}
              className={`relative pb-2 text-xs sm:text-sm font-ui uppercase tracking-[0.18em] transition-colors ${
                active === id ? "text-[var(--accent)]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {TAB_LABELS[id]}
              <span
                className={`absolute left-0 right-0 -bottom-0.5 h-px transition-opacity ${
                  active === id ? "bg-[var(--accent)] opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 justify-items-center">
        {items.map((m) => (
          <ModeloThumbnail key={m.slug} slug={m.slug} label={m.label} />
        ))}
      </div>
    </div>
  );
}
