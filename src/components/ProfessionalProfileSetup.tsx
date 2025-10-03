import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface ProfessionalProfile {
  business_name: string;
  display_name: string;
  profession_type: 'barber' | 'beautician' | 'stylist' | 'salon' | 'makeup_artist';
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  instagram: string;
  website: string;
  years_experience: number;
  specialties: string[];
  price_range: string;
}

interface ProfessionalProfileSetupProps {
  user: User | null;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ProfessionalProfileSetup({ user, onComplete, onSkip }: ProfessionalProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<ProfessionalProfile>({
    business_name: '',
    display_name: '',
  profession_type: 'makeup_artist',
    bio: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    instagram: '',
    website: '',
    years_experience: 1,
    specialties: [],
    price_range: ''
  });

  const specialtyOptions = [
    'Haircuts', 'Hair Coloring', 'Hair Styling', 'Beard Trimming', 'Shaves',
    'Perms', 'Hair Extensions', 'Braiding', 'Wedding Styles', 'Men\'s Cuts',
    'Women\'s Cuts', 'Kids Cuts', 'Color Correction', 'Highlights', 'Balayage'
  ];

  const priceRanges = [
    { value: '₹', label: '₹ - Budget Friendly (₹500-₹1,500)' },
    { value: '₹₹', label: '₹₹ - Moderate (₹1,500-₹3,000)' },
    { value: '₹₹₹', label: '₹₹₹ - Premium (₹3,000-₹6,000)' },
    { value: '₹₹₹₹', label: '₹₹₹₹ - Luxury (₹6,000+)' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'years_experience' ? parseInt(value) || 1 : value
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      setError('User email is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('ProfessionalProfileSetup: Submitting profile data:', {
        user_email: user.email,
        ...profile
      });

      const response = await fetch('/api/professionalProfileSimple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          ...profile
        }),
      });

      console.log('ProfessionalProfileSetup: API response status:', response.status);
      const data = await response.json();
      console.log('ProfessionalProfileSetup: API response data:', data);

      if (response.ok) {
        console.log('ProfessionalProfileSetup: Profile created successfully');
        onComplete();
      } else {
        console.error('ProfessionalProfileSetup: API error:', data);
        setError(data.error || 'Failed to create profile');
      }
    } catch (err: unknown) {
      console.error('ProfessionalProfileSetup: Network error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(`Network error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = profile.business_name && profile.display_name && profile.profession_type;
  const isStep2Valid = profile.city && profile.state;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{backgroundColor: '#f1f5f9', border: '2px solid #114B5F'}}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{color: '#114B5F'}}>
            Set Up Your Professional Profile
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'text-white' : 'text-gray-500'
            }`} style={{backgroundColor: step >= 1 ? '#114B5F' : '#e5e5e5'}}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-current' : 'bg-gray-300'}`} style={{color: '#114B5F'}}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'text-white' : 'text-gray-500'
            }`} style={{backgroundColor: step >= 2 ? '#114B5F' : '#e5e5e5'}}>
              2
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-current' : 'bg-gray-300'}`} style={{color: '#114B5F'}}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 3 ? 'text-white' : 'text-gray-500'
            }`} style={{backgroundColor: step >= 3 ? '#114B5F' : '#e5e5e5'}}>
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={profile.business_name}
                onChange={handleInputChange}
                placeholder="e.g., Elite Cuts Barbershop"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                Your Display Name *
              </label>
              <input
                type="text"
                name="display_name"
                value={profile.display_name}
                onChange={handleInputChange}
                placeholder="e.g., Mike the Barber"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                Profession Type *
              </label>
              <select
                name="profession_type"
                value={profile.profession_type}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="makeup_artist">Makeup Artist</option>
                <option value="barber">Barber</option>
                <option value="beautician">Beautician</option>
                <option value="stylist">Hair Stylist</option>
                <option value="salon">Salon Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell potential clients about yourself and your experience..."
                className="input h-24 resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Location & Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_experience"
                  value={profile.years_experience}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                Business Address
              </label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                placeholder="123 Main St"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleInputChange}
                  placeholder="San Francisco"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleInputChange}
                  placeholder="CA"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={profile.zip_code}
                  onChange={handleInputChange}
                  placeholder="94102"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={profile.instagram}
                  onChange={handleInputChange}
                  placeholder="@yourusername"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#114B5F'}}>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>Services & Specialties</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Price Range
              </label>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_range"
                      value={range.value}
                      checked={profile.price_range === range.value}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                      style={{accentColor: '#114B5F'}}
                    />
                    <span className="text-sm" style={{color: '#114B5F'}}>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Specialties (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="w-4 h-4"
                      style={{accentColor: '#114B5F'}}
                    />
                    <span className="text-sm" style={{color: '#114B5F'}}>{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}

        <div className="flex justify-between mt-6">
          <div className="flex space-x-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{borderColor: '#114B5F', color: '#114B5F'}}
              >
                Back
              </button>
            )}
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>
          </div>

          <div>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid)
                }
                className="px-6 py-2 font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
