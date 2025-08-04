import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { professionalEmail } = req.query;

  if (!professionalEmail) {
    return res.status(400).json({ error: 'Professional email is required' });
  }

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('barber_name', professionalEmail) // Assuming barber_name stores professional email
      .eq('is_public', true) // Only fetch public reviews
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    return res.status(200).json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Public reviews API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
