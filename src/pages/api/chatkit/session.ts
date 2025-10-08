import type { NextApiRequest, NextApiResponse } from 'next';

// Minimal placeholder that returns the workflow id needed by the ChatKit client.
// In a production app, you would mint a short-lived client secret using OpenAI's
// server-side API and include any auth claims (like user id/email).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  if (!workflowId) {
    return res.status(500).json({ error: 'Missing OPENAI_WORKFLOW_ID' });
  }

  // Optionally, verify logged-in user here if your widget relies on auth.
  // For now, just return a payload telling the client which workflow to use.
  return res.status(200).json({ workflow_id: workflowId });
}
