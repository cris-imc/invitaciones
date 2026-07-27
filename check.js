const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const inv = await prisma.invitation.findFirst({ where: { nombreEvento: 'Mi cumple 42 ' } });
  if (!inv) return console.log('Invitation not found');
  const guests = await prisma.guest.findMany({ where: { invitationId: inv.id } });
  console.log('Guests:', guests);
  console.log('Invitation Config:', { 
    regaloMonto: inv.regaloMonto, 
    precioNino: inv.precioNino, 
    regaloHabilitado: inv.regaloHabilitado,
    rsvpType: inv.rsvpType,
    tipo: inv.tipo
  });
}
main().finally(() => prisma.$disconnect());
