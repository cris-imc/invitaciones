"use client";

import { useEffect, useState } from "react";
import { ModeloThumbnail } from "./ModeloThumbnail";

interface Item {
  slug: string;
  label: string;
}

type TabId = "xv" | "boda" | "evento";

const TAB_LABELS: Record<TabId, string> = {
  xv: "Modelos XV",
  boda: "Modelos Boda",
  evento: "Modelos Evento",
};

const TAB_ORDER: TabId[] = ["xv", "boda", "evento"];

export function ModelosTabs({ xv, boda, evento }: { xv: Item[]; boda: Item[]; evento: Item[] }) {
  const byTab: Record<TabId, Item[]> = { xv, boda, evento };
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
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {visibleTabs.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={`px-5 py-2 rounded-full text-sm font-ui font-medium transition-colors border ${
              active === id
                ? "bg-[var(--accent)] text-[var(--ink)] border-[var(--accent)]"
                : "bg-transparent text-zinc-400 border-white/15 hover:text-white hover:border-white/30"
            }`}
          >
            {TAB_LABELS[id]}
          </button>
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
