import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set this in Vercel Environment Variables
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  try {
    // 1. Create a thread
    const thread = await openai.beta.threads.create();

    // 2. Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: userMessage,
    });

    // 3. Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID, // 👈 Add this in Vercel env variables
    });

    // 4. Poll for completion
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== 'completed' && runStatus.status !== 'failed');

    if (runStatus.status === 'failed') {
      throw new Error('Assistant run failed');
    }

    // 5. Retrieve messages from the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find(msg => msg.role === 'assistant');

    res.status(200).json({ reply: lastMessage?.content[0]?.text?.value || 'No reply found.' });
  } catch (error) {
    console.error('OpenAI Assistants API error:', error);
    res.status(500).json({ error: 'Failed to communicate with Assistant' });
  }
}
