import { supabase } from "@/integrations/supabase/client";

// Payment provider SDK imports
import { loadStripe } from "@stripe/stripe-js";

// Define payment method types
export type PaymentMethod = 'creditCard' | 'paypal' | 'bitcoin' | 'bankTransfer';

// Payment configuration
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Initialize payment providers
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

import type { Json, Database } from '@/lib/types'; // Import Database

// Define interfaces for table rows to help with TypeScript inference
interface Payment {
  id: string;
  user_id: string | null; // Align with regenerated DB type
  amount: number;
  currency: string;
  payment_method: PaymentMethod | null; // Align with regenerated DB type (string | null)
  description: string | null; // Align with regenerated DB type
  name: string | null;
  external_reference: string | null; 
  monthly_price: number; // Align with regenerated DB type (not nullable)
  metadata: string | null; 
  created_at: string;
  updated_at: string | null; // Align with regenerated DB type
  is_subscription: boolean | null; // Align with regenerated DB type
  subscription_id: string | null;
  status: 'pending' | 'completed' | 'failed' | null; // More specific than string | null, but should be compatible
}

// Update the features field in SubscriptionPlan to be more specific
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  is_active: boolean;
  features: string[] | Record<string, any> | null; // More specific type
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  // user_id: string; // user_id is not directly on user_subscriptions.Row from lib/types.ts. Query uses it.
  plan_id: string | null; // Align with DB
  status: 'active' | 'canceled' | 'paused' | 'pending' | null; // Align with DB (string | null)
  billing_interval?: 'month' | 'year' | null; // string | null in DB
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null; // Align with DB
  external_id?: string | null;
  created_at: string | null; // Align with DB
  updated_at: string | null; // Align with DB
  subscription_plans?: SubscriptionPlan | null; 
  // Add user_id if it's truly part of the object returned by the specific query
  user_id?: string; // For the .eq('user_id', userId) in getUserActiveSubscription
}

interface Order {
  id: string;
  payment_id?: string | null;
  status: string; // e.g., 'pending', 'paid', 'failed', 'shipped'
  updated_at: string;
  created_at: string;
  total_amount: number;
  items: Json; // Align with database schema (jsonb)
  shipping_address: Json | null; // Align with database schema (jsonb) and usage
  delivery_date: string;
  delivery_time: string;
  special_instructions: string;
  order: string; // e.g., 'cake', 'pastry', etc.
  // other order properties
}


// Interface for payment details
export interface PaymentDetails {
  amount: number;
  currency: string;
  customerId?: string;
  description: string;
  metadata?: Record<string, any>; // Changed to match the column type
  isSubscription?: boolean;
  subscriptionPlan?: string;
  billingInterval?: 'month' | 'year';
  name?: string;
  external_reference?: string; // Changed from external_refer to external_reference
  updated_at?: string;
  created_at?: string;
  payment_method?: string;
}

