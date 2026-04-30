import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.job.findFirst({ orderBy: { createdAt: 'desc' }});
  console.log('JOB:', job?.jobId);
  console.log('STATUS:', job?.status);
  console.log('RAW CODE LENGTH:', job?.rawCode?.length);
  console.log('RAW CODE PREVIEW:', job?.rawCode ? job.rawCode.substring(0, 150) : "NULL OR EMPTY");
}
main().catch(console.error).finally(() => prisma.$disconnect());
