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
  console.log('publicProfile API: Request method:', req.method);
  console.log('publicProfile API: Query params:', req.query);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, email } = req.query;

  if (!id && !email) {
    return res.status(400).json({ error: 'Professional ID or email is required' });
  }

  try {
    // First get the basic profile
    let profileQuery = supabaseAdmin
      .from('professional_profiles')
      .select('*')
      .eq('is_active', true); // Only show active profiles

    if (id) {
      profileQuery = profileQuery.eq('id', id);
    } else if (email) {
      profileQuery = profileQuery.eq('user_email', email);
    }

    const { data: profileData, error: profileError } = await profileQuery.maybeSingle();

    if (profileError) {
      console.error('publicProfile API: Error fetching profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile', details: profileError });
    }

    if (!profileData) {
      console.log('publicProfile API: Profile not found');
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    console.log('publicProfile API: Profile found:', profileData.business_name);

    // Get services if profile exists
    const { data: servicesData, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('professional_id', profileData.id)
      .eq('is_active', true);

    if (servicesError) {
      console.warn('publicProfile API: Error fetching services:', servicesError);
    }

    // Get portfolio if profile exists
    const { data: portfolioData, error: portfolioError } = await supabaseAdmin
      .from('portfolio')
      .select('*')
      .eq('professional_id', profileData.id);

    if (portfolioError) {
      console.warn('publicProfile API: Error fetching portfolio:', portfolioError);
    }

    // Combine the data
    const profile = {
      ...profileData,
      services: servicesData || [],
      portfolio: portfolioData || []
    };

    console.log('publicProfile API: Returning profile with', profile.services.length, 'services and', profile.portfolio.length, 'portfolio items');

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('publicProfile API: Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
