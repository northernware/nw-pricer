import { prisma } from '../../src/lib/prisma';

async function main() {
  console.log('Fixing client names...');
  
  const clients = await prisma.client.findMany({
    where: {
      firstName: 'Unknown',
      lastName: 'Client'
    }
  });

  console.log(`Found ${clients.length} clients to fix.`);

  for (const client of clients) {
    if (client.company) {
      // The old "client" string was put into company (e.g. "John Doe")
      // Let's split it by space
      const parts = client.company.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';

      await prisma.client.update({
        where: { id: client.id },
        data: {
          firstName: firstName,
          lastName: lastName || 'Client',
          company: null // clear it out since it was actually a person's name
        }
      });
      console.log(`Updated client ${client.id}: ${firstName} ${lastName}`);
    }
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
