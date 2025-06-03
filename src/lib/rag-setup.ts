import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { pipeline, env } from '@xenova/transformers';
import { Embeddings, EmbeddingsParams } from 'langchain/embeddings/base';

// Set the cache directory for models
env.cacheDir = './.cache/transformers';
// Disable local model check for now, as it might cause issues with dynamic imports
env.allowLocalModels = false;

// Custom Xenova Embeddings class
class XenovaEmbeddings extends Embeddings {
  private embedder: any;
  private model: string;

  constructor(fields?: Partial<EmbeddingsParams> & { model?: string }) {
    super(fields ?? {});
    this.model = fields?.model || 'Xenova/all-MiniLM-L6-v2';
  }

  async _embed(text: string): Promise<number[]> {
    if (!this.embedder) {
      this.embedder = await pipeline('feature-extraction', this.model);
    }
    const output = await this.embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      embeddings.push(await this._embed(text));
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    return this._embed(text);
  }
}

// List of knowledge files to load (update this list if you add/remove files)
const KNOWLEDGE_FILES = [
  'Cake products.txt',
  'FAQ.txt',
  'Price list.txt',
];

// Initialize embeddings and vector store
let vectorStore: HNSWLib | null = null;

// Function to load documents from knowledge directory using fetch
async function loadKnowledgeDocuments() {
  try {
    const documents: Document[] = [];
    for (const file of KNOWLEDGE_FILES) {
      // Assumes files are served from /knowledge/ in public directory
      const response = await fetch(`/knowledge/${encodeURIComponent(file)}`);
      if (!response.ok) {
        console.warn(`Failed to fetch knowledge file: ${file}`);
        continue;
      }
      const content = await response.text();
      documents.push(
        new Document({
          pageContent: content,
          metadata: { source: file }
        })
      );
    }
    if (documents.length === 0) {
      console.warn('No knowledge documents loaded');
    } else {
      console.log(`Loaded ${documents.length} knowledge documents`);
    }
    return documents;
  } catch (error) {
    console.error('Error loading knowledge documents:', error);
    return [];
  }
}

// Initialize the vector store with documents
export async function initializeVectorStore() {
  try {
    const documents = await loadKnowledgeDocuments();
    
    if (documents.length === 0) {
      console.warn('No documents to initialize vector store');
      return;
    }
    
    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(documents);
    console.log(`Split into ${splitDocs.length} chunks`);
    
    // Initialize embeddings
    const embeddings = new XenovaEmbeddings();
    
    // Create vector store
    vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
    console.log('Vector store initialized successfully');
  } catch (error) {
    console.error('Failed to initialize vector store:', error);
  }
}

// Query embeddings for relevant documents
export async function queryEmbeddings(query: string, k: number = 3): Promise<Document[]> {
  if (!vectorStore) {
    await initializeVectorStore();
    
    if (!vectorStore) {
      throw new Error('Vector store initialization failed');
    }
  }
  
  try {
    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error querying embeddings:', error);
    throw error;
  }
}

// Initialize vector store on module load
initializeVectorStore().catch(console.error);

// Path to knowledge documents (no longer used, kept for reference)
// const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');
