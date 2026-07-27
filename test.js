const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.guest.findMany({
    where: { name: { contains: 'morales' } }
}).then(console.log).finally(() => prisma.$disconnect());
