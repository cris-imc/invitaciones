const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invitations = await prisma.invitation.findMany({
    select: {
      id: true,
      tipo: true,
      nombreEvento: true,
      nombreQuinceanera: true,
      nombreNovia: true,
      nombreNovio: true,
      estado: true,
    }
  });
  
  console.log('\n=== INVITACIONES EN LA BASE DE DATOS ===\n');
  invitations.forEach(inv => {
    console.log(`ID: ${inv.id}`);
    console.log(`Tipo: ${inv.tipo}`);
    console.log(`Nombre Evento: ${inv.nombreEvento}`);
    console.log(`Estado: ${inv.estado}`);
    if (inv.nombreNovia || inv.nombreNovio) {
      console.log(`Novios: ${inv.nombreNovia} & ${inv.nombreNovio}`);
    }
    if (inv.nombreQuinceanera) {
      console.log(`Festejado/a: ${inv.nombreQuinceanera}`);
    }
    console.log('---');
  });
  
  console.log(`\nTotal: ${invitations.length} invitaciones`);
  
  const cumpleanos = invitations.filter(i => i.tipo === 'CUMPLEANOS');
  console.log(`Cumpleaños: ${cumpleanos.length}`);
  
  const quince = invitations.filter(i => i.tipo === 'QUINCE_ANOS');
  console.log(`15 años: ${quince.length}`);
  
  const casamiento = invitations.filter(i => i.tipo === 'CASAMIENTO');
  console.log(`Casamientos: ${casamiento.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
