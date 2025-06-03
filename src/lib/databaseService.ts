import { supabase } from '@/integrations/supabase/client'; // Adjust the import path to match your project structure
import type { Tables, TablesInsert, TablesUpdate } from './types';

/**
 * Fetches a product by its ID
 */
export const getProduct = async (id: number): Promise<Tables<'products'> | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
};

/**
 * Creates a new payment record
 */
export const createPayment = async (payment: TablesInsert<'payments'>): Promise<Tables<'payments'> | null> => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating payment:', error);
    return null;
  }
  
  return data;
};

/**
 * Fetches all products in a specific category
 */
export const getProductsByCategory = async (category: string): Promise<Tables<'products'>[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);
  
  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
  
  return data || [];
};

/**
 * Updates an existing order
 */
export const updateOrder = async (
  id: string, 
  updates: TablesUpdate<'orders'>
): Promise<Tables<'orders'> | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    return null;
  }
  
  return data;
};