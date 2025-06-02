/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching leaderboard data...');
    
    // Use Prisma's findMany since we're now properly connected to PostgreSQL
    const users = await prisma.user.findMany({
      where: {
        paymentStatus: 'completed',
      },
      orderBy: {
        amountPaid: 'desc',
      },
      take: 50,
    });
    
    console.log('Leaderboard data fetched:', users);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
