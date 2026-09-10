"use client";

import { createContext, useContext } from "react";
import type { FuenteDeDatos } from "@/lib/datos-bancarios";

/**
 * Los datos de la invitación que hacen falta abajo de todo del árbol.
 *
 * Existe por una razón concreta: `BankDetailsCard` lo llaman 360 plantillas y
 * casi siempre desde subcomponentes donde la invitación no está en scope.
 * Para que la tarjeta pueda mostrar los datos bancarios del país
 * correspondiente -- una clave PIX en Brasil, una CLABE en México -- necesita
 * el país y el JSON de la invitación, y pasárselos por props serían 720
 * llamadas a tocar. Mismo criterio que `data-plan-tier` en la ruta del
 * invitado, que ya resuelve así el ocultar la marca de agua.
 *
 * Si no hay proveedor arriba (una vista previa suelta, una prueba), la
 * tarjeta sigue funcionando como antes con las columnas de Argentina.
 */
const Contexto = createContext<FuenteDeDatos | null>(null);

export function ProveedorInvitacion({
  datos,
  children,
}: {
  datos: FuenteDeDatos;
  children: React.ReactNode;
}) {
  return <Contexto.Provider value={datos}>{children}</Contexto.Provider>;
}

export function useDatosDeInvitacion(): FuenteDeDatos | null {
  return useContext(Contexto);
}
