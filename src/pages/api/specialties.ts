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
    const { data: profiles, error } = await supabase
      .from('professional_profiles')
      .select('specialties')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching specialties:', error);
      return res.status(500).json({ error: 'Failed to fetch specialties' });
    }

    // Extract all unique specialties from all profiles
    const allSpecialties = new Set<string>();
    
    profiles?.forEach(profile => {
      if (profile.specialties && Array.isArray(profile.specialties)) {
        profile.specialties.forEach((specialty: string) => {
          allSpecialties.add(specialty.trim());
        });
      }
    });

    const specialties = Array.from(allSpecialties).sort();

    return res.status(200).json({ specialties });
  } catch (error) {
    console.error('Specialties API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
