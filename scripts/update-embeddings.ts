import { createEmbeddings } from '../src/lib/rag-setup';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

async function loadDocuments() {
  const docsDir = path.join(__dirname, '../knowledge');
  
  try {
    const files = await fs.readdir(docsDir);
    const textFiles = files.filter(file => file.endsWith('.txt') || file.endsWith('.md'));
    
    const documents = await Promise.all(
      textFiles.map(async (file) => {
        const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
        return content;
      })
    );
    
    return documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

async function main() {
  try {
    console.log('Loading documents...');
    
    // Use the existing loadDocuments function to get the content of the knowledge files
    const documents = await loadDocuments();
    
    if (documents.length === 0) {
      console.warn('No documents found to create embeddings from. Please ensure files are in the knowledge directory.');
      return;
    }

    console.log(`Found ${documents.length} documents. Generating embeddings...`);
    
    // Generate and store embeddings
    const result = await createEmbeddings(documents);
    
    if (result.success) {
      console.log(`Successfully created ${result.count} embeddings.`);
    } else {
      console.error('Failed to create embeddings:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error updating embeddings:', error);
    process.exit(1);
  }
}

main();
