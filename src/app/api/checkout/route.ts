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
import { createCheckout } from '@/lib/lemon-squeezy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, amount, message } = body;

    // Validate input
    if (!handle) {
      return NextResponse.json(
        { error: 'Social handle or website URL is required' },
        { status: 400 }
      );
    }

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be at least $1' },
        { status: 400 }
      );
    }

    // Create checkout session
    const checkout = await createCheckout({
      handle,
      amount: parseFloat(amount),
      message: message || '',
      customPrice: true,
    });

    return NextResponse.json({ checkoutUrl: checkout.url, checkoutId: checkout.id });
  } catch (error) {
    console.error('Checkout API error:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check environment variables
    console.log('Environment check for checkout API:', {
      storeId: process.env.LEMON_SQUEEZY_STORE_ID ? 'Set' : 'Not set',
      apiKey: process.env.LEMON_SQUEEZY_API_KEY ? 'Set' : 'Not set',
      productId: process.env.LEMON_SQUEEZY_PRODUCT_ID ? 'Set' : 'Not set',
      variantId: process.env.LEMON_SQUEEZY_VARIANT_ID ? 'Set' : 'Not set',
      webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ? 'Set' : 'Not set',
      appUrl: process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Not set'
    });
    
    // Return a more descriptive error message if available
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
