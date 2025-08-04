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

  const { id, email } = req.query;

  if (!id && !email) {
    return res.status(400).json({ error: 'Professional ID or email is required' });
  }

  try {
    let query = supabase
      .from('professional_profiles')
      .select(`
        *,
        professional_services:professional_services!professional_id (
          id,
          name,
          description,
          price,
          duration_minutes,
          is_active
        ),
        professional_portfolio:professional_portfolio!professional_id (
          id,
          image_url,
          caption,
          service_type,
          created_at
        )
      `)
      .eq('is_active', true); // Only show active profiles

    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('user_email', email);
    }

    const { data: profileData, error: profileError } = await query.single();

    if (profileError) {
      console.error('Error fetching public profile:', profileError);
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    // Transform the data to match the expected format
    const profile = {
      id: profileData.id,
      user_email: profileData.user_email,
      business_name: profileData.business_name,
      display_name: profileData.display_name,
      profession_type: profileData.profession_type,
      bio: profileData.bio,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zip_code: profileData.zip_code,
      instagram: profileData.instagram,
      website: profileData.website,
      profile_image: profileData.profile_image,
      years_experience: profileData.years_experience,
      specialties: profileData.specialties || [],
      price_range: profileData.price_range,
      is_verified: profileData.is_verified,
      is_active: profileData.is_active,
      average_rating: profileData.average_rating || 0,
      total_reviews: profileData.total_reviews || 0,
      services: (profileData.professional_services || []).map((service: any) => ({
        id: service.id,
        service_name: service.name,
        description: service.description,
        price_min: service.price,
        price_max: service.price,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active
      })),
      portfolio: (profileData.professional_portfolio || []).map((item: any) => ({
        id: item.id,
        image_url: item.image_url,
        caption: item.caption,
        service_type: item.service_type,
        created_at: item.created_at
      }))
    };

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Public profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
