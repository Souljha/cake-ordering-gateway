import { supabase } from '@/integrations/supabase/client';
import { getProductImageUrl } from './supabaseStorage';
import type { Tables } from './types'; // Import from your new types file

// Use the Tables type from your generated types
type Product = Tables<'products'>;

export const getProductById = async (id: string): Promise<Product | null> => {
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

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
};

// Update your fallbackProducts to match the new Product type
export const fallbackProducts: Product[] = [
  {
    id: 1, // Note: id is now a number in your schema
    name: "Chocolate Cake",
    description: "Delicious chocolate cake with rich frosting.",
    price: 25.99,
    category: "Cakes",
    image_url: "/images/chocolate-cake.jpg", // Use image_url instead of image
    popular: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z",
    is_vegan: false,
    embedding: null, // Add this field from your schema
    options: null, // Add this field from your schema
  },
  // ... other products
];