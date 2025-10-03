import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  description?: string; // Database field name
  caption?: string; // Legacy field name for compatibility
  service_type: string;
  created_at?: string;
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
  onSetupProfile?: () => void;
}

export default function ProfessionalDashboard({ user, onSetupProfile }: ProfessionalDashboardProps) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'services' | 'portfolio' | 'reviews'>('overview');
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | undefined>(undefined);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<Partial<ProfessionalProfile>>({});

  const fetchProfile = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      console.log('ProfessionalDashboard: Fetching profile for email:', user.email);
      const response = await fetch(`/api/professionalProfileSimple?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      console.log('ProfessionalDashboard: Profile fetch response:', { status: response.status, data });
      
      if (response.ok) {
        setProfile(data.profile);
        console.log('ProfessionalDashboard: Profile set:', data.profile ? 'Profile found' : 'No profile found');
      } else {
        console.error('ProfessionalDashboard: Failed to fetch profile:', data.error);
      }
    } catch (err) {
      console.error('ProfessionalDashboard: Error fetching profile:', err);
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
    if (!user?.email) return;

    try {
      const method = editingPortfolioItem ? 'PUT' : 'POST';
      const body = editingPortfolioItem 
        ? { ...itemData, id: editingPortfolioItem.id }
        : { ...itemData, professionalEmail: user.email };

      const response = await fetch('/api/portfolio', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchProfile();
        setEditingPortfolioItem(undefined);
      } else {
        const errorData = await response.json();
        console.error('Error saving portfolio item:', errorData);
        alert('Failed to save portfolio item: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving portfolio item:', err);
      alert('Network error while saving portfolio item');
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

  // Profile editing handlers
  const handleEditProfile = () => {
    if (profile) {
      setProfileFormData({
        business_name: profile.business_name,
        display_name: profile.display_name,
        profession_type: profile.profession_type,
        bio: profile.bio,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zip_code,
        instagram: profile.instagram,
        website: profile.website,
        years_experience: profile.years_experience,
        specialties: profile.specialties,
        price_range: profile.price_range
      });
      setIsEditingProfile(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileFormData({});
  };

  const handleSaveProfile = async () => {
    if (!user?.email || !profileFormData) return;

    setIsSavingProfile(true);
    try {
      console.log('ProfessionalDashboard: Saving profile changes:', profileFormData);
      
      const response = await fetch('/api/professionalProfileSimple', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          ...profileFormData
        }),
      });

      const data = await response.json();
      console.log('ProfessionalDashboard: Save profile response:', { status: response.status, data });

      if (response.ok) {
        console.log('ProfessionalDashboard: Profile updated successfully');
        await fetchProfile(); // Refresh the profile data
        setIsEditingProfile(false);
        setProfileFormData({});
      } else {
        console.error('ProfessionalDashboard: Failed to save profile:', data.error);
        // You could add a toast notification here
        alert('Failed to save profile changes: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('ProfessionalDashboard: Error saving profile:', err);
      alert('Network error while saving profile changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string | number | boolean | string[]) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
  <h2 className="text-2xl font-bold mb-4" style={{color: '#114B5F'}}>Welcome to RateMyMUA!</h2>
        <p className="mb-6" style={{color: '#114B5F', opacity: 0.8}}>
          Complete your professional profile to start receiving reviews and growing your business.
        </p>
        <button
          onClick={() => {
            console.log('🚀 Set Up Your Profile button clicked');
            if (onSetupProfile) {
              onSetupProfile();
            } else {
              console.warn('⚠️ onSetupProfile callback not provided');
            }
          }}
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
            style={{backgroundColor: '#f1f5f9', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Edit Profile</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Update your business information</p>
          </button>
          
          <button
            onClick={() => setActiveSection('services')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#f1f5f9', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Manage Services</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Add or update your offerings</p>
          </button>
          
          <button
            onClick={() => setActiveSection('portfolio')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#f1f5f9', border: '1px solid #114B5F'}}
          >
            <h4 className="font-semibold" style={{color: '#114B5F'}}>Portfolio</h4>
            <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>Showcase your work</p>
          </button>
          
          <button
            onClick={() => setActiveSection('reviews')}
            className="p-4 rounded-lg transition-all duration-200 text-left"
            style={{backgroundColor: '#f1f5f9', border: '1px solid #114B5F'}}
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold" style={{color: '#114B5F'}}>Profile Management</h3>
        <div className="flex gap-2">
          {profile && (
            <button
              onClick={() => window.open(`/professional/${profile.id}`, '_blank')}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F', border: '1px solid #114B5F'}}
            >
              View Public Profile
            </button>
          )}
          {!isEditingProfile ? (
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200"
              style={{backgroundColor: '#114B5F'}}
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444'}}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#114B5F'}}
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
      
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
                  value={isEditingProfile ? (profileFormData.business_name || '') : profile.business_name}
                  onChange={(e) => handleProfileInputChange('business_name', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Display Name</label>
                <input
                  type="text"
                  value={isEditingProfile ? (profileFormData.display_name || '') : profile.display_name}
                  onChange={(e) => handleProfileInputChange('display_name', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Profession Type</label>
                <select
                  value={isEditingProfile ? (profileFormData.profession_type || '') : profile.profession_type}
                  onChange={(e) => handleProfileInputChange('profession_type', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                >
                  <option value="makeup_artist">Makeup Artist</option>
                  <option value="barber">Barber</option>
                  <option value="beautician">Beautician</option>
                  <option value="stylist">Hair Stylist</option>
                  <option value="salon">Salon Owner</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Years of Experience</label>
                <input
                  type="number"
                  value={isEditingProfile ? (profileFormData.years_experience || 1) : profile.years_experience}
                  onChange={(e) => handleProfileInputChange('years_experience', parseInt(e.target.value) || 1)}
                  disabled={!isEditingProfile}
                  min="1"
                  max="50"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Bio</label>
                <textarea
                  value={isEditingProfile ? (profileFormData.bio || '') : profile.bio}
                  onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                  disabled={!isEditingProfile}
                  rows={4}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
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
                  value={isEditingProfile ? (profileFormData.phone || '') : profile.phone}
                  onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Address</label>
                <input
                  type="text"
                  value={isEditingProfile ? (profileFormData.address || '') : profile.address}
                  onChange={(e) => handleProfileInputChange('address', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="123 Main St"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>City</label>
                  <input
                    type="text"
                    value={isEditingProfile ? (profileFormData.city || '') : profile.city}
                    onChange={(e) => handleProfileInputChange('city', e.target.value)}
                    disabled={!isEditingProfile}
                    className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>State</label>
                  <input
                    type="text"
                    value={isEditingProfile ? (profileFormData.state || '') : profile.state}
                    onChange={(e) => handleProfileInputChange('state', e.target.value)}
                    disabled={!isEditingProfile}
                    className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                    placeholder="CA"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>ZIP Code</label>
                <input
                  type="text"
                  value={isEditingProfile ? (profileFormData.zip_code || '') : profile.zip_code}
                  onChange={(e) => handleProfileInputChange('zip_code', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="94102"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Instagram Handle</label>
                <input
                  type="text"
                  value={isEditingProfile ? (profileFormData.instagram || '') : profile.instagram}
                  onChange={(e) => handleProfileInputChange('instagram', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="@yourusername"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>Website</label>
                <input
                  type="url"
                  value={isEditingProfile ? (profileFormData.website || '') : profile.website}
                  onChange={(e) => handleProfileInputChange('website', e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{backgroundColor: isEditingProfile ? '#f1f5f9' : '#f8fafc', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p style={{color: '#114B5F', opacity: 0.8}}>Loading profile...</p>
      )}
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
                    style={{backgroundColor: '#f1f5f9', color: '#114B5F'}}
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
              <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.description || item.caption || 'Portfolio item'}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span style="color: #114B5F; opacity: 0.5;">📷 Image Failed to Load</span>';
                      }
                    }}
                  />
                ) : (
                  <span style={{color: '#114B5F', opacity: 0.5}}>📷 No Image</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm mb-2" style={{color: '#114B5F'}}>
                  {item.description || item.caption || 'No description'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: '#f1f5f9', color: '#114B5F'}}>
                    {item.service_type}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingPortfolioItem({
                          id: item.id,
                          image_url: item.image_url,
                          caption: item.description || item.caption || '',
                          service_type: item.service_type,
                          created_at: item.created_at
                        });
                        setShowPortfolioModal(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePortfolioItem(item.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
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
                <div className="p-4 rounded-lg" style={{backgroundColor: '#f1f5f9', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
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
                    className="flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 bg-slate-100 focus:bg-white"
                    style={{borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
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
