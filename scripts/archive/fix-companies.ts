import { prisma } from '../../src/lib/prisma';

async function main() {
  const projects = await prisma.project.findMany({
    include: { client: true }
  });

  for (const p of projects) {
    if (p.client && !p.client.company) {
      let companyName = p.name;
      
      // Clean up the project name to extract the company name
      companyName = companyName.replace(/ Website 2026/i, '');
      companyName = companyName.replace(/ Construction Website/i, '');
      companyName = companyName.replace(/ Website & Inventory Management System/i, '');
      companyName = companyName.replace(/ Website/i, '');

      await prisma.client.update({
        where: { id: p.clientId },
        data: { company: companyName.trim() }
      });
      console.log(`Updated client ${p.client.firstName}: Set company to "${companyName.trim()}"`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
