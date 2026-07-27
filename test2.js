const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.invitation.findUnique({
    where: { id: 'cms27pkxp0001zp90pv1031rv' }
}).then(console.log).finally(() => prisma.$disconnect());
