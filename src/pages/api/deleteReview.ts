import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, user_email } = req.body;

    if (!id || !user_email) {
      return res.status(400).json({ error: 'Review ID and user email are required' });
    }

    // First, get the review to verify ownership and get barber info for stats update
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('user_email', user_email)
      .single();

    if (fetchError || !review) {
      console.error('Error fetching review for deletion:', fetchError);
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    // Delete the review
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_email', user_email);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete review' });
    }

    // Update barber stats after review deletion
    const { data: existingBarber } = await supabaseAdmin
      .from('barbers')
      .select('*')
      .eq('name', review.barber_name)
      .eq('shop_name', review.shop_name)
      .single();

    if (existingBarber && existingBarber.total_reviews > 1) {
      // Recalculate average rating without the deleted review
      const newTotalReviews = existingBarber.total_reviews - 1;
      const newTotalRating = (existingBarber.average_rating * existingBarber.total_reviews) - review.rating;
      const newAverageRating = newTotalRating / newTotalReviews;

      const { error: updateError } = await supabaseAdmin
        .from('barbers')
        .update({
          total_reviews: newTotalReviews,
          average_rating: newAverageRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBarber.id);

      if (updateError) {
        console.error('Error updating barber stats:', updateError);
      }
    } else if (existingBarber && existingBarber.total_reviews === 1) {
      // Delete barber record if this was their only review
      const { error: deleteBarberError } = await supabaseAdmin
        .from('barbers')
        .delete()
        .eq('id', existingBarber.id);

      if (deleteBarberError) {
        console.error('Error deleting barber record:', deleteBarberError);
      }
    }

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
