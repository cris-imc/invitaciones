import { NextResponse } from "next/server";
import { cobroDe } from "@/lib/cobro";
import { paisDelAnfitrion } from "@/lib/i18n/servidor";

/**
 * Los datos para pagar por transferencia, según el país de quien pregunta.
 *
 * Es una ruta y no un valor incrustado en el bundle para que cambiar un
 * número de cuenta en Railway tenga efecto sin volver a construir la app.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const pais = await paisDelAnfitrion();
  const cobro = cobroDe(pais);

  if (!cobro) {
    // Sin datos cargados no se ofrece la transferencia. Queda en los registros
    // para que se note al configurar un país nuevo y no en silencio.
    console.warn(`[cobro] Sin datos de transferencia para el país "${pais ?? "desconocido"}"`);
    return NextResponse.json({ disponible: false });
  }

  return NextResponse.json({ disponible: true, ...cobro });
}
