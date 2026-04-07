import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { MistralAIEmbeddings } from '@langchain/mistralai';
import path from 'path';

let vectorStore: MemoryVectorStore | null = null;

export async function initializeVectorStore() {
  if (vectorStore) {
    return vectorStore;
  }

  try {
    // Determine the path to the dummy truth data file
    const filePath = path.join(process.cwd(), 'src', 'data', 'mental-health-facts.md');
    
    console.log('Loading truth data from', filePath);

    // Load the document using TextLoader
    const loader = new TextLoader(filePath);
    const docs = await loader.load();

    // Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Initialize Mistral embeddings (requires MISTRAL_API_KEY in environment variables)
    const embeddings = new MistralAIEmbeddings({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    // Create the in-memory vector store
    vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    
    console.log('Vector Store initialized successfully with', splitDocs.length, 'chunks.');
    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize Vector Store:', error);
    throw error;
  }
}

export async function getRelevantContext(query: string, k: number = 3): Promise<string> {
  const store = await initializeVectorStore();
  
  if (!store) {
    return "No mental health context available.";
  }

  // Retrieve top k similar documents
  const results = await store.similaritySearch(query, k);
  
  // Combine their page content
  return results.map(r => r.pageContent).join('\n\n');
}
