const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  console.log('\n=== USUARIOS ===\n');
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Email: ${u.email}`);
    console.log(`Name: ${u.name}`);
    console.log('---');
  });
  
  const invitations = await prisma.invitation.findMany({
    select: {
      id: true,
      userId: true,
      tipo: true,
      nombreEvento: true,
    }
  });
  
  console.log('\n=== INVITACIONES Y SUS USUARIOS ===\n');
  invitations.forEach(inv => {
    console.log(`Tipo: ${inv.tipo} - Evento: ${inv.nombreEvento} - UserID: ${inv.userId}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
