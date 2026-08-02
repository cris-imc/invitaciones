const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMorales() {
  const id = 'cmsatm6t100031185o8ta4rda';
  const guest = await prisma.guest.findUnique({ where: { id } });
  
  if (guest) {
    const total = (guest.expectedAdults || 0) + (guest.expectedTeens || 0) + (guest.expectedChildren || 0);
    console.log(`Updating guest ${guest.name} expectedCount to ${total}`);
    
    await prisma.guest.update({
      where: { id },
      data: { expectedCount: total }
    });
    console.log('Update successful');
  } else {
    console.log('Guest not found');
  }
}

fixMorales()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
