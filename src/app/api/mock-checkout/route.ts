/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// This is a mock checkout endpoint for development purposes
// In production, this would be replaced by the actual Lemon Squeezy checkout
export async function GET(request: NextRequest) {
  try {
    // Get the handle, amount, and message from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const handle = searchParams.get('handle');
    const amountStr = searchParams.get('amount');
    const message = searchParams.get('message');
    
    console.log('Mock checkout parameters:', { handle, amount: amountStr, message });
    
    if (!handle || !amountStr) {
      console.error('Invalid parameters:', { handle, amount: amountStr });
      return NextResponse.redirect(new URL('/error?type=invalid_parameters', request.url));
    }
    
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount < 1) {
      console.error('Invalid amount:', amount);
      return NextResponse.redirect(new URL('/error?type=invalid_amount', request.url));
    }
    
    // Create a mock payment record in the database
    const paymentId = `mock-payment-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    
    console.log('Creating user record:', { userId, handle, amount, paymentId, message });
    
    // Try using raw SQL first since we know it works with the message field
    try {
      await prisma.$executeRaw`INSERT INTO User (id, handle, amountPaid, message, paymentId, paymentStatus, createdAt, updatedAt) 
        VALUES (${userId}, ${handle}, ${amount}, ${message || ''}, ${paymentId}, 'completed', ${new Date().toISOString()}, ${new Date().toISOString()})`;
      
      console.log('Successfully created user record with raw SQL');
    } catch (sqlError) {
      console.error('Failed to create user with raw SQL:', sqlError);
      
      // Fall back to Prisma create with type assertion
      console.log('Trying Prisma create as fallback...');
      await prisma.user.create({
        data: {
          id: userId,
          handle,
          amountPaid: amount,
          paymentId,
          paymentStatus: 'completed',
          // @ts-ignore - message field exists in the database but not in the generated Prisma types
          message: message || '',
        } as any,
      });
      
      console.log('Successfully created user record with Prisma create');
    }
    
    // Redirect to success page
    console.log('Redirecting to success page');
    return NextResponse.redirect(new URL('/success', request.url));
  } catch (error) {
    console.error('Mock checkout error:', error);
    return NextResponse.redirect(new URL('/error?type=checkout_failed', request.url));
  }
}
