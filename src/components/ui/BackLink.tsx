"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Botón "volver" estándar del sitio: mismo estilo (ghost, chico, flecha +
 * texto) en todos los lugares donde se sale de la pantalla actual hacia
 * otra página. No usar para "Atrás" de navegación entre pasos de un wizard
 * (eso es un concepto distinto: moverse dentro del mismo flujo, no salir
 * de él) — para eso siguen los botones propios de cada wizard.
 *
 * confirmIfDirty: si este back-link vive arriba de un wizard, chequea
 * isDirty del wizard-store y pide confirmación antes de salir (mismo aviso
 * que ya usan el Sidebar y los botones internos del wizard).
 *
 * isNewInvitation: la invitación todavía no existe en la base (se está
 * creando, no editando) -- no hay ningún "guardado" previo del que estar
 * desviándose, así que el aviso usa otra copia ("vas a perder lo que
 * cargaste" en vez de "cambios sin guardar").
 */
export function BackLink({
  href,
  label = "Volver",
  className,
  confirmIfDirty = false,
  isNewInvitation = false,
}: {
  href: string;
  label?: string;
  className?: string;
  confirmIfDirty?: boolean;
  isNewInvitation?: boolean;
}) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const isDirty = useWizardStore((s) => s.isDirty);
  const setDirty = useWizardStore((s) => s.setDirty);

  const btnClassName = className ? `gap-1 ${className}` : "gap-1";

  if (!confirmIfDirty) {
    return (
      <Link href={href} className="inline-block">
        <Button variant="ghost" size="sm" className={btnClassName}>
          <ChevronLeft className="w-4 h-4" />
          {label}
        </Button>
      </Link>
    );
  }

  const handleClick = () => {
    if (isDirty) {
      setShowWarning(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewInvitation ? "¿Salir sin terminar?" : "Cambios sin guardar"}</DialogTitle>
            <DialogDescription>
              {isNewInvitation
                ? "Todavía no creaste la invitación. Si salís ahora vas a perder todo lo que cargaste hasta acá."
                : "Tenés cambios sin guardar en la invitación. ¿Estás seguro de que querés salir sin aplicar los cambios?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => { setDirty(false); router.push(href); }}>
              {isNewInvitation ? "Salir y perder los cambios" : "Salir sin guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="sm" className={btnClassName} onClick={handleClick}>
        <ChevronLeft className="w-4 h-4" />
        {label}
      </Button>
    </>
  );
}