// Process payments based on selected method
export async function processPayment(
  method: PaymentMethod, 
  paymentDetails: PaymentDetails,
  userId: string
): Promise<any> {
  try {
    // Create payment record in Supabase
    // Ensure paymentDataToInsert aligns with the DB schema (especially monthly_price)
    const paymentDataToInsert = {
      user_id: userId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      payment_method: method,
      description: paymentDetails.description || null,
      name: paymentDetails.name || paymentDetails.description || null,
      external_reference: paymentDetails.external_reference || null,
      // monthly_price is NOT NULL in DB. If it's not a subscription, what should it be?
      // For now, let's assume it's required. If it can be null for non-subscriptions, DB schema needs change.
      // This logic might need review based on business rules for monthly_price.
      monthly_price: paymentDetails.isSubscription && paymentDetails.billingInterval === 'month' 
                     ? paymentDetails.amount 
                     : (paymentDetails.isSubscription ? 0 : paymentDetails.amount), // Or some other default / actual price
      metadata: paymentDetails.metadata ? JSON.stringify(paymentDetails.metadata) : null,
      is_subscription: paymentDetails.isSubscription || false,
      subscription_id: (paymentDetails.isSubscription ? paymentDetails.subscriptionPlan : null) || null,
      status: 'pending' as const // Ensure status is one of the literal types
    };
    
    // Omit properties not in Insert type or that are auto-generated
    type PaymentInsertType = Database['public']['Tables']['payments']['Insert'];
    const finalPaymentData: PaymentInsertType = paymentDataToInsert;


    const { data: paymentRecord, error: recordError } = await supabase
      .from('payments')
      .insert(finalPaymentData) // Use the strictly typed object
      .select()
      .single<Payment>(); // The return type Payment should align with Row

    if (recordError) throw new Error(`Failed to create payment record: ${recordError.message}`);
    if (!paymentRecord) throw new Error('Payment record creation returned no data.');

    // Process payment based on method
    switch (method) {
      case 'creditCard':
        return await processCreditCardPayment(paymentDetails, paymentRecord.id);
      
      case 'paypal':
        return await processPayPalPayment(paymentDetails, paymentRecord.id);
      
      case 'bitcoin':
        return await processBitcoinPayment(paymentDetails, paymentRecord.id);
      
      case 'bankTransfer':
        return await processBankTransferPayment(paymentDetails, paymentRecord.id);
      
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Implement specific payment processors
async function processCreditCardPayment(details: PaymentDetails, paymentId: string) {
  const stripe = await stripePromise;
  
  // Create payment intent on your backend
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: details.amount,
      currency: details.currency,
      payment_id: paymentId,
      is_subscription: details.isSubscription,
      subscription_plan: details.subscriptionPlan,
      billing_interval: details.billingInterval
    }),
  });
  
  const { clientSecret, paymentIntentId, error } = await response.json();
  if (error) throw new Error(error.message);
  
  // Update payment record with external reference
  await supabase
    .from('payments')
    .update({ external_reference: paymentIntentId })
    .eq('id', paymentId);
  
  // Return payment session for the frontend to complete
  return {
    provider: 'stripe',
    clientSecret,
    paymentId
  };
}

async function processPayPalPayment(details: PaymentDetails, paymentId: string) {
  // Example: Call a backend endpoint to create a PayPal order
  const response = await fetch('/api/create-paypal-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: details.amount,
      currency: details.currency,
      payment_id: paymentId,
      description: details.description,
      is_subscription: details.isSubscription,
      subscription_plan: details.subscriptionPlan,
    }),
  });

  const { orderID, approveUrl, error } = await response.json();
  if (error) throw new Error(error.message || 'Failed to create PayPal order');

  // Update payment record with PayPal order ID as external reference
  await supabase
    .from('payments')
    .update({ external_reference: orderID })
    .eq('id', paymentId);

  return {
    provider: 'paypal',
    orderID, 
    approveUrl, 
    paymentId
  };
}

async function processBitcoinPayment(details: PaymentDetails, paymentId: string) {
  // Create Bitcoin payment request on your backend
  const response = await fetch('/api/create-bitcoin-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: details.amount,
      currency: details.currency,
      payment_id: paymentId
    }),
  });
  
  const { address, amount, error } = await response.json();
  if (error) throw new Error(error.message);
  
  return {
    provider: 'bitcoin',
    address,
    amount,
    paymentId
  };
}

async function processBankTransferPayment(details: PaymentDetails, paymentId: string) {
  // Generate bank transfer details
  const response = await fetch('/api/create-bank-transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: details.amount,
      currency: details.currency,
      payment_id: paymentId
    }),
  });
  
  const { bankDetails, reference, error } = await response.json();
  if (error) throw new Error(error.message);
  
  return {
    provider: 'bankTransfer',
    bankDetails,
    reference,
    paymentId
  };
}

// Verify payment status
export async function verifyPaymentStatus(paymentId: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select(paymentColumnsSelect) // Explicitly select columns
    .eq('id', paymentId)
    .single<Payment>();
    
  if (error) throw new Error(`Failed to verify payment: ${error.message}`);
  return data;
}

// Create subscription
export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethod: PaymentMethod,
  billingInterval: 'month' | 'year'
): Promise<any> { // Added Promise<any> as return type, refine if possible
  // Get plan details from Supabase
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select(subscriptionPlanColumnsSelect) // Explicitly select columns
    .eq('id', planId)
    .single<SubscriptionPlan>();
    
  if (planError) throw new Error(`Failed to fetch plan: ${planError.message}`);
  if (!plan) throw new Error('Subscription plan not found.');
  
  // Process subscription payment
  return await processPayment(
    paymentMethod,
    {
      amount: billingInterval === 'month' ? plan.monthly_price : plan.yearly_price,
      currency: 'ZAR',
      description: `Subscription to ${plan.name} (${billingInterval}ly)`,
      isSubscription: true,
      subscriptionPlan: planId,
      billingInterval,
      metadata: { plan_features: (plan as SubscriptionPlan).features } // Type assertion for plan.features
    },
    userId
  );
}

