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

  try {
    const { data: professionals, error } = await supabase
      .from('professional_profiles')
      .select(`
        id,
        business_name,
        display_name,
        profession_type,
        bio,
        city,
        state,
        specialties,
        average_rating,
        total_reviews,
        years_experience,
        is_verified,
        profile_image
      `)
      .eq('is_active', true) // Only show active profiles
      .order('average_rating', { ascending: false }); // Order by rating, then by total reviews

    if (error) {
      console.error('Error fetching professionals directory:', error);
      return res.status(500).json({ error: 'Failed to fetch professionals' });
    }

    // Transform data to ensure specialties is always an array
    const transformedProfessionals = (professionals || []).map(prof => ({
      ...prof,
      specialties: prof.specialties || [],
      average_rating: prof.average_rating || 0,
      total_reviews: prof.total_reviews || 0
    }));

    return res.status(200).json({ professionals: transformedProfessionals });
  } catch (error) {
    console.error('Professional directory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
