import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Review responses API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { professionalEmail } = req.query;

  if (!professionalEmail) {
    return res.status(400).json({ error: 'Professional email is required' });
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('barber_name', professionalEmail) // Assuming barber_name stores professional email
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }

  return res.status(200).json({ reviews });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { reviewId, response, professionalEmail } = req.body;

  if (!reviewId || !response || !professionalEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // First, verify the review belongs to this professional
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('barber_name', professionalEmail)
    .single();

  if (fetchError || !review) {
    return res.status(404).json({ error: 'Review not found or unauthorized' });
  }

  // Update the review with the professional response
  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update({
      professional_response: response,
      response_date: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review response:', error);
    return res.status(500).json({ error: 'Failed to add response' });
  }

  return res.status(200).json({ review: updatedReview });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { reviewId, response, professionalEmail } = req.body;

  if (!reviewId || !response || !professionalEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // First, verify the review belongs to this professional
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('barber_name', professionalEmail)
    .single();

  if (fetchError || !review) {
    return res.status(404).json({ error: 'Review not found or unauthorized' });
  }

  // Update the review response
  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update({
      professional_response: response,
      response_date: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review response:', error);
    return res.status(500).json({ error: 'Failed to update response' });
  }

  return res.status(200).json({ review: updatedReview });
}
