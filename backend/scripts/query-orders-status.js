const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  const total = await prisma.order.count();
  const byStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  console.log(JSON.stringify({ total, byStatus }, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
