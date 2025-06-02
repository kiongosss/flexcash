/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany({});
  
  // Create sample users
  const users = [
    {
      handle: '@topflex',
      amountPaid: 1000.00,
      paymentId: 'seed-payment-1',
      paymentStatus: 'completed',
    },
    {
      handle: '@flexmaster',
      amountPaid: 750.50,
      paymentId: 'seed-payment-2',
      paymentStatus: 'completed',
    },
    {
      handle: 'https://flexdomain.com',
      amountPaid: 500.00,
      paymentId: 'seed-payment-3',
      paymentStatus: 'completed',
    },
    {
      handle: '@flexer',
      amountPaid: 250.00,
      paymentId: 'seed-payment-4',
      paymentStatus: 'completed',
    },
    {
      handle: '@smallflex',
      amountPaid: 100.00,
      paymentId: 'seed-payment-5',
      paymentStatus: 'completed',
    },
  ];
  
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
