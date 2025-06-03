import { generateEmbedding } from './embeddings';
import { supabase } from './supabase';
import type { Product, ProductWithEmbedding } from '../integrations/supabase/types';

// Example function for creating a product with embedding
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'embedding'>) {
  try {
    // Generate embedding for the product
    const embedding = await generateEmbedding(`${product.name} ${product.description}`);
    
    // Add the embedding to the product data
    const productWithEmbedding = {
      ...product,
      embedding
    };
    
    // Insert the product with embedding into the database
    const { data, error } = await supabase
      .from('products')
      .insert(productWithEmbedding)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product with embedding:', error);
    throw error;
  }
}

// Example function for updating a product with embedding
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'embedding'>>) {
  try {
    // If name or description is being updated, regenerate the embedding
    if (updates.name || updates.description) {
      // First get the current product data
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('name, description')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Generate new embedding using updated text
      const name = updates.name || currentProduct.name;
      const description = updates.description || currentProduct.description;
      const embedding = await generateEmbedding(`${name} ${description}`);
      
      // Add the embedding to the updates
      const updatesWithEmbedding = {
        ...updates,
        embedding
      } as ProductWithEmbedding;
      
      // Update the product with the new embedding
      const { data, error } = await supabase
        .from('products')
        .update(updatesWithEmbedding)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // If name and description aren't changing, no need to update embedding
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating product with embedding:', error);
    throw error;
  }
}