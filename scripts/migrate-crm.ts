import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting CRM Migration...');
  
  // 1. Fetch all existing projects
  const projects = await prisma.project.findMany();
  console.log(`Found ${projects.length} projects to migrate.`);

  for (const project of projects) {
    // Check if it's already migrated
    if (project.clientId) {
      console.log(`Project ${project.id} already migrated. Skipping.`);
      continue;
    }

    try {
      // Parse the config to extract client details
      const config = typeof project.config === 'string' 
        ? JSON.parse(project.config) 
        : project.config;
      
      const firstName = config.firstName || 'Unknown';
      const lastName = config.lastName || 'Client';
      const company = config.company || null;

      // Create a new Client record
      const client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          company
        }
      });

      console.log(`Created Client: ${client.firstName} ${client.lastName} (ID: ${client.id})`);

      // Update the Project with the new clientId
      await prisma.project.update({
        where: { id: project.id },
        data: {
          clientId: client.id,
          // Set status based on whether it's approved
          status: project.approvedAt ? 'signed' : 'quoted'
        }
      });

      console.log(`Updated Project ${project.id} with Client ID ${client.id}`);
    } catch (err) {
      console.error(`Failed to migrate project ${project.id}:`, err);
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
