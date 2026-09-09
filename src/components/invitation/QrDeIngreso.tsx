"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  guest?: {
    name?: string;
    uniqueToken?: string;
    mesas?: string[] | null;
    qrIngreso?: boolean;
  } | null;
}

/**
 * El QR de ingreso, al final de la invitación.
 *
 * Lo escanea el anfitrión en la puerta y le dice a qué mesa mandar a esta
 * familia (ver /dashboard/invitaciones/[slug]/checkin). Sólo aparece si el
 * anfitrión activó las mesas para su evento.
 *
 * Codifica el enlace de la invitación y no el token pelado, por dos razones:
 * el escáner saca el token de la URL igual, y si alguien lo escanea con la
 * cámara del teléfono en vez de con el panel, abre la invitación en lugar de
 * mostrar una cadena de letras sin sentido.
 *
 * Se dibuja del lado del cliente porque la URL depende del dominio desde el
 * que se abrió: en producción, en la vista previa de Railway y en localhost es
 * distinta, y un valor fijo dejaría QRs que apuntan al lugar equivocado.
 */
export function QrDeIngreso({ guest }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
  }, []);

  if (!guest?.qrIngreso || !guest.uniqueToken) return null;

  const mesas = guest.mesas ?? [];

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        padding: "40px 20px 48px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body-custom, var(--font-inter), sans-serif)",
          fontSize: "10px",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          opacity: 0.55,
        }}
      >
        Tu ingreso
      </span>

      {/* Fondo blanco sí o sí y borde de aire alrededor: un QR sobre un fondo
          oscuro o sobre una foto no lo lee ninguna cámara. Es lo único de la
          invitación que tiene que funcionar como herramienta antes que como
          diseño. */}
      <div
        style={{
          background: "#fff",
          padding: "12px",
          borderRadius: "12px",
          lineHeight: 0,
          boxShadow: "0 8px 30px -12px rgba(0,0,0,.5)",
        }}
      >
        {url ? (
          <QRCodeSVG value={url} size={132} level="M" bgColor="#fff" fgColor="#111" />
        ) : (
          // Mismo tamaño mientras se resuelve la URL, para que no salte el
          // layout de la sección al aparecer el código.
          <div style={{ width: 132, height: 132 }} />
        )}
      </div>

      <span
        style={{
          fontFamily: "var(--font-body-custom, var(--font-inter), sans-serif)",
          fontSize: "12px",
          maxWidth: "260px",
          opacity: 0.7,
          lineHeight: 1.5,
        }}
      >
        {mesas.length > 0
          ? "Mostralo al llegar y te indicamos tu mesa."
          : "Mostralo al llegar para registrar tu ingreso."}
      </span>
    </section>
  );
}
