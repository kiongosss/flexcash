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
import { verifyWebhookSignature, processWebhookEvent } from '@/lib/lemon-squeezy';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Received webhook request');
    
    // Get the raw request body
    const rawBody = await request.text();
    
    // Log the headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Webhook headers:', headers);
    
    // Parse the body
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Webhook body meta:', body.meta);
    } catch (e) {
      console.error('Failed to parse webhook body:', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    // Get the signature from the headers
    // Lemon Squeezy uses 'x-signature' header for webhook signatures
    const signature = request.headers.get('x-signature') || '';
    
    if (!signature) {
      console.warn('No signature provided in webhook request');
      
      // Only enforce signature in production
      if (process.env.NODE_ENV === 'production' && process.env.SKIP_WEBHOOK_VERIFICATION !== 'true') {
        return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
      }
    }
    
    // Verify the webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      
      // Only enforce signature in production
      if (process.env.NODE_ENV === 'production' && process.env.SKIP_WEBHOOK_VERIFICATION !== 'true') {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // Process the webhook event
    const eventData = await processWebhookEvent(body);
    
    if (!eventData) {
      console.log('Event ignored or not relevant');
      return NextResponse.json({ message: 'Event ignored or not relevant' }, { status: 200 });
    }
    
    console.log('Processing event data:', eventData);
    
    // Handle different event types
    if (eventData.status === 'completed') {
      try {
        // First check if a user with this payment ID already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            paymentId: eventData.orderId,
          },
        });
        
        if (existingUser) {
          console.log(`User with payment ID ${eventData.orderId} already exists, skipping creation`);
        } else {
          // Create a new user record
          console.log('Creating new user record with data:', {
            handle: eventData.handle,
            amountPaid: eventData.amountPaid,
            message: eventData.message,
          });
          
          // Try to use Prisma client first
          try {
            // Using type assertion to bypass type checking since we've manually added the message field to the database
            await prisma.user.create({
              data: {
                id: `user-${Date.now()}`,
                handle: eventData.handle || 'anonymous',
                amountPaid: eventData.amountPaid || 0,
                paymentId: eventData.orderId,
                paymentStatus: eventData.status,
                // @ts-ignore - message field exists in the database but not in the generated Prisma types
                message: eventData.message || '',
              } as any,
            });
            
            console.log('User record created successfully');
          } catch (prismaError) {
            console.error('Error creating user with Prisma:', prismaError);
            throw prismaError;
          }
        }
      } catch (dbError) {
        console.error('Database error when processing completed payment:', dbError);
        return NextResponse.json(
          { error: 'Database error when processing payment' },
          { status: 500 }
        );
      }
    } else if (eventData.status === 'refunded') {
      try {
        // Update the user record
        console.log(`Updating user with payment ID ${eventData.orderId} to refunded status`);
        
        const updateResult = await prisma.user.updateMany({
          where: {
            paymentId: eventData.orderId,
          },
          data: {
            paymentStatus: eventData.status,
          },
        });
        
        console.log(`Updated ${updateResult.count} user records to refunded status`);
      } catch (dbError) {
        console.error('Database error when processing refund:', dbError);
        return NextResponse.json(
          { error: 'Database error when processing refund' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook API error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
