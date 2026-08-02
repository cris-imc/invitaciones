const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMariano() {
  const guest = await prisma.guest.findFirst({
    where: {
      name: {
        contains: 'Mariano'
      }
    }
  });

  if (guest) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        attendingCount: 1,
        attendingAdults: 0,
        attendingTeens: 1,
        attendingChildren: 0
      }
    });
    console.log('Update successful');
  } else {
    console.log('Guest not found');
  }
}

fixMariano()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
