import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role for administrative operations if available, otherwise use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Prefer service role, fallback to anon key
const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
      city,
      state,
      country,
      place_id,
      service_type,
      rating,
      cost,
      date,
      title,
      review_text,
      photos,
      is_public
    } = req.body;

    // Validate required fields (cost is optional)
    if (!user_email || !barber_name || !shop_name || !location || !service_type || !rating || !date || !title || !review_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // First, find or create the barber record
    let barberId;
    
    console.log('Attempting to find barber with:', { barber_name, shop_name, location });
    
    // Check if barber already exists
    const { data: existingBarber, error: selectError } = await supabaseAdmin
      .from('barbers')
      .select('*')
      .eq('name', barber_name)
      .eq('shop_name', shop_name)
      .eq('location', location)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error finding barber:', selectError);
    }

    if (existingBarber) {
      console.log('Found existing barber:', existingBarber.id);
      barberId = existingBarber.id;
      
      // Update existing barber stats
      const newTotalReviews = (existingBarber.total_reviews || 0) + 1;
      const newAverageRating = ((existingBarber.average_rating || 0) * (existingBarber.total_reviews || 0) + rating) / newTotalReviews;
      
      const { error: updateError } = await supabaseAdmin
        .from('barbers')
        .update({
          total_reviews: newTotalReviews,
          average_rating: Math.round(newAverageRating * 100) / 100 // Round to 2 decimal places
        })
        .eq('id', existingBarber.id);

      if (updateError) {
        console.error('Error updating barber stats:', updateError);
        return res.status(500).json({ error: 'Failed to update barber stats' });
      }
    } else {
      console.log('Creating new barber record...');
      
      // Create new barber record
      const { data: newBarber, error: insertError } = await supabaseAdmin
        .from('barbers')
        .insert([{
          name: barber_name,
          shop_name,
          location,
          average_rating: rating,
          total_reviews: 1
        }])
        .select()
        .single();

      if (insertError || !newBarber) {
        console.error('Error creating barber record:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError, null, 2));
        
        // If RLS is blocking, let's try a different approach
        if (insertError?.code === '42501' || insertError?.message?.includes('permission')) {
          console.log('RLS blocking insert, this is expected in some configurations');
          return res.status(500).json({ 
            error: 'Database permission error. Please contact support to enable review posting.',
            details: 'RLS policies need to be configured properly for barber creation',
            code: 'RLS_PERMISSION_DENIED'
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to create barber record', 
          details: insertError?.message || 'Unknown error',
          code: insertError?.code || 'UNKNOWN'
        });
      }
      
      console.log('Created new barber:', newBarber.id);
      barberId = newBarber.id;
    }

    console.log('Creating review with barber_id:', barberId);
    
    // Now insert the review with the barber_id
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        user_email,
        barber_id: barberId,
        barber_name,
        shop_name,
        location,
        city: city || '',
        state: state || '',
        country: country || '',
        place_id: place_id || null,
        service_type,
        rating,
  cost: cost || '',
        date,
        title,
        review_text,
        photos: photos || [],
        is_public: is_public !== false // Default to true if not specified
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating review:', error);
      console.error('Review error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to create review: ' + error.message,
        details: error.details || 'Unknown error',
        code: error.code || 'UNKNOWN'
      });
    }

    res.status(201).json({ success: true, review: data });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
