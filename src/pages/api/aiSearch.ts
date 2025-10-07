import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  const agentId = process.env.OPENAI_AGENT_ID; // optional

  if (!client.apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing OPENAI_API_KEY' });
  }
  if (!workflowId && !agentId) {
    return res.status(500).json({ error: 'Server misconfiguration: missing OPENAI_WORKFLOW_ID or OPENAI_AGENT_ID' });
  }

  try {
    // Prefer workflow if provided, else agent
    if (workflowId) {
      type WorkflowsClient = {
        runs: {
          create: (input: { workflow_id: string; input: unknown }) => Promise<{ id: string }>;
          retrieve: (id: string) => Promise<{ status: 'queued' | 'running' | 'completed' | 'failed' | 'canceled'; output?: unknown }>
        }
      };
      const wf = (client as unknown as { workflows?: WorkflowsClient }).workflows;
      if (wf) {
        const run = await wf.runs.create({ workflow_id: workflowId, input: { prompt: query } });

        // Poll for completion (simple approach)
        let result = await wf.runs.retrieve(run.id);
        const started = Date.now();
        while (result.status === 'running' || result.status === 'queued') {
          if (Date.now() - started > 30000) break; // 30s cap
          await new Promise((r) => setTimeout(r, 800));
          result = await wf.runs.retrieve(run.id);
        }

        const out = result.output as unknown;
        let text = '';
        if (typeof out === 'string') {
          text = out;
        } else if (out && typeof out === 'object' && 'text' in out) {
          const candidate = (out as { text?: unknown }).text;
          text = typeof candidate === 'string' ? candidate : '';
        }
        if (!text) text = 'No results found.';
        return res.status(200).json({ text });
      }
      // If workflows client not present, fall through to agent/chat path
    }

    // Fallback to agent chat if no workflow available
    const chat = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an agent that searches Reddit for Makeup Artists by city and returns concise lists of names.' },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
    });

    // The SDK types for chat may be loose; safely extract string
    const choice: unknown = (chat as unknown as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0];
    const content = choice && typeof choice === 'object' && 'message' in choice
      ? ((choice as { message?: { content?: unknown } }).message?.content)
      : undefined;
    const text = typeof content === 'string' ? content : 'No results found.';
    return res.status(200).json({ text });
  } catch (err: unknown) {
    const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : 'Unknown error';
    console.error('aiSearch error:', msg);
    return res.status(500).json({ error: 'Failed to run AI search' });
  }
}
