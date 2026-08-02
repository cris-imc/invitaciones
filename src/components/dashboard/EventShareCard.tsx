"use client";

import { useState, useEffect } from "react";
import { Check, Eye, Pencil, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EventShareCardProps {
  slug: string;
  eventName: string;
  invitationId?: string;
}

export function EventShareCard({ slug, eventName, invitationId }: EventShareCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Control Box: Preview & Quick Edit */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-5 bg-card border rounded-2xl shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-base">Vista Previa & Acciones de la Tarjeta</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Revisá cómo se ve tu invitación pública o editá sus contenidos desde el Wizard.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <Link href={`/i/${slug}`} target="_blank" className="btn-action go inline-flex items-center justify-center h-8 px-3 gap-2 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 transition-colors">
              <Eye className="w-4 h-4" />
              Ver Vista Previa
          </Link>
          
          {invitationId && (
            <Link href={`/dashboard/invitaciones/editar/${invitationId}`}>
              <Button variant="outline" size="sm" className="gap-2 border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10">
                <Pencil className="w-4 h-4" />
                Editar Datos (Wizard)
              </Button>
            </Link>
          )}

        </div>
      </div>

      {/* UX Explanation Banner for WhatsApp Personalization */}
      <div 
        className={`rounded-xl border transition-all duration-700 overflow-hidden ${
          isExpanded ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800" : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="p-4 flex items-start gap-3">
          <Info className={`w-5 h-5 shrink-0 mt-0.5 transition-colors duration-500 ${isExpanded ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
          <div className="space-y-1 text-xs leading-relaxed flex-1">
            <div className="flex justify-between items-center">
              <p className={`font-bold text-sm transition-colors duration-500 ${isExpanded ? "text-indigo-900 dark:text-indigo-200" : "text-slate-600 dark:text-slate-300"}`}>
                📲 ¿Cómo enviar las invitaciones por WhatsApp?
              </p>
              {isExpanded ? (
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-indigo-400 hover:text-indigo-700">
                  <ChevronUp className="w-4 h-4" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
            
            <div className={`transition-all duration-700 overflow-hidden ${isExpanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 m-0"}`}>
              <p className="text-indigo-800 dark:text-indigo-300">
                Para que cada invitado o familia reciba su <strong>enlace personalizado único</strong> (que permite registrar quiénes confirman, cuántos cupos asisten y controlar los pagos), <strong>usá la lista de invitados de abajo</strong>.
              </p>
              <p className="text-indigo-700 dark:text-indigo-400 opacity-90 mt-1">
                Cada invitado tiene su propio botón <strong>📲 Enviar por WhatsApp</strong> al lado de su nombre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
