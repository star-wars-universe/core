import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixResearch() {
  console.log('Fixing active research maxProgress...');

  // Get all active research
  const activeResearch = await prisma.playerResearch.findMany({
    where: {
      completedAt: null,
      maxProgress: 0,
    },
    include: {
      researchType: true,
    },
  });

  console.log(`Found ${activeResearch.length} research(es) to fix`);

  for (const research of activeResearch) {
    let maxProgress = 0;

    if (research.researchType.researchLevel === 0) {
      // Level 0: Use total resource requirement
      maxProgress = research.researchType.requiredDurastahlTotal || 
                    research.researchType.requiredKristallinesSiliziumTotal || 
                    research.researchType.requiredEnergyTotal || 
                    research.researchType.requiredCreditsTotal || 
                    0;
    } else {
      // Level 1+: Use research point cost
      maxProgress = research.researchType.researchPointCost;
    }

    await prisma.playerResearch.update({
      where: { id: research.id },
      data: { maxProgress },
    });

    console.log(`✅ Fixed ${research.researchType.name}: maxProgress = ${maxProgress}`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

fixResearch().catch((e) => {
  console.error(e);
  process.exit(1);
});
