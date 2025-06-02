/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import { createHmac } from 'crypto';

// Types for checkout options and responses
type CheckoutOptions = {
  handle: string;
  amount: number;
  message?: string;
  customPrice?: boolean;
};

type CheckoutResponse = {
  url: string;
  id: string;
};

type WebhookEventData = {
  orderId: string;
  handle?: string;
  amountPaid?: number;
  message?: string;
  status: string;
};

// Create a checkout session
export async function createCheckout(options: CheckoutOptions): Promise<CheckoutResponse> {
  try {
    // Check if we're in development mode and should use mock checkout
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_CHECKOUT === 'true') {
      console.log('Using mock checkout for development');
      return {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mock-checkout?handle=${encodeURIComponent(options.handle)}&amount=${options.amount}&message=${encodeURIComponent(options.message || '')}`,
        id: `mock-checkout-${Date.now()}`,
      };
    }
    
    // Real Lemon Squeezy API implementation
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    
    if (!apiKey || !storeId) {
      throw new Error('Lemon Squeezy API key or store ID not configured');
    }
    
    // Convert amount to cents for Lemon Squeezy
    const amountInCents = Math.round(options.amount * 100);
    
    // Use the direct product URL with custom parameters
    // This is the most reliable approach for Lemon Squeezy checkouts
    const baseProductUrl = 'https://masokotools.lemonsqueezy.com/buy/ee36e0a3-0a03-4ae1-a907-6cd80693a1de';
    
    // Add custom parameters to the URL
    const checkoutUrl = `${baseProductUrl}?checkout[custom][handle]=${encodeURIComponent(options.handle)}&checkout[custom][message]=${encodeURIComponent(options.message || '')}&checkout[custom_price]=${amountInCents}&checkout[redirect_url]=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/success`)}`;
    
    console.log('Generated checkout URL:', checkoutUrl);
    
    // Return the checkout URL and a generated ID
    return {
      url: checkoutUrl,
      id: `direct-checkout-${Date.now()}`
    };
  } catch (error) {
    console.error('Error creating checkout:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if environment variables are properly set
    console.log('Environment check:', {
      storeId: process.env.LEMON_SQUEEZY_STORE_ID ? 'Set' : 'Not set',
      apiKey: process.env.LEMON_SQUEEZY_API_KEY ? 'Set' : 'Not set',
      webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ? 'Set' : 'Not set'
    });
    
    throw new Error('Failed to create checkout session');
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // Skip verification in development if configured to do so
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
    console.log('Skipping webhook signature verification in development');
    return true;
  }
  
  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('Webhook secret not configured');
      return false;
    }
    
    const hmac = createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    
    const isValid = signature === digest;
    
    if (!isValid) {
      console.error('Invalid webhook signature');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Process webhook event
export async function processWebhookEvent(event: any): Promise<WebhookEventData | null> {
  try {
    // Handle different webhook event types
    const eventName = event.meta?.event_name;
    console.log(`Processing webhook event: ${eventName}`);
    
    switch (eventName) {
      case 'order_created':
        // Handle order created event
        return handleOrderCreated(event);
      case 'order_refunded':
        // Handle order refunded event
        return handleOrderRefunded(event);
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_resumed':
      case 'subscription_expired':
      case 'subscription_paused':
      case 'subscription_unpaused':
        // These events are not relevant for our current implementation
        console.log(`Subscription event received but not processed: ${eventName}`);
        return null;
      default:
        console.log(`Unhandled webhook event: ${eventName}`);
        return null;
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return null;
  }
}

// Handle order created event
async function handleOrderCreated(event: any): Promise<WebhookEventData> {
  try {
    console.log('Processing order created event');
    
    // Extract data from the event
    const orderId = event.data?.id;
    const orderData = event.data?.attributes || {};
    
    // Extract custom data from the checkout data
    const checkoutData = orderData.checkout_data || {};
    const customData = checkoutData.custom || {};
    
    // Get the amount paid
    const amountPaid = orderData.total ? parseFloat(orderData.total) / 100 : 0; // Convert from cents to dollars
    
    console.log('Order created with data:', {
      orderId,
      handle: customData.handle,
      message: customData.message,
      amountPaid
    });
    
    // Return the data needed to create a user record
    return {
      orderId,
      handle: customData.handle,
      message: customData.message,
      amountPaid,
      status: 'completed',
    };
  } catch (error) {
    console.error('Error handling order created event:', error);
    throw error;
  }
}

// Handle order refunded event
async function handleOrderRefunded(event: any): Promise<WebhookEventData> {
  try {
    console.log('Processing order refunded event');
    
    const orderId = event.data?.id;
    const orderData = event.data?.attributes || {};
    
    // Extract custom data from the checkout data
    const checkoutData = orderData.checkout_data || {};
    const customData = checkoutData.custom || {};
    
    console.log('Order refunded:', { orderId, handle: customData.handle });
    
    // Return the data needed to update a user record
    return {
      orderId,
      handle: customData.handle,
      status: 'refunded',
    };
  } catch (error) {
    console.error('Error handling order refunded event:', error);
    throw error;
  }
}
