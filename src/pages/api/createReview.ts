import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      user_email,
      barber_name,
      shop_name,
      location,
      service_type,
      rating,
      cost,
      date,
      title,
      review_text,
      photos,
      is_public
    } = req.body;

    // Validate required fields
    if (!user_email || !barber_name || !shop_name || !location || !service_type || !rating || !cost || !date || !title || !review_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Insert the review into the database
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_email,
        barber_name,
        shop_name,
        location,
        service_type,
        rating,
        cost,
        date,
        title,
        review_text,
        photos: photos || [],
        is_public: is_public !== false, // Default to true if not specified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // Also update or create barber record
    const { data: existingBarber } = await supabase
      .from('barbers')
      .select('*')
      .eq('name', barber_name)
      .eq('shop_name', shop_name)
      .single();

    if (existingBarber) {
      // Update existing barber stats
      const { error: updateError } = await supabase
        .from('barbers')
        .update({
          total_reviews: (existingBarber.total_reviews || 0) + 1,
          average_rating: ((existingBarber.average_rating || 0) * (existingBarber.total_reviews || 0) + rating) / ((existingBarber.total_reviews || 0) + 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBarber.id);

      if (updateError) {
        console.error('Error updating barber stats:', updateError);
      }
    } else {
      // Create new barber record
      const { error: insertError } = await supabase
        .from('barbers')
        .insert([{
          name: barber_name,
          shop_name,
          location,
          average_rating: rating,
          total_reviews: 1,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error creating barber record:', insertError);
      }
    }

    res.status(201).json({ success: true, review: data });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
