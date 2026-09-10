"use client";

import { useEffect, useRef } from "react";

interface Props {
  token?: string | null;
}

/**
 * Avisa una vez que este invitado abrió su invitación.
 *
 * No dibuja nada. Va montado desde la página de la invitación y no dentro de
 * las plantillas: es la misma cuenta para las 361 y no tiene nada que ver con
 * el diseño de ninguna.
 */
export function RegistrarApertura({ token }: Props) {
  // React monta dos veces en desarrollo (StrictMode) y el componente puede
  // volver a montarse en una navegación del lado del cliente. Sin esto, una
  // sola visita quedaría contada como dos o tres.
  const yaAvisado = useRef(false);

  useEffect(() => {
    if (!token || yaAvisado.current) return;
    yaAvisado.current = true;

    // keepalive: si la persona mira la portada y cierra enseguida, el pedido
    // igual sale. Sin eso, justo las visitas más cortas -- las que más le
    // importan al anfitrión que está por insistir -- serían las que no se
    // registran.
    fetch(`/api/invite/${encodeURIComponent(token)}/abierta`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Silencio a propósito: el invitado vino a ver la invitación, no a que
      // le aparezca un error porque una métrica no se pudo guardar.
    });
  }, [token]);

  return null;
}
