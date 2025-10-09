import type { NextApiRequest, NextApiResponse } from 'next';

// Creates a ChatKit session by calling OpenAI's API and returns the client_secret
// This client_secret is used by the ChatKit frontend to connect to the workflow
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!workflowId) {
    return res.status(500).json({ error: 'Missing OPENAI_WORKFLOW_ID' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    // Call OpenAI's ChatKit session API to create a new session
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        // Optionally include user identifier for tracking
        // user: req.body?.user || 'anonymous',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChatKit session creation failed:', errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create ChatKit session',
        details: errorText 
      });
    }

    const data = await response.json();
    
    // Return the client_secret that ChatKit needs
    return res.status(200).json({ client_secret: data.client_secret });
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
