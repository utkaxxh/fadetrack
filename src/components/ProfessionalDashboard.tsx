import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import ServiceModal from './ServiceModal';
import PortfolioModal from './PortfolioModal';

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

interface ProfessionalDashboardProps {
  user: User | null;
}

export default function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'services' | 'portfolio' | 'reviews'>('overview');
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | undefined>(undefined);

  const fetchProfile = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/professionalProfile?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const fetchReviews = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/reviewResponses?professionalEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
      fetchReviews();
    }
  }, [user?.email, fetchProfile, fetchReviews]);

  const handleSaveService = async (serviceData: {
    service_name: string;
    description: string;
    price_min: number;
    price_max: number;
    duration_minutes: number;
    is_active: boolean;
  }) => {
    if (!profile?.id) return;

    try {
      const method = editingService ? 'PUT' : 'POST';
      const body = editingService 
        ? { ...serviceData, id: editingService.id }
        : { ...serviceData, professionalId: profile.id };

      const response = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Refresh profile to get updated services
        await fetchProfile();
        setEditingService(undefined);
      }
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProfile();
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleSavePortfolioItem = async (itemData: {
    image_url: string;
    caption: string;
    service_type: string;
  }) => {
    if (!profile?.id) return;

    try {
      const method = editingPortfolioItem ? 'PUT' : 'POST';
      const body = editingPortfolioItem 
        ? { ...itemData, id: editingPortfolioItem.id }
        : { ...itemData, professionalId: profile.id };

      const response = await fetch('/api/portfolio', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchProfile();
        setEditingPortfolioItem(undefined);
      }
    } catch (err) {
      console.error('Error saving portfolio item:', err);
    }
  };

  const handleDeletePortfolioItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      const response = await fetch(`/api/portfolio?id=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProfile();
      }
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
    }
  };

  const handleReviewResponse = async (reviewId: number, response: string) => {
    if (!user?.email) return;

    try {
      const apiResponse = await fetch('/api/reviewResponses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          response,
          professionalEmail: user.email
        })
      });

      if (apiResponse.ok) {
        await fetchReviews();
      }
    } catch (err) {
      console.error('Error responding to review:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: '#114B5F'}}></div>
          <p style={{color: '#114B5F'}}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4" style={{color: '#114B5F'}}>Welcome to Fadetrack!</h2>
        <p className="mb-6" style={{color: '#114B5F', opacity: 0.8}}>
          Complete your professional profile to start receiving reviews and growing your business.
        </p>
        <button
          onClick={() => window.location.reload()} // This will trigger profile setup
          className="px-6 py-3 font-semibold text-white rounded-lg transition-all duration-200"
          style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
        >
          Set Up Your Profile
        </button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#114B5F', opacity: 0.8}}>Average Rating</h3>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold" style={{color: '#114B5F'}}>
              {profile.average_rating > 0 ? profile.average_rating.toFixed(1) : 'N/A'}
            </span>
            {profile.average_rating > 0 && (
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
            )}
          </div>
        </div>

        <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#114B5F', opacity: 0.8}}>Total Reviews</h3>
          <span className="text-3xl font-bold" style={{color: '#114B5F'}}>
            {profile.total_reviews}
          </span>
        </div>

        <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
          <h3 className="text-sm font-medium mb-2" style={{color: '#114B5F', opacity: 0.8}}>Services Offered</h3>
          <span className="text-3xl font-bold" style={{color: '#114B5F'}}>
            {profile.services?.length || 0}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveSection('profile')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#F7F0DE', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Edit Profile</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Update your business information</p>
          </button>
          
          <button
            onClick={() => setActiveSection('services')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#F7F0DE', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Manage Services</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Add or update your offerings</p>
          </button>
          
          <button
            onClick={() => setActiveSection('portfolio')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#F7F0DE', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Portfolio</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Showcase your work</p>
          </button>
          
          <button
            onClick={() => setActiveSection('reviews')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#F7F0DE', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Reviews</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>View and respond to reviews</p>
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2" style={{color: '#114B5F'}}>{profile.business_name}</h4>
            <p className="text-sm mb-2" style={{color: '#114B5F', opacity: 0.8}}>{profile.display_name}</p>
            <p className="text-sm mb-2" style={{color: '#114B5F', opacity: 0.8}}>
              {profile.profession_type.charAt(0).toUpperCase() + profile.profession_type.slice(1)}
            </p>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
              {profile.city}, {profile.state}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2" style={{color: '#114B5F'}}>Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold" style={{color: '#114B5F'}}>Profile Management</h3>
      
      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
            <h4 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Business Information</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Business Name</label>
                <input
                  type="text"
                  defaultValue={profile.business_name}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Display Name</label>
                <input
                  type="text"
                  defaultValue={profile.display_name}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Profession Type</label>
                <select
                  defaultValue={profile.profession_type}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                >
                  <option value="barber">Barber</option>
                  <option value="hair_stylist">Hair Stylist</option>
                  <option value="beautician">Beautician</option>
                  <option value="cosmetologist">Cosmetologist</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Years of Experience</label>
                <input
                  type="number"
                  defaultValue={profile.years_experience}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Bio</label>
                <textarea
                  defaultValue={profile.bio}
                  rows={4}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="Tell customers about yourself and your experience..."
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
            <h4 className="text-lg font-semibold mb-4" style={{color: '#114B5F'}}>Contact & Location</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Phone</label>
                <input
                  type="tel"
                  defaultValue={profile.phone}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Address</label>
                <input
                  type="text"
                  defaultValue={profile.address}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>City</label>
                  <input
                    type="text"
                    defaultValue={profile.city}
                    className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>State</label>
                  <input
                    type="text"
                    defaultValue={profile.state}
                    className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>ZIP Code</label>
                <input
                  type="text"
                  defaultValue={profile.zip_code}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Instagram Handle</label>
                <input
                  type="text"
                  defaultValue={profile.instagram}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="@yourusername"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Website</label>
                <input
                  type="url"
                  defaultValue={profile.website}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p style={{color: '#114B5F', opacity: 0.8}}>Loading profile...</p>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={() => {/* TODO: Save profile changes */}}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
          style={{backgroundColor: '#114B5F'}}
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold" style={{color: '#114B5F'}}>Service Management</h3>
        <button
          onClick={() => {
            setEditingService(undefined);
            setShowServiceModal(true);
          }}
          className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200"
          style={{backgroundColor: '#114B5F'}}
        >
          Add New Service
        </button>
      </div>
      
      {profile?.services && profile.services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.services.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-lg"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold" style={{color: '#114B5F'}}>{service.service_name}</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingService(service);
                      setShowServiceModal(true);
                    }}
                    className="text-sm px-3 py-1 rounded" 
                    style={{backgroundColor: '#F7F0DE', color: '#114B5F'}}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="text-sm px-3 py-1 rounded text-red-600 bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-sm mb-3" style={{color: '#114B5F', opacity: 0.8}}>{service.description}</p>
              
              <div className="flex justify-between items-center text-sm">
                <span style={{color: '#114B5F'}}>
                  ${service.price_min} - ${service.price_max}
                </span>
                <span style={{color: '#114B5F', opacity: 0.8}}>
                  {service.duration_minutes} min
                </span>
              </div>
              
              <div className="mt-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    service.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold mb-2" style={{color: '#114B5F'}}>No Services Added Yet</h4>
          <p style={{color: '#114B5F', opacity: 0.8}} className="mb-4">Start by adding your first service to attract customers.</p>
          <button
            onClick={() => {
              setEditingService(undefined);
              setShowServiceModal(true);
            }}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
            style={{backgroundColor: '#114B5F'}}
          >
            Add Your First Service
          </button>
        </div>
      )}
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold" style={{color: '#114B5F'}}>Portfolio Management</h3>
        <button
          onClick={() => {
            setEditingPortfolioItem(undefined);
            setShowPortfolioModal(true);
          }}
          className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200"
          style={{backgroundColor: '#114B5F'}}
        >
          Upload Photos
        </button>
      </div>
      
      {profile?.portfolio && profile.portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <span style={{color: '#114B5F', opacity: 0.5}}>📷 Image</span>
              </div>
              <div className="p-4">
                <p className="text-sm mb-2" style={{color: '#114B5F'}}>{item.caption}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: '#F7F0DE', color: '#114B5F'}}>
                    {item.service_type}
                  </span>
                  <button 
                    onClick={() => handleDeletePortfolioItem(item.id)}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold mb-2" style={{color: '#114B5F'}}>No Portfolio Items Yet</h4>
          <p style={{color: '#114B5F', opacity: 0.8}} className="mb-4">Showcase your best work to attract more customers.</p>
          <button
            onClick={() => {
              setEditingPortfolioItem(undefined);
              setShowPortfolioModal(true);
            }}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
            style={{backgroundColor: '#114B5F'}}
          >
            Upload Your First Photo
          </button>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold" style={{color: '#114B5F'}}>Review Management</h3>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-lg"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{color: '#114B5F'}}>{review.user_email}</span>
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
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    review.is_public 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {review.is_public ? 'Public' : 'Private'}
                </span>
              </div>
              
              <p style={{color: '#114B5F'}} className="mb-4">{review.review_text}</p>
              
              {review.professional_response ? (
                <div className="p-4 rounded-lg" style={{backgroundColor: '#F7F0DE', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
                  <p className="text-sm font-semibold mb-2" style={{color: '#114B5F'}}>Your Response:</p>
                  <p style={{color: '#114B5F'}} className="text-sm">{review.professional_response}</p>
                  <p style={{color: '#114B5F', opacity: 0.6}} className="text-xs mt-2">
                    Responded on {new Date(review.response_date!).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a response..."
                    className="flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          handleReviewResponse(review.id, target.value.trim());
                          target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                      if (input?.value.trim()) {
                        handleReviewResponse(review.id, input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200"
                    style={{backgroundColor: '#114B5F'}}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold mb-2" style={{color: '#114B5F'}}>No Reviews Yet</h4>
          <p style={{color: '#114B5F', opacity: 0.8}}>Reviews from customers will appear here.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">{/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{color: '#114B5F'}}>
          Welcome back, {profile.display_name}!
        </h1>
        <p style={{color: '#114B5F', opacity: 0.8}}>
          Manage your professional profile and grow your business
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'profile', label: 'Profile' },
          { key: 'services', label: 'Services' },
          { key: 'portfolio', label: 'Portfolio' },
          { key: 'reviews', label: 'Reviews' },
        ].map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as 'overview' | 'profile' | 'services' | 'portfolio' | 'reviews')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === section.key
                ? 'font-semibold text-white'
                : 'font-medium'
            }`}
            style={{
              backgroundColor: activeSection === section.key ? '#114B5F' : 'rgba(17, 75, 95, 0.1)',
              color: activeSection === section.key ? 'white' : '#114B5F',
              border: `1px solid ${activeSection === section.key ? '#114B5F' : 'rgba(17, 75, 95, 0.2)'}`
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'services' && renderServices()}
        {activeSection === 'portfolio' && renderPortfolio()}
        {activeSection === 'reviews' && renderReviews()}
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(undefined);
        }}
        onSave={handleSaveService}
        service={editingService}
      />

      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setEditingPortfolioItem(undefined);
        }}
        onSave={handleSavePortfolioItem}
        item={editingPortfolioItem}
      />
    </div>
  );
}
