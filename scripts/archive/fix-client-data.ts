import { prisma } from '../../src/lib/prisma';

async function main() {
  const projects = await prisma.project.findMany({
    include: { client: true }
  });

  for (const project of projects) {
    const config = project.config as any;
    if (!config || !config.proposal) continue;

    const firstName = config.proposal.clientFirstName || 'Unknown';
    const lastName = config.proposal.clientLastName || 'Client';
    const company = config.proposal.clientCompany || null;

    if (project.clientId) {
      await prisma.client.update({
        where: { id: project.clientId },
        data: {
          firstName,
          lastName,
          company
        }
      });
      console.log(`Updated client ${project.clientId} for project ${project.id}`);
    }
  }
  
  console.log('Finished updating all clients from config.proposal payloads.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
