import { Mistral } from '@mistralai/mistralai';
import { getRelevantContext } from '@/lib/rag';

const apiKey = process.env.MISTRAL_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: RequestBody = await req.json(); // Parse the request body with proper typing
    let { messages } = body; // Extract messages from the request body

    console.log('Messages:', body);

    // Retrieve the last user message to use as the query
    const lastMessage = messages[messages.length - 1];
    let contextData = '';
    
    if (lastMessage && lastMessage.role === 'user') {
      let query = lastMessage.content;
      const splitIndex = query.indexOf('The user message is ');
      if (splitIndex !== -1) {
        query = query.substring(splitIndex + 'The user message is '.length);
      }
      contextData = await getRelevantContext(query);
    }
    
    // Inject the system instruction with the context data
    if (contextData) {
      messages = [
        {
          role: 'system',
          content: `You are Mindful AI, a helpful mental health bot. Use the following context to answer the user's question, but don't state that you are reading from context. Keep it soothing and helpful.\n\nContext:\n${contextData}`
        },
        ...messages
      ];
    }

    const client = new Mistral({ apiKey });

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages, // Pass the parsed messages
    });

    const chatContent = chatResponse.choices && chatResponse.choices[0]?.message?.content;


    // Return the chat response back to the frontend
    return new Response(
      JSON.stringify({
        success: true,
        message: chatContent,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in POST handler:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
