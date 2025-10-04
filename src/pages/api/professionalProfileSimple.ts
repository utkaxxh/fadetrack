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
  console.log('professionalProfileSimple API: Request method:', req.method);
  console.log('professionalProfileSimple API: Has service key:', !!supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      console.log('professionalProfileSimple API: GET request for email:', email);

      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      // Get specific professional profile by email without joins to avoid relationship errors
      const { data: profile, error } = await supabaseAdmin
        .from('professional_profiles')
        .select('*')
        .eq('user_email', email)
        .eq('is_active', true)
        .maybeSingle();

      console.log('professionalProfileSimple API: GET result:', { data: profile, error });

      if (error) {
        console.error('professionalProfileSimple API: GET error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile', details: error });
      }

      return res.status(200).json({ profile: profile || null });
    }

    if (req.method === 'POST') {
      console.log('professionalProfileSimple API: POST request body:', req.body);
      
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

      // Validate required fields
      if (!user_email || !business_name || !display_name || !profession_type) {
        console.log('professionalProfileSimple API: Missing required fields');
        return res.status(400).json({ 
          error: 'Missing required fields: user_email, business_name, display_name, profession_type',
          received: { user_email: !!user_email, business_name: !!business_name, display_name: !!display_name, profession_type: !!profession_type }
        });
      }

      // Check if profile already exists
      console.log('professionalProfileSimple API: Checking for existing profile');
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('professional_profiles')
        .select('id')
        .eq('user_email', user_email)
        .maybeSingle();

      if (checkError) {
        console.error('professionalProfileSimple API: Error checking existing profile:', checkError);
        return res.status(500).json({ error: 'Failed to check existing profile', details: checkError });
      }

      if (existingProfile) {
        console.log('professionalProfileSimple API: Profile already exists');
        return res.status(409).json({ error: 'Professional profile already exists' });
      }

      // Create the profile data
      const profileData = {
        user_email,
        business_name,
        display_name,
        profession_type,
        bio: bio || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zip_code: zip_code || '',
        instagram: instagram || '',
        website: website || '',
        years_experience: years_experience || 1,
        specialties: specialties || [],
        price_range: price_range || '',
        is_active: true,
        is_verified: false
      };

      console.log('professionalProfileSimple API: Creating profile with data:', profileData);

      const { data: profile, error } = await supabaseAdmin
        .from('professional_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('professionalProfileSimple API: Error creating profile:', error);
        type SupaErr = { code?: string; hint?: string; message?: string; details?: string | null };
        const err = error as SupaErr;
        return res.status(500).json({ 
          error: 'Failed to create profile', 
          details: err?.message || (error as unknown as string),
          code: err?.code,
          hint: err?.hint,
        });
      }

      console.log('professionalProfileSimple API: Profile created successfully:', profile);
      return res.status(201).json({ success: true, profile });
    }

    if (req.method === 'PUT') {
      // Update professional profile
      const { user_email, ...updateData } = req.body;
      console.log('professionalProfileSimple API: PUT request for:', user_email);

      if (!user_email) {
        return res.status(400).json({ error: 'user_email is required' });
      }

      const { data: profile, error } = await supabaseAdmin
        .from('professional_profiles')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('user_email', user_email)
        .select()
        .single();

      if (error) {
        console.error('professionalProfileSimple API: Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile', details: error });
      }

      console.log('professionalProfileSimple API: Profile updated successfully');
      return res.status(200).json({ success: true, profile });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('professionalProfileSimple API: Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
