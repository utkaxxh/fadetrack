import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function matchesPriceRange(priceRange: string, servicePrice: number): boolean {
  switch (priceRange) {
    case 'budget': return servicePrice >= 20 && servicePrice <= 40;
    case 'mid': return servicePrice >= 40 && servicePrice <= 80;
    case 'premium': return servicePrice >= 80 && servicePrice <= 120;
    case 'luxury': return servicePrice >= 120;
    default: return true;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    searchTerm = '',
    profession = 'all',
    location = '',
    specialty = 'all',
    priceRange = 'all',
    rating = '0',
    distance = '25',
    availability = 'all',
    sortBy = 'rating',
    userLat,
    userLng
  } = req.query;

  try {
    // Build the base query
    let query = supabase
      .from('professional_profiles')
      .select(`
        id,
        business_name,
        display_name,
        profession_type,
        bio,
        city,
        state,
        latitude,
        longitude,
        specialties,
        average_rating,
        total_reviews,
        years_experience,
        is_verified,
        profile_image,
        professional_services:professional_services!professional_id (
          price,
          is_active
        )
      `)
      .eq('is_active', true);

    // Apply profession filter
    if (profession !== 'all') {
      query = query.eq('profession_type', profession);
    }

    // Apply rating filter
    const minRating = parseFloat(rating as string);
    if (minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    const { data: professionals, error } = await query;

    if (error) {
      console.error('Error fetching professionals:', error);
      return res.status(500).json({ error: 'Failed to fetch professionals' });
    }

    let filteredProfessionals = professionals || [];

    // Apply text search filter
    if (searchTerm) {
      const searchLower = (searchTerm as string).toLowerCase();
      filteredProfessionals = filteredProfessionals.filter(prof => 
        prof.business_name.toLowerCase().includes(searchLower) ||
        prof.display_name.toLowerCase().includes(searchLower) ||
        prof.bio.toLowerCase().includes(searchLower) ||
        prof.city.toLowerCase().includes(searchLower) ||
        prof.state.toLowerCase().includes(searchLower) ||
        (prof.specialties && prof.specialties.some((spec: string) => 
          spec.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Apply specialty filter
    if (specialty !== 'all') {
      filteredProfessionals = filteredProfessionals.filter(prof =>
        prof.specialties && prof.specialties.includes(specialty)
      );
    }

    // Apply location filter
    if (location && location !== 'near_me') {
      const locationLower = (location as string).toLowerCase();
      filteredProfessionals = filteredProfessionals.filter(prof =>
        prof.city.toLowerCase().includes(locationLower) ||
        prof.state.toLowerCase().includes(locationLower) ||
        `${prof.city}, ${prof.state}`.toLowerCase().includes(locationLower)
      );
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      filteredProfessionals = filteredProfessionals.filter(prof => {
        if (!prof.professional_services || prof.professional_services.length === 0) return false;
        return prof.professional_services.some((service: { price: number, is_active: boolean }) => 
          service.is_active && matchesPriceRange(priceRange as string, service.price)
        );
      });
    }

    // Calculate distances if user location is provided
    const userLatNum = userLat ? parseFloat(userLat as string) : null;
    const userLngNum = userLng ? parseFloat(userLng as string) : null;
    const maxDistance = parseFloat(distance as string);

    // Add distance property to professionals
    type ProfessionalWithDistance = typeof filteredProfessionals[0] & { distance?: number | null };
    let professionalsWithDistance: ProfessionalWithDistance[] = filteredProfessionals;

    if (userLatNum && userLngNum) {
      professionalsWithDistance = filteredProfessionals.map(prof => ({
        ...prof,
        distance: prof.latitude && prof.longitude 
          ? calculateDistance(userLatNum, userLngNum, prof.latitude, prof.longitude)
          : null
      })).filter(prof => 
        location === 'near_me' 
          ? prof.distance !== null && prof.distance <= maxDistance
          : true
      );
    }

    // Apply sorting
    professionalsWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'reviews':
          return (b.total_reviews || 0) - (a.total_reviews || 0);
        case 'distance':
          if (a.distance !== null && b.distance !== null && a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        case 'experience':
          return (b.years_experience || 0) - (a.years_experience || 0);
        case 'newest':
          // Since we don't have created_at in the select, skip this for now
          return 0;
        default:
          return 0;
      }
    });

    // Transform the data to match expected format
    const transformedProfessionals = professionalsWithDistance.map(prof => ({
      id: prof.id,
      business_name: prof.business_name,
      display_name: prof.display_name,
      profession_type: prof.profession_type,
      bio: prof.bio,
      city: prof.city,
      state: prof.state,
      specialties: prof.specialties || [],
      average_rating: prof.average_rating || 0,
      total_reviews: prof.total_reviews || 0,
      years_experience: prof.years_experience || 0,
      is_verified: prof.is_verified || false,
      profile_image: prof.profile_image,
      distance: prof.distance || null
    }));

    return res.status(200).json({ 
      professionals: transformedProfessionals,
      total: transformedProfessionals.length,
      filters: {
        searchTerm,
        profession,
        location,
        specialty,
        priceRange,
        rating: minRating,
        distance: maxDistance,
        availability,
        sortBy
      }
    });
  } catch (error) {
    console.error('Enhanced search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
