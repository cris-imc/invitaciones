import { NextRequest, NextResponse } from "next/server";
import { cobroDe } from "@/lib/cobro";
import { paisDelAnfitrion } from "@/lib/i18n/servidor";
import { esCodigoPais } from "@/lib/paises";

/**
 * Los datos para pagar por transferencia, según el país de quien pregunta.
 *
 * Es una ruta y no un valor incrustado en el bundle para que cambiar un
 * número de cuenta en Railway tenga efecto sin volver a construir la app.
 *
 * El país se puede pedir por query. Hace falta para el registro: ahí todavía
 * no hay sesión y el país que importa es el que la persona acaba de elegir en
 * el formulario, que no es ni la cookie ni nada que el servidor pueda saber
 * solo. Sin esto, alguien que abría los datos de España y después cambiaba a
 * México seguía viendo los de España.
 *
 * Que venga del cliente no es un riesgo: lo único que decide es cuál de
 * nuestras propias cuentas se muestra, y son datos que se le enseñan a quien
 * va a pagar. Igual se valida, para no ir a buscar un país inventado.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const pedido = request.nextUrl.searchParams.get("pais");
  const pais = esCodigoPais(pedido) ? pedido : await paisDelAnfitrion();
  const cobro = cobroDe(pais);

  if (!cobro) {
    // Sin datos cargados no se ofrece la transferencia. Queda en los registros
    // para que se note al configurar un país nuevo y no en silencio.
    console.warn(`[cobro] Sin datos de transferencia para el país "${pais ?? "desconocido"}"`);
    return NextResponse.json({ disponible: false });
  }

  return NextResponse.json({ disponible: true, pais, ...cobro });
}
