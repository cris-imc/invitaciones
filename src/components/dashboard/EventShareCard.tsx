"use client";

import { useState, useEffect } from "react";
import { Check, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function TypewriterText() {
  const text = "Previsualizá el diseño o modificá los detalles en Editar Info...";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 45); // Velocidad de escritura
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-medium text-sm text-slate-600 dark:text-slate-300">
      {displayed}
      <span className="animate-pulse text-amber-500 font-bold ml-0.5">|</span>
    </span>
  );
}

interface EventShareCardProps {
  slug: string;
  eventName: string;
  invitationId?: string;
}

export function EventShareCard({ slug, eventName, invitationId }: EventShareCardProps) {

  return (
    <div className="w-full mb-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes colorCycle {
          0% { background-position: 0% 50%; }
          100% { background-position: -300% 50%; }
        }
        .btn-color-cycle {
          background: linear-gradient(90deg, #f43f5e, #f59e0b, #10b981, #3b82f6, #8b5cf6, #f43f5e);
          background-size: 300% 100%;
          animation: colorCycle 5s linear infinite;
          color: white;
          border: none;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .btn-color-cycle:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      `}} />
      <div className="relative group w-full">
        {/* Efecto de aura/brillo sutil animado */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-amber-500/30 rounded-full blur-md opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
        
        {/* Burbuja Principal */}
        <div className="relative w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-1.5 sm:pl-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 rounded-3xl sm:rounded-full shadow-sm gap-3 sm:gap-6 transition-all duration-300 hover:shadow-md overflow-hidden">

          <div className="flex items-center gap-2.5 min-w-0 pt-2 sm:pt-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="min-w-0 flex-1 truncate">
              <TypewriterText />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link href={`/i/${slug}`} target="_blank" className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 gap-2 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Diseño</span>
            </Link>

            {invitationId && (
              <>
                <Link href={`/dashboard/invitaciones/editar/${invitationId}`} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full h-9 px-5 rounded-full gap-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm border-0">
                    <Pencil className="w-3.5 h-3.5" />
                    Editar Info
                  </Button>
                </Link>
                <Link href={`/dashboard/invitaciones/editar/${invitationId}?step=design`} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full h-9 px-4 rounded-full gap-2 text-xs font-bold shadow-sm btn-color-cycle">
                    Cambiar Plantilla
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
