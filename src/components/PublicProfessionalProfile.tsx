import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ProfessionalProfile {
  id: number;
  user_email: string;
  business_name: string;
  display_name: string;
  profession_type: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  instagram: string;
  website: string;
  profile_image: string;
  years_experience: number;
  specialties: string[];
  price_range: string;
  is_verified: boolean;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  services: Service[];
  portfolio: PortfolioItem[];
}

interface Service {
  id: number;
  service_name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  is_active: boolean;
}

interface PortfolioItem {
  id: number;
  image_url: string;
  caption: string;
  service_type: string;
  created_at: string;
}

interface Review {
  id: number;
  user_email: string;
  barber_name: string;
  shop_name: string;
  location: string;
  service_type: string;
  rating: number;
  cost: string;
  date: string;
  title: string;
  review_text: string;
  is_public: boolean;
  professional_response: string | null;
  response_date: string | null;
  created_at: string;
}

interface PublicProfessionalProfileProps {
  professionalId?: string;
  professionalEmail?: string;
}

export default function PublicProfessionalProfile({ 
  professionalId, 
  professionalEmail 
}: PublicProfessionalProfileProps) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'portfolio' | 'reviews'>('about');

  const fetchProfessionalProfile = useCallback(async () => {
    try {
      const query = professionalId 
        ? `id=${encodeURIComponent(professionalId)}`
        : `email=${encodeURIComponent(professionalEmail!)}`;
      
      const response = await fetch(`/api/publicProfile?${query}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, professionalEmail]);

  const fetchProfessionalReviews = useCallback(async () => {
    try {
      const query = professionalEmail || profile?.user_email;
      if (!query) return;

      const response = await fetch(`/api/publicReviews?professionalEmail=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [professionalEmail, profile?.user_email]);

  useEffect(() => {
    if (professionalId || professionalEmail) {
      fetchProfessionalProfile();
      fetchProfessionalReviews();
    }
  }, [professionalId, professionalEmail, fetchProfessionalProfile, fetchProfessionalReviews]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: '#114B5F'}}></div>
          <p style={{color: '#114B5F'}}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4" style={{color: '#114B5F'}}>Profile Not Found</h2>
        <p style={{color: '#114B5F', opacity: 0.8}}>
          {error || 'This professional profile could not be found.'}
        </p>
      </div>
    );
  }

  const PROFESSION_LABELS: Record<string, string> = {
    makeup_artist: 'Makeup Artist',
    barber: 'Barber',
    beautician: 'Beautician',
    stylist: 'Hair Stylist',
    salon: 'Salon Owner'
  };

  const formatProfessionType = (value: string): string => {
    if (!value) return '';
    if (PROFESSION_LABELS[value]) return PROFESSION_LABELS[value];
    // Fallback: convert snake_case to Title Case
    return value
      .split('_')
      .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  };

  const renderAbout = () => (
    <div className="space-y-6">
      {/* Bio Section */}
      <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>About</h3>
        <p style={{color: '#114B5F'}} className="leading-relaxed">
          {profile.bio || 'No bio available.'}
        </p>
      </div>

      {/* Specialties */}
      <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {profile.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm rounded-full"
              style={{backgroundColor: '#f1f5f9', color: '#114B5F', border: '1px solid rgba(17, 75, 95, 0.15)'}}
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Contact & Location</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{color: '#114B5F', opacity: 0.8}}>📍</span>
            <span style={{color: '#114B5F'}}>
              {profile.address && `${profile.address}, `}{profile.city}, {profile.state} {profile.zip_code}
            </span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{color: '#114B5F', opacity: 0.8}}>📞</span>
              <a href={`tel:${profile.phone}`} style={{color: '#114B5F'}} className="hover:underline">
                {profile.phone}
              </a>
            </div>
          )}
          
          {profile.instagram && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{color: '#114B5F', opacity: 0.8}}>📸</span>
              <a 
                href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{color: '#114B5F'}} 
                className="hover:underline"
              >
                {profile.instagram}
              </a>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{color: '#114B5F', opacity: 0.8}}>🌐</span>
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{color: '#114B5F'}} 
                className="hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Services Offered</h3>
      
      {profile.services && profile.services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.services.filter(service => service.is_active).map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-lg"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <h4 className="text-lg font-semibold mb-2" style={{color: '#114B5F'}}>{service.service_name}</h4>
              <p className="text-sm mb-4" style={{color: '#114B5F', opacity: 0.8}}>{service.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold" style={{color: '#114B5F'}}>
                    ${service.price_min} - ${service.price_max}
                  </span>
                  <span className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
                    {service.duration_minutes} minutes
                  </span>
                </div>
                <button
                  className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{backgroundColor: '#114B5F'}}
                  onClick={() => {
                    // TODO: Implement booking functionality
                    alert('Booking feature coming soon!');
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p style={{color: '#114B5F', opacity: 0.8}}>No services listed yet.</p>
        </div>
      )}
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Portfolio</h3>
      
      {profile.portfolio && profile.portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.caption}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span style="color: #114B5F; opacity: 0.5;">📷 Image</span>';
                      }
                    }}
                  />
                ) : (
                  <span style={{color: '#114B5F', opacity: 0.5}}>📷 Image</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm mb-2" style={{color: '#114B5F'}}>{item.caption || ''}</p>
                <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: '#f1f5f9', color: '#114B5F'}}>
                  {item.service_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p style={{color: '#114B5F', opacity: 0.8}}>No portfolio items yet.</p>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Customer Reviews</h3>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.filter(review => review.is_public).map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-lg"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{color: '#114B5F'}}>
                      {review.user_email.split('@')[0]}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{color: '#114B5F', opacity: 0.8}} className="text-sm">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {review.service_type && (
                  <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: '#f1f5f9', color: '#114B5F'}}>
                    {review.service_type}
                  </span>
                )}
              </div>
              
              <h4 className="font-semibold mb-2" style={{color: '#114B5F'}}>{review.title}</h4>
              <p style={{color: '#114B5F'}} className="mb-4">{review.review_text}</p>
              
              {review.professional_response && (
                <div className="p-4 rounded-lg" style={{backgroundColor: '#f1f5f9', border: '1px solid rgba(17, 75, 95, 0.15)'}}>
                  <p className="text-sm font-semibold mb-2" style={{color: '#114B5F'}}>
                    Response from {profile.display_name}:
                  </p>
                  <p style={{color: '#114B5F'}} className="text-sm">{review.professional_response}</p>
                  <p style={{color: '#114B5F', opacity: 0.6}} className="text-xs mt-2">
                    {new Date(review.response_date!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p style={{color: '#114B5F', opacity: 0.8}}>No reviews yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl"
            style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
          >
            {profile.profile_image ? (
              <Image 
                src={profile.profile_image} 
                alt={profile.display_name}
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.display_name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2" style={{color: '#114B5F'}}>
          {profile.business_name}
        </h1>
        <p className="text-lg mb-2" style={{color: '#114B5F', opacity: 0.8}}>
          {profile.display_name}
        </p>
        <p className="text-sm mb-4" style={{color: '#114B5F', opacity: 0.8}}>
          {formatProfessionType(profile.profession_type)} • {profile.years_experience} years experience
        </p>
        
        {/* Rating */}
        <div className="flex items-center justify-center gap-2">
          {profile.average_rating > 0 ? (
            <>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < Math.floor(profile.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span style={{color: '#114B5F'}} className="font-semibold">
                {profile.average_rating.toFixed(1)} ({profile.total_reviews} reviews)
              </span>
            </>
          ) : (
            <span style={{color: '#114B5F', opacity: 0.8}}>No reviews yet</span>
          )}
        </div>
        
        {profile.is_verified && (
          <div className="flex justify-center mt-2">
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
              ✓ Verified Professional
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {[
          { key: 'about', label: 'About' },
          { key: 'services', label: 'Services' },
          { key: 'portfolio', label: 'Portfolio' },
          { key: 'reviews', label: 'Reviews' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'about' | 'services' | 'portfolio' | 'reviews')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.key
                ? 'font-semibold text-white'
                : 'font-medium'
            }`}
            style={{
              backgroundColor: activeTab === tab.key ? '#114B5F' : 'rgba(17, 75, 95, 0.1)',
              color: activeTab === tab.key ? 'white' : '#114B5F',
              border: `1px solid ${activeTab === tab.key ? '#114B5F' : 'rgba(17, 75, 95, 0.2)'}`
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'about' && renderAbout()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'reviews' && renderReviews()}
      </div>
    </div>
  );
}
