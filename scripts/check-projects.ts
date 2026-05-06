import { prisma } from '../src/lib/prisma';

async function main() {
  const projects = await prisma.project.findMany({
    include: { client: true }
  });

  for (const p of projects) {
    console.log(`Project: "${p.name}" | Client: ${p.client?.firstName} ${p.client?.lastName} | Company: ${p.client?.company}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
