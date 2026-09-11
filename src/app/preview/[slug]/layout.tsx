import { prisma } from "@/lib/db";
import { ProveedorIdioma } from "@/components/i18n/ProveedorIdioma";
import { ProveedorInvitacion } from "@/components/invitation/ContextoInvitacion";
import { esIdiomaValido, idiomaSegunPais, IDIOMA_POR_DEFECTO } from "@/lib/i18n/idiomas";

/**
 * El idioma y los datos de la invitación, para la vista previa.
 *
 * Va en un layout y no dentro de page.tsx porque esa página devuelve la
 * plantilla desde unos cuarenta `return` distintos, uno por familia y color:
 * envolver cada uno sería tocar cuarenta lugares y olvidarse de alguno. El
 * layout recibe el mismo `slug` y envuelve todo de una sola vez.
 *
 * La consulta extra no pesa: Prisma la resuelve contra la misma fila que la
 * página ya pide, y son cuatro columnas.
 */
export default async function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: {
      pais: true,
      idioma: true,
      regaloDatosBancarios: true,
      pagoTarjetaDatosBancarios: true,
      regaloBanco: true,
      regaloCbu: true,
      regaloAlias: true,
      regaloTitular: true,
      pagoTarjetaBanco: true,
      pagoTarjetaCbu: true,
      pagoTarjetaAlias: true,
      pagoTarjetaTitular: true,
    },
  });

  // Sin invitación, la página se encarga de mostrar el 404: acá sólo hay que
  // no romper mientras tanto.
  if (!invitation) return <>{children}</>;

  const idioma = esIdiomaValido(invitation.idioma)
    ? invitation.idioma
    : idiomaSegunPais(invitation.pais) ?? IDIOMA_POR_DEFECTO;

  return (
    <ProveedorIdioma idioma={idioma}>
      <ProveedorInvitacion datos={invitation}>{children}</ProveedorInvitacion>
    </ProveedorIdioma>
  );
}
