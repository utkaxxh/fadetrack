import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Main ChatKit server endpoint that handles chat interactions
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!workflowId || !apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const client = new OpenAI({ apiKey });
    const body = req.body;

    // Handle different ChatKit server protocol messages
    if (body.type === 'thread.create') {
      // Create a new thread
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return res.status(200).json({
        type: 'thread.created',
        thread: {
          id: threadId,
          created_at: new Date().toISOString(),
        },
      });
    }

    if (body.type === 'message.create') {
      // Handle incoming message and stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const { content, thread_id } = body;
      
      try {
        // Use OpenAI's completion API with streaming
        const stream = await client.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for finding makeup artists. Help users search for and discover makeup artists in their area.',
            },
            {
              role: 'user',
              content: content,
            },
          ],
          stream: true,
        });

        // Stream the response back to ChatKit
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const chunk of stream as any) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({
              type: 'message.delta',
              delta: { content },
            })}\n\n`);
          }
        }

        // Send completion event
        res.write(`data: ${JSON.stringify({
          type: 'message.completed',
          message: {
            id: `msg_${Date.now()}`,
            thread_id,
            role: 'assistant',
            created_at: new Date().toISOString(),
          },
        })}\n\n`);

        res.end();
      } catch (error) {
        console.error('Error streaming response:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: { message: 'Failed to process message' },
        })}\n\n`);
        res.end();
      }
      return;
    }

    // Default response for unknown message types
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('ChatKit server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
