import { Database, Product } from './types';
import { supabase } from './supabase';
import { generateEmbedding } from './embeddings';

// Function to fetch all products
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

// Function to fetch a single product by ID
export async function searchProducts(query: string) {
  try {
    const embedding = await generateEmbedding(query);

    // Use type assertion to bypass TypeScript's type checking for the RPC function
    const { data, error } = await (supabase
      .rpc('match_products', {
        query_embedding: embedding,
        match_threshold: 0.78,
        match_count: 10
      }) as unknown as Promise<{ data: Product[]; error: any }>);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in search products:', error);
    // Fallback to a basic search if embeddings fail
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    return data || [];
  }
}

// Function to insert a new product
export async function insertProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error inserting product:', error);
    throw error;
  }

  return data;
}

// Function to update an existing product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

// Function to delete a product
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Function to fetch products with filters
export async function fetchFilteredProducts(
  category?: string,
  priceRange?: { min: number; max: number },
  isVegan?: boolean,
  search?: string
): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (priceRange) {
    query = query.gte('price', priceRange.min).lte('price', priceRange.max);
  }

  if (isVegan !== undefined) {
    query = query.eq('is_vegan', isVegan);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered products:', error);
    throw error;
  }

  return data || [];
}

