import { prisma } from '../../src/lib/prisma';

async function main() {
  await prisma.client.updateMany({
    where: { company: 'BGA' },
    data: { company: 'BGA Metal Trading Inc.' }
  });
  console.log('Successfully updated BGA to BGA Metal Trading Inc.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
