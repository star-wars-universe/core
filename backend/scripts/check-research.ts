import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResearch() {
  console.log('Checking active research...\n');

  const activeResearch = await prisma.playerResearch.findMany({
    where: {
      completedAt: null,
    },
    include: {
      researchType: true,
      player: {
        include: {
          user: true,
        },
      },
    },
  });

  if (activeResearch.length === 0) {
    console.log('No active research found.');
  } else {
    activeResearch.forEach((r) => {
      console.log('---');
      console.log(`ID: ${r.id}`);
      console.log(`Player: ${r.player.user.username} (ID: ${r.playerId})`);
      console.log(`Research: ${r.researchType.name}`);
      console.log(`Progress: ${r.currentProgress} / ${r.maxProgress}`);
      console.log(`Started: ${r.startedAt}`);
      console.log(`Percentage: ${r.maxProgress > 0 ? Math.round((r.currentProgress / r.maxProgress) * 100) : 'NaN'}%`);
    });
  }

  await prisma.$disconnect();
}

checkResearch().catch((e) => {
  console.error(e);
  process.exit(1);
});
