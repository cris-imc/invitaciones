"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("inv-dialog-overlay fixed inset-0 z-[100] bg-black/80", className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * Cuánto del viewport de layout queda tapado por abajo, y cuánto alto hay
 * realmente visible.
 *
 * En iOS la barra de herramientas de Safari se dibuja *encima* del viewport de
 * layout: un `position: fixed; bottom: 0` queda por debajo de ella y el pie del
 * modal se ve cortado. `visualViewport` es lo único que reporta el alto que el
 * usuario ve de verdad, y además se achica cuando aparece el teclado, así que
 * sirve para las dos cosas.
 *
 * Devuelve `null` mientras no haga falta corregir nada (desktop, o navegadores
 * donde el fixed ya cae donde corresponde), para no pisar el CSS sin motivo.
 */
function useVisualViewportFit() {
  const [fit, setFit] = React.useState<{ bottom: number; maxHeight: number } | null>(null);

  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // La hoja pegada abajo sólo existe en la variante angosta; en desktop el
      // modal va centrado y no hay nada que corregir.
      if (window.innerWidth >= 640) return setFit(null);
      const tapado = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setFit({ bottom: tapado, maxHeight: Math.round(vv.height) });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return fit;
}

/**
 * Un panel centrado, del alto que pida su contenido y con un techo a partir del
 * cual lo de adentro se desliza. Es lo que se espera de un modal y lo que se ve
 * igual en celular y en escritorio.
 *
 * El alto va en `svh` y no en `vh` porque en mobile `vh` mide la pantalla sin la
 * barra del navegador: con la barra visible, el pie del modal queda tapado.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /**
     * Cómo se planta el modal en celular. En desktop los tres son iguales: un
     * panel centrado.
     *
     * - "centered" (por defecto): en el medio, con aire a los costados y alto
     *   según el contenido, hasta un techo a partir del cual scrollea.
     * - "sheet": sube desde el borde inferior. Queda pegado abajo, que en
     *   pantallas altas deja el contenido lejos de la vista.
     */
    variant?: "sheet" | "centered";
  }
>(({ className, children, style, onOpenAutoFocus, variant = "centered", ...props }, ref) => {
  const viewportFit = useVisualViewportFit();
  // Las dos variantes que tocan el borde inferior necesitan saber cuánto tapan
  // la barra del navegador y el teclado; la centrada flota en el medio y no.
  const fit = variant === "centered" ? null : viewportFit;
  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={fit ? { bottom: fit.bottom, maxHeight: fit.maxHeight, ...style } : style}
      onOpenAutoFocus={(event) => {
        onOpenAutoFocus?.(event);
        if (event.defaultPrevented) return;
        // Radix enfoca el primer control del modal. En celular eso levanta el
        // teclado apenas se abre y tapa medio modal antes de que el usuario
        // haya decidido escribir. El foco entra igual al panel -- hace falta
        // para Escape y para los lectores de pantalla -- pero no a un campo.
        event.preventDefault();
        (event.currentTarget as HTMLElement | null)?.focus();
      }}
      className={cn(
        variant === "sheet" ? "inv-dialog-sheet" : "inv-dialog-centered",
        "fixed z-[100] flex flex-col gap-4 border bg-background shadow-lg",
        variant === "sheet" && [
          // Celular: hoja al ras de abajo. El padding de abajo respeta la barra
          // de gestos del sistema, que si no se come el último botón.
          "inset-x-0 bottom-0 max-h-[88svh] rounded-t-2xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3",
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-lg",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:p-6",
        ],
        variant === "centered" && [
          // En el medio, con aire a los costados en vez de ir de borde a borde.
          "left-1/2 top-1/2 max-h-[85svh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl p-5 sm:rounded-lg sm:p-6",
        ],
        // Los modales que no separan su cuerpo con <DialogBody> scrollean
        // enteros: siguen andando sin tocarlos, solo que ahora con techo.
        "overflow-y-auto overscroll-contain has-[[data-dialog-body]]:overflow-hidden",
        className
      )}
      {...props}
    >
      {/* La barra de arrastre no hace nada por si sola: esta para que se lea
          como hoja deslizable y no como un cartel que cayo en el medio. En un
          modal centrado no viene al caso, porque no se desliza de ningun lado. */}
      {variant === "sheet" && (
        <div
          aria-hidden
          className="mx-auto h-1 w-10 shrink-0 rounded-full bg-foreground/20 sm:hidden"
        />
      )}
      {children}
      {/* En el celular se toca con el dedo: el area de toque es de 44px aunque
          la cruz siga siendo chica. */}
      <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sm:right-4 sm:top-4 sm:h-8 sm:w-8">
        <X className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * El cuerpo scrolleable del modal. Con esto el encabezado y el pie quedan fijos
 * y solo se desliza lo del medio, que es lo que hace que el modal mida siempre
 * lo mismo tenga tres filas o treinta.
 *
 * `min-h-0` es lo que permite que se encoja dentro del flex: sin eso el hijo
 * crece a su tamaño natural y empuja el pie fuera de la pantalla.
 */
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-dialog-body=""
    className={cn(
      // Los margenes negativos llevan la barra de scroll al borde del modal, en
      // vez de dejarla flotando adentro del padding.
      "-mx-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:-mx-6 sm:px-6",
      className
    )}
    {...props}
  />
))
DialogBody.displayName = "DialogBody"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Alineado a la izquierda tambien en celular: centrado obliga a leer en
      // zigzag contra el resto del contenido, que va alineado a la izquierda.
      // El aire de la derecha es para no pasar por abajo de la cruz de cerrar.
      "flex shrink-0 flex-col space-y-1.5 pr-10 text-left sm:pr-8",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // En celular los botones van apilados y a lo ancho, con la accion
      // principal abajo de todo: es donde llega el pulgar.
      "flex shrink-0 flex-col-reverse gap-2 max-sm:[&>*]:w-full sm:flex-row sm:justify-end sm:gap-0 sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
