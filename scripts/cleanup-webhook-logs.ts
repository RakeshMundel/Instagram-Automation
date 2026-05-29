import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const retentionDays = Number(process.env.WEBHOOK_LOG_RETENTION_DAYS ?? 30);
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.webhookEvent.deleteMany({
    where: {
      receivedAt: { lt: cutoff },
      status: { in: ["PROCESSED", "IGNORED"] },
    },
  });

  console.log(`Deleted ${result.count} webhook events older than ${cutoff.toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