// Add these functions at the end of your file

// Update subscription status
export async function updateSubscriptionStatus(subscriptionId: string, status: UserSubscription['status']): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)
    .select(userSubscriptionColumnsSelect) // Explicitly select columns
    .single<UserSubscription>();
    
  if (error) throw new Error(`Failed to update subscription: ${error.message}`);
  return data;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelImmediately: boolean = false): Promise<UserSubscription | null> {
  if (cancelImmediately) {
    return await updateSubscriptionStatus(subscriptionId, 'canceled');
  } else {
    const { data, error } = await supabase
      .from('user_subscriptions')
    .update({ 
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)
    .select(userSubscriptionColumnsSelect) // Explicitly select columns
    .single<UserSubscription>();
      
    if (error) throw new Error(`Failed to cancel subscription: ${error.message}`);
    return data;
  }
}

// Get user's active subscription
export async function getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
  // Step 1: Find the latest successful payment for a subscription by this user
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .select('subscription_id')
    .eq('user_id', userId)
    .eq('is_subscription', true)
    .eq('status', 'completed') // Assuming 'completed' means the payment for subscription was successful
    .order('created_at', { ascending: false })
    .limit(1)
    .single<{ subscription_id: string | null }>();

  if (paymentError && paymentError.code !== 'PGRST116') {
    console.error('Error fetching payment for subscription:', paymentError.message);
    throw new Error(`Failed to fetch payment for subscription: ${paymentError.message}`);
  }

  if (!paymentData || !paymentData.subscription_id) {
    return null; // No relevant payment found, so no active subscription via this path
  }

  const { subscription_id } = paymentData;

  // Step 2: Fetch the user_subscription record using the subscription_id from the payment
  // and ensure its status is 'active'.
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select(`
      id,
      plan_id,
      status,
      billing_interval,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      external_id,
      created_at,
      updated_at,
      user_id, // Include user_id if it's part of the UserSubscription interface and needed
      subscription_plans:plan_id (id, name, monthly_price, yearly_price, is_active, description, features)
    `)
    .eq('id', subscription_id)
    .eq('status', 'active')
    .single<UserSubscription>();

  if (subscriptionError && subscriptionError.code !== 'PGRST116') {
    console.error('Error fetching active subscription:', subscriptionError.message);
    throw new Error(`Failed to fetch active subscription: ${subscriptionError.message}`);
  }
  
  // Add user_id to the returned subscription data if it's not directly on user_subscriptions table
  // but is expected in the UserSubscription type for application logic.
  if (subscriptionData) {
    // The user_id in the select string for user_subscriptions might not be a real column.
    // If UserSubscription interface has user_id, and we know it's for this userId:
    return { ...subscriptionData, user_id: userId };
  }

  return null;
}

// Get payment history
const paymentColumnsSelect = 'id, user_id, amount, currency, payment_method, description, name, external_reference, monthly_price, metadata, created_at, updated_at, is_subscription, subscription_id, status';
const userSubscriptionColumnsSelect = 'id, user_id, plan_id, status, billing_interval, current_period_start, current_period_end, cancel_at_period_end, external_id, created_at, updated_at';
const subscriptionPlanColumnsSelect = 'id, name, description, monthly_price, yearly_price, is_active, features, created_at, updated_at';


export async function getUserPaymentHistory(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(paymentColumnsSelect) // Explicitly select columns
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<Payment[]>();
    
  if (error) throw new Error(`Failed to fetch payment history: ${error.message}`);
  return data || [];
}

// Handle webhook events from payment providers
export async function handlePaymentWebhook(provider: string, event: any) {
  switch (provider) {
    case 'stripe':
      return handleStripeWebhook(event);
    case 'paypal':
      return handlePayPalWebhook(event);
    default:
      throw new Error(`Unsupported webhook provider: ${provider}`);
  }
}

