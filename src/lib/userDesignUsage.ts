import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_TIERS } from './subscriptionTiers';

// Define subscription plan IDs that correspond to your database
export type SubscriptionPlanId = string;

// Get user's current subscription plan
export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlanId | null> {
  if (!userId) return null; // Default for non-logged in users
  
  // Get the user's active subscription with plan details
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      id,
      plan_id,
      status,
      subscription_plans:plan_id (id, name, features)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data || !data.plan_id) {
    console.log('No active subscription found, defaulting to free tier');
    return null;
  }
  
  return data.plan_id;
}

// Get how many designs user has generated today
export async function getUserDesignCount(userId: string): Promise<number> {
  // Get the start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Query the design_generations table for today's count
  const { data, error, count } = await supabase
    .from('design_generations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());
  
  if (error) {
    console.error('Error fetching design count:', error);
    return 0;
  }
  
  return count || 0;
}

// Record a new design generation
export async function recordDesignGeneration(userId: string, imageUrl: string, prompt: string): Promise<void> {
  const { error } = await supabase
    .from('design_generations')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      prompt: prompt,
      created_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error recording design generation:', error);
    throw error;
  }
}

// Map subscription plan to design limits
export async function getDesignLimitForPlan(planId: SubscriptionPlanId | null): Promise<number> {
  if (!planId) return 1; // Free tier gets 1 design per day
  
  // Fetch the plan details from subscription_plans table
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('name, features')
    .eq('id', planId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching plan details:', error);
    return 1; // Default to free tier limit
  }
  
  // Map plan names to design limits
  const planName = data.name?.toLowerCase() || '';
  
  if (planName.includes('super') || planName.includes('premium')) {
    return 10; // Super Cake Lovers
  } else if (planName.includes('lover')) {
    return 5; // Cake Lovers
  } else {
    return 1; // Default/Free tier
  }
}

// Check if user can generate more designs today
export async function canUserGenerateDesign(userId: string): Promise<{
  canGenerate: boolean;
  remainingDesigns: number;
  planId: SubscriptionPlanId | null;
  maxDesigns: number;
  planName: string | null;
}> {
  const planId = await getUserSubscriptionPlan(userId);
  const currentCount = await getUserDesignCount(userId);
  const maxDesigns = await getDesignLimitForPlan(planId);
  const remainingDesigns = Math.max(0, maxDesigns - currentCount);
  
  // Get plan name if we have a plan ID
  let planName = null;
  if (planId) {
    const { data } = await supabase
      .from('subscription_plans')
      .select('name')
      .eq('id', planId)
      .single();
    
    planName = data?.name || null;
  } else {
    planName = "Everyday Cake"; // Default free tier name
  }
  
  return {
    canGenerate: remainingDesigns > 0,
    remainingDesigns,
    planId,
    maxDesigns,
    planName
  };
}