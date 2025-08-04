import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  try {
    if (req.method === 'GET') {
      const { email, id, city, profession_type } = req.query;

      if (email) {
        // Get specific professional profile by email
        const { data: profile, error } = await supabaseAdmin
          .from('professional_profiles')
          .select(`
            *,
            services(*),
            portfolio(*)
          `)
          .eq('user_email', email)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching professional profile:', error);
          return res.status(500).json({ error: 'Failed to fetch profile' });
        }

        return res.status(200).json({ profile: profile || null });
      }

      if (id) {
        // Get specific professional profile by ID
        const { data: profile, error } = await supabaseAdmin
          .from('professional_profiles')
          .select(`
            *,
            services(*),
            portfolio(*)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching professional profile:', error);
          return res.status(404).json({ error: 'Profile not found' });
        }

        return res.status(200).json({ profile });
      }

      // Search professionals with filters
      let query = supabaseAdmin
        .from('professional_profiles')
        .select(`
          id,
          business_name,
          display_name,
          profession_type,
          bio,
          city,
          state,
          profile_image,
          average_rating,
          total_reviews,
          price_range,
          specialties
        `)
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      if (profession_type) {
        query = query.eq('profession_type', profession_type);
      }

      const { data: professionals, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching professionals:', error);
        return res.status(500).json({ error: 'Failed to fetch professionals' });
      }

      return res.status(200).json({ professionals });
    }

    if (req.method === 'POST') {
      // Create professional profile
      const {
        user_email,
        business_name,
        display_name,
        profession_type,
        bio,
        phone,
        address,
        city,
        state,
        zip_code,
        instagram,
        website,
        years_experience,
        specialties,
        price_range
      } = req.body;

      if (!user_email || !business_name || !display_name || !profession_type) {
        return res.status(400).json({ 
          error: 'Missing required fields: user_email, business_name, display_name, profession_type' 
        });
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('professional_profiles')
        .select('id')
        .eq('user_email', user_email)
        .single();

      if (existingProfile) {
        return res.status(409).json({ error: 'Professional profile already exists' });
      }

      const { data: profile, error } = await supabaseAdmin
        .from('professional_profiles')
        .insert([{
          user_email,
          business_name,
          display_name,
          profession_type,
          bio,
          phone,
          address,
          city,
          state,
          zip_code,
          instagram,
          website,
          years_experience,
          specialties: specialties || [],
          price_range
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating professional profile:', error);
        return res.status(500).json({ error: 'Failed to create profile' });
      }

      return res.status(201).json({ success: true, profile });
    }

    if (req.method === 'PUT') {
      // Update professional profile
      const { user_email, ...updateData } = req.body;

      if (!user_email) {
        return res.status(400).json({ error: 'user_email is required' });
      }

      const { data: profile, error } = await supabaseAdmin
        .from('professional_profiles')
        .update(updateData)
        .eq('user_email', user_email)
        .select()
        .single();

      if (error) {
        console.error('Error updating professional profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      return res.status(200).json({ success: true, profile });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Professional profile API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