// Process Stripe webhook events
async function handleStripeWebhook(event: any) {
  const { type, data } = event;
  
  switch (type) {
    case 'payment_intent.succeeded':
      await updatePaymentStatus(data.object.metadata.payment_id, 'completed');
      break;
    case 'payment_intent.payment_failed':
      await updatePaymentStatus(data.object.metadata.payment_id, 'failed');
      break;
    case 'invoice.payment_succeeded':
      if (data.object.subscription) {
        await renewSubscription(data.object.subscription);
      }
      break;
    case 'customer.subscription.deleted':
      await updateSubscriptionByExternalId(data.object.id, 'canceled');
      break;
    default:
      console.log(`Unhandled Stripe event: ${type}`);
  }
  
  return { received: true };
}

// Process PayPal webhook events
async function handlePayPalWebhook(event: any) {
  const { event_type, resource } = event;
  
  switch (event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await updatePaymentByExternalReference(resource.id, 'completed');
      break;
    case 'PAYMENT.CAPTURE.DENIED':
      await updatePaymentByExternalReference(resource.id, 'failed');
      break;
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await updateSubscriptionByExternalId(resource.id, 'active');
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await updateSubscriptionByExternalId(resource.id, 'canceled');
      break;
    default:
      console.log(`Unhandled PayPal event: ${event_type}`);
  }
  
  return { received: true };
}

// Helper functions for webhook handlers
async function updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<Payment[] | null> { // Return type Payment[] due to .update() potentially affecting multiple rows if .eq was not unique, though 'id' should be.
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    } as Partial<Payment>)
    .eq('id', paymentId)
    .select(paymentColumnsSelect)
    .returns<Payment[]>(); // Explicitly type the returned array
    
  if (error) throw new Error(`Failed to update payment status: ${error.message}`);
  
  // If payment is for an order, update order status too
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_id', paymentId)
    .single<Pick<Order, 'id'>>(); // Type for selected data
    
  if (orderError && orderError.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Error fetching order for payment status update:', orderError.message);
  }
    
  if (orderData) {
    await supabase
      .from('orders')
      .update({ 
        status: status === 'completed' ? 'paid' : (status || 'unknown'), // Handle possible undefined status
        updated_at: new Date().toISOString()
      } as Partial<Order>) // Type assertion
      .eq('id', orderData.id);
  }
  
  return data;
}

async function updatePaymentByExternalReference(reference: string, status: Payment['status']): Promise<Payment[] | null> {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('external_reference', reference) // Changed from external_refer
    .select(paymentColumnsSelect)
    .returns<Payment[]>();
    
  if (error) throw new Error(`Failed to update payment by reference: ${error.message}`);
  return data;
}

async function updateSubscriptionByExternalId(externalId: string, status: UserSubscription['status']): Promise<UserSubscription[] | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    } as Partial<UserSubscription>)
    .eq('external_id', externalId)
    .select(userSubscriptionColumnsSelect)
    .returns<UserSubscription[]>(); // Explicitly type the returned array
    
  if (error) throw new Error(`Failed to update subscription by external ID: ${error.message}`);
  return data;
}

async function renewSubscription(subscriptionExternalId: string): Promise<UserSubscription | null> { 
  // Get subscription details
  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select(userSubscriptionColumnsSelect) 
    .eq('external_id', subscriptionExternalId)
    .single<UserSubscription>();
    
  if (error) throw new Error(`Failed to fetch subscription for renewal: ${error.message}`);
  if (!subscription) throw new Error('Subscription not found for renewal.');
  if (!subscription.current_period_end) throw new Error('Subscription current_period_end is not set.');

  // Calculate new period dates
  const currentPeriodEnd = new Date(subscription.current_period_end);
  const newPeriodStart = new Date(currentPeriodEnd);
  
  let newPeriodEnd;
  if (subscription.billing_interval === 'month') {
    newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
  } else {
    newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
  }
  
  // Update subscription period
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ 
      current_period_start: newPeriodStart.toISOString(),
      current_period_end: newPeriodEnd.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id)
    .select(userSubscriptionColumnsSelect) // Select the columns
    .single<UserSubscription>(); // Expect a single record back
    
  if (updateError) throw new Error(`Failed to renew subscription: ${updateError.message}`);
  return updatedSubscription; // Return the single updated UserSubscription or null
}
