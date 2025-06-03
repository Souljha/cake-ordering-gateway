import { OllamaEmbeddings } from 'langchain/embeddings/ollama';

async function checkNomicEmbeddingDimension() {
  try {
    // Initialize the embeddings model - same as in your rag-setup.ts
    const embeddings = new OllamaEmbeddings({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text"
    });
    
    // Generate an embedding for a test text
    const text = "This is a test sentence to check embedding dimensions";
    console.log(`Generating embedding for: "${text}"`);
    
    // Get the embedding vector
    const result = await embeddings.embedQuery(text);
    
    // Log the dimension and some sample values
    console.log(`Embedding dimension: ${result.length}`);
    console.log(`First few values: ${result.slice(0, 5).join(', ')}`);
    console.log(`Last few values: ${result.slice(-5).join(', ')}`);
    
    return result.length;
  } catch (error) {
    console.error('Error checking embedding dimension:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

// Run the function
checkNomicEmbeddingDimension()
  .then(dimension => {
    console.log(`\nThe nomic-embed-text embedding dimension is: ${dimension}`);
    console.log(`\nYou'll need this value when setting up your Supabase vector store.`);
  })
  .catch(err => console.error('Failed to check dimension:', err));