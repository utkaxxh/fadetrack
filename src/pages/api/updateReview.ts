import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, user_email, title, review_text, rating, cost, date, service_type, is_public } = req.body || {};

    if (!id || !user_email) {
      return res.status(400).json({ error: 'Review ID and user email are required' });
    }

    // Fetch existing review to verify ownership and get old values
    const { data: existingReview, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('user_email', user_email)
      .single();

    if (fetchError || !existingReview) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    const updates: Partial<{
      title: string;
      review_text: string;
      rating: number;
      cost: string;
      date: string;
      service_type: string;
      is_public: boolean;
    }> = {};
    if (typeof title === 'string') updates.title = title;
    if (typeof review_text === 'string') updates.review_text = review_text;
    if (typeof rating === 'number') {
      if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      updates.rating = rating;
    }
    if (typeof cost === 'string') updates.cost = cost;
    if (typeof date === 'string') updates.date = date;
    if (typeof service_type === 'string') updates.service_type = service_type;
    if (typeof is_public === 'boolean') updates.is_public = is_public;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    // Update the review
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_email', user_email)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating review:', updateError);
      return res.status(500).json({ error: 'Failed to update review' });
    }

    // If rating changed, adjust barber stats
    if (typeof rating === 'number' && rating !== existingReview.rating) {
      const { data: barber } = await supabaseAdmin
        .from('barbers')
        .select('*')
        .eq('name', existingReview.barber_name)
        .eq('shop_name', existingReview.shop_name)
        .single();

      if (barber && typeof barber.total_reviews === 'number' && barber.total_reviews > 0) {
        const total = barber.total_reviews;
        const currentAvg = Number(barber.average_rating) || 0;
        const newAvg = ((currentAvg * total) - existingReview.rating + rating) / total;
        await supabaseAdmin
          .from('barbers')
          .update({ average_rating: Math.round(newAvg * 100) / 100, updated_at: new Date().toISOString() })
          .eq('id', barber.id);
      }
    }

    return res.status(200).json({ success: true, review: updated });
  } catch (error) {
    console.error('Update review API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
