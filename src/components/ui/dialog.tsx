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
 * En celular es una hoja que sube desde abajo; en desktop, el modal centrado de
 * siempre.
 *
 * Un modal centrado en un celular queda lejos del pulgar, con las esquinas
 * colgando en el aire y sin techo: si el contenido crece, se va de la pantalla y
 * los botones del pie quedan abajo de todo. La hoja arranca desde el borde por
 * el que aparece, ocupa el ancho completo y tiene alto máximo, así que el modal
 * siempre mide lo mismo y lo que sobra se desliza adentro.
 *
 * El alto va en `svh` y no en `vh` porque en mobile `vh` mide la pantalla sin la
 * barra del navegador: con la barra visible, el pie del modal queda tapado.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "inv-dialog-sheet fixed z-[100] flex flex-col gap-4 border bg-background shadow-lg",
        // Celular: hoja al ras de abajo. El padding de abajo respeta la barra de
        // gestos del sistema, que si no se come el último botón.
        "inset-x-0 bottom-0 max-h-[88svh] rounded-t-2xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3",
        // Desktop: centrado, con techo para que un modal largo no se estire mas
        // alla de la ventana.
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-lg",
        "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:p-6",
        // Los modales que no separan su cuerpo con <DialogBody> scrollean
        // enteros: siguen andando sin tocarlos, solo que ahora con techo.
        "overflow-y-auto overscroll-contain has-[[data-dialog-body]]:overflow-hidden",
        className
      )}
      {...props}
    >
      {/* La barra de arrastre no hace nada por si sola: esta para que se lea
          como hoja deslizable y no como un cartel que cayo en el medio. */}
      <div
        aria-hidden
        className="mx-auto h-1 w-10 shrink-0 rounded-full bg-foreground/20 sm:hidden"
      />
      {children}
      {/* En el celular se toca con el dedo: el area de toque es de 44px aunque
          la cruz siga siendo chica. */}
      <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sm:right-4 sm:top-4 sm:h-8 sm:w-8">
        <X className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
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
