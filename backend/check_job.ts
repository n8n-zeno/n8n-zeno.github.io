import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.job.findFirst({ orderBy: { createdAt: 'desc' }});
  console.log('LATEST JOB IN DB:', job?.jobId);
}
main().catch(console.error).finally(() => prisma.$disconnect());
