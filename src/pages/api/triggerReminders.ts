import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call the sendReminders API
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/sendReminders`, {
      method: 'GET',
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({
        status: 'Manual reminder trigger successful',
        result
      });
    } else {
      res.status(500).json({
        status: 'Manual reminder trigger failed',
        error: result
      });
    }
  } catch (error) {
    console.error('Error triggering manual reminders:', error);
    res.status(500).json({ 
      status: 'Error triggering manual reminders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
