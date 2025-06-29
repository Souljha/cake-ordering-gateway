import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { supabase } from './supabase';
import type { Product, ProductWithEmbedding } from '../integrations/supabase/types';
import type { PostgrestResponse, PostgrestMaybeSingleResponse } from '@supabase/supabase-js';

// Create an Ollama embeddings instance
const ollamaEmbeddings = new OllamaEmbeddings({
  baseUrl: "http://localhost:11434",
  model: "nomic-embed-text"
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`Generating embedding for text: "${text.substring(0, 30)}..."`);
    
    // Using Ollama for embeddings
    const result = await ollamaEmbeddings.embedQuery(text);
    
    console.log(`Successfully generated embedding with length: ${result.length}`);
    return result;
  } catch (error) {
    console.error('Error generating embedding with Ollama:', error);
    // Fallback to a simple embedding if the API fails
    return createSimpleEmbedding(text);
  }
}

// Simple fallback function that creates basic embeddings
function createSimpleEmbedding(text: string): number[] {
  console.warn('Using fallback simple embedding method');
  // Create a simple hash-based embedding (not for production use)
  const embedding = new Array(768).fill(0);
  
  // Fill with some values based on the text
  for (let i = 0; i < text.length && i < embedding.length; i++) {
    embedding[i % embedding.length] += text.charCodeAt(i) / 255;
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
}

// The rest of your functions remain the same
export async function updateProductEmbeddings() {
  console.log('Starting to update product embeddings for products with NULL embeddings...');
  
  // Use PostgrestResponse for better type safety
  const { data: products, error }: PostgrestResponse<Pick<Product, 'id' | 'name' | 'description'>> = await supabase
    .from('products')
    .select('id, name, description')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products?.length || 0} products with NULL embeddings to process.`);

  for (const product of products || []) {
    console.log(`Processing product ID ${product.id}: ${product.name}`);
    const embedding = await generateEmbedding(`${product.name} ${product.description}`);

    if (embedding && Array.isArray(embedding)) {
      console.log(`  Generated embedding for product ${product.id} with length: ${embedding.length}. Attempting update...`);
      
      // Cast the update object to include 'embedding' as it's missing from the auto-generated types
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          embedding: embedding 
        } as any) // Workaround: Cast to allow the embedding field
        .eq('id', product.id);

      if (updateError) {
        console.error(`  Error updating embedding for product ${product.id} (${product.name}):`, updateError.message);
      } else {
        console.log(`  Successfully updated embedding for product ${product.id} (${product.name}).`);
      }
    } else {
      console.error(`  Failed to generate a valid embedding for product ${product.id}. Skipping update.`);
    }
  }
  
  console.log('Finished updating product embeddings');
}

export async function refreshAllProductEmbeddings() {
  console.log('Starting to refresh all product embeddings...');
  try {
    // Use PostgrestResponse for better type safety
    const { data: products, error }: PostgrestResponse<Pick<Product, 'id' | 'name' | 'description'>> = await supabase
      .from('products')
      .select('id, name, description');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log(`Found ${products?.length || 0} products to process for embedding updates.`);

    for (const product of products || []) {
      console.log(`Processing product ID ${product.id}: ${product.name}`);
      const embedding = await generateEmbedding(`${product.name} ${product.description}`);

      // Add detailed logging before update
      if (embedding && Array.isArray(embedding)) {
        console.log(`  Generated embedding for product ${product.id} with length: ${embedding.length}. Attempting update...`);
        
        // Send the embedding as a plain array - Supabase's JS client will handle the conversion
        // Cast the update object to include 'embedding' as it's missing from the auto-generated types
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            embedding: embedding 
          } as any) // Workaround: Cast to allow the embedding field
          .eq('id', product.id);

        if (updateError) {
          console.error(`  Error updating embedding for product ${product.id} (${product.name}):`, updateError.message);
          
          // Commenting out RPC fallback as its existence is uncertain
          // console.log(`  Trying alternative update method for product ${product.id}...`);
          // const { error: rpcError } = await supabase.rpc('update_product_embedding', {
          //   product_id: product.id,
          //   embedding_array: embedding
          // });
          // if (rpcError) {
          //   console.error(`  Alternative update method also failed for product ${product.id}:`, rpcError.message);
          // } else {
          //   console.log(`  Successfully updated embedding for product ${product.id} using alternative method.`);
          // }
        } else {
          console.log(`  Successfully updated embedding for product ${product.id} (${product.name}).`);
        }
      } else {
        console.error(`  Failed to generate a valid embedding for product ${product.id}. Skipping update.`);
      }
    }
    
    // Check if the embeddings were stored correctly
    await checkProductEmbeddings();
    
    console.log('Finished refreshing all product embeddings');
  } catch (error) {
    console.error('Error in refreshAllProductEmbeddings:', error);
  }
}

// Add this function to your embeddings.ts file
export async function checkProductEmbeddings() {
  console.log('Checking product embeddings...');
  
  try {
    // Fetch data. The type of the data returned by select() is Product (embedding is string)
    const response: PostgrestMaybeSingleResponse<Product> = await supabase
      .from('products')
      .select('id, name, embedding, description, category, price, image_url, is_vegan, popular, options, created_at, updated_at') // Fetch all fields for Product
      .limit(1)
      .maybeSingle(); 

    const { data: rawProduct, error } = response;

    if (error && error.code !== 'PGRST116') { 
      console.error('Error fetching product:', error.message);
      return;
    }
    
    if (!rawProduct) { // rawProduct is of type Product | null
      console.log('No products found to check.');
      return;
    }
    
    // rawProduct is now confirmed to be Product (not null)
    // Its 'embedding' property is string | null.
    // We need to convert rawProduct (Product) to productForCheck (ProductWithEmbedding)

    let embeddingArray: number[] | null = null;
    if (typeof rawProduct.embedding === 'string') {
      try {
        const parsed = JSON.parse(rawProduct.embedding);
        if (Array.isArray(parsed) && parsed.every(x => typeof x === 'number')) {
          embeddingArray = parsed;
        } else {
          console.error('Parsed embedding is not a valid number array. Raw:', rawProduct.embedding);
        }
      } catch (parseError) {
        console.error('Failed to parse string embedding:', parseError, 'Raw:', rawProduct.embedding);
      }
    } else if (rawProduct.embedding === null) {
      // embeddingArray is already null
    } else {
      // This case should not be reached if DB stores vector as string or it's null
      console.warn(`Embedding for product ${rawProduct.id} is neither string nor null, but ${typeof rawProduct.embedding}. Value:`, rawProduct.embedding);
    }

    const productForCheck: ProductWithEmbedding = {
      ...rawProduct, // Spread all properties from rawProduct
      embedding: embeddingArray, // Override embedding with the parsed number[] | null
    };
    
    console.log(`Checking Product ID: ${productForCheck.id}, Name: ${productForCheck.name}`);
    
    if (productForCheck.embedding) { // This is now number[]
      const currentEmbeddingArray = productForCheck.embedding;

      console.log('Embedding type:', typeof currentEmbeddingArray); 
      console.log('Embedding is array:', Array.isArray(currentEmbeddingArray)); 
      console.log('Embedding length:', currentEmbeddingArray.length);
      console.log('Embedding sample:', currentEmbeddingArray.slice(0, 5));

      // Try a vector similarity search to verify the embeddings are working
      // The RPC function 'match_products' expects 'query_embedding' as a string.
      const { data: similarProducts, error: searchError } = await supabase.rpc(
        'match_products',
        {
          query_embedding: JSON.stringify(currentEmbeddingArray), // Stringify for the RPC
          match_threshold: 0.5,
          match_count: 5
        }
      );

      if (searchError) {
        console.error('Error performing similarity search:', searchError);
      } else {
        console.log('Similarity search results:', similarProducts);
      }
    } else {
      console.log(`Embedding is NULL or could not be parsed for product ${productForCheck.id}.`);
    }
    
    // Optional: Generate a new embedding for comparison if needed
    // const testEmbedding = await generateEmbedding(productForCheck.name ?? ''); // Ensure name is not null
    // console.log('Newly generated embedding sample:', testEmbedding.slice(0, 5));

  } catch (error) {
    console.error('Error in checkProductEmbeddings:', error);
  }
}
