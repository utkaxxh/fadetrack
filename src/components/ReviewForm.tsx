import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import LocationAutocomplete, { LocationData } from './LocationAutocomplete';
import type { User } from '@supabase/supabase-js';
import type { Review } from '../app/page';

interface ReviewFormProps {
  onSubmit: (review: Omit<Review, 'user_email'>) => void;
  user: User | null;
}

export default function ReviewForm({ onSubmit, user }: ReviewFormProps) {
  const [form, setForm] = useState<Omit<Review, 'user_email' | 'user_name'>>({
    barber_id: 0,
    barber_name: '',
    shop_name: '',
    location: '',
    professional_type: 'barber',
    service_type: 'haircut',
    rating: 5,
    cost: '',
    date: '',
    title: '',
    review_text: '',
    is_public: true,
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Set today's date after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setForm({ ...form, [name]: target.checked });
    } else if (name === 'rating') {
      setForm({ ...form, [name]: parseInt(value) });
    } else {
      // If professional type changes, adjust service_type to appropriate default
      if (name === 'professional_type') {
        const nextProfessional = value;
        const nextServiceOptions = getServiceOptions(nextProfessional);
        const nextService = nextServiceOptions[0]?.value || 'other';
  // nextProfessional is already a string; no need for an any cast
  setForm({ ...form, professional_type: nextProfessional, service_type: nextService });
      } else {
        setForm({ ...form, [name]: value });
      }
    }
  }

  // Dynamic service options per professional type
  function getServiceOptions(proType?: string) {
    if (proType === 'makeup_artist') {
      return [
        { value: 'bridal_makeup', label: 'Bridal Makeup' },
        { value: 'sangeet_makeup', label: 'Sangeet Makeup' },
        { value: 'engagement_makeup', label: 'Engagement Makeup' },
        { value: 'reception_makeup', label: 'Reception Makeup' },
        { value: 'casual_makeup', label: 'Casual / Party Makeup' },
        { value: 'other', label: 'Other' },
      ];
    }
    // Default (barber / stylist / beautician etc.)
    return [
      { value: 'haircut', label: 'Haircut' },
      { value: 'beard_trim', label: 'Beard Trim' },
      { value: 'shave', label: 'Shave' },
      { value: 'haircut_beard', label: 'Haircut + Beard' },
      { value: 'other', label: 'Other' },
    ];
  }

  // Confetti celebration function
  function celebrateReview() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !user.email) {
      alert('You must be logged in to post a review.');
      return;
    }

    if (!form.location || !locationData) {
      alert('Please select a location from the suggestions so we can save full location details.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fullLocation = locationData?.formatted || form.location;
      const reviewData = {
        ...form,
        location: fullLocation,
        user_email: user.email,
        user_name: user.email.split('@')[0],
        city: locationData?.city || '',
        state: locationData?.state || '',
        country: locationData?.country || '',
        place_id: locationData?.place_id || null
      };

      const response = await fetch('/api/createReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post review');
      }

      // Success! Celebrate with confetti
      celebrateReview();
      setShowSuccess(true);
      
      // Hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);

      onSubmit({ ...form, location: fullLocation });
      setForm({ 
        barber_id: 0,
        barber_name: '', 
        shop_name: '',
        location: '', 
        professional_type: form.professional_type || 'barber',
        service_type: 'haircut',
        rating: 5,
        cost: '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        review_text: '',
        is_public: true
      });
      setLocationData(null);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsSubmitting(false);
    }
  }

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors duration-200`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Review posted successfully! ⭐🎉</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="professional_type" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Type
            </label>
            <select
              id="professional_type"
              name="professional_type"
              value={form.professional_type || 'barber'}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="barber">Barber</option>
              <option value="makeup_artist">Makeup Artist</option>
              <option value="stylist">Stylist</option>
              <option value="beautician">Beautician</option>
              <option value="nail_tech">Nail Tech</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="barber_name" className="block text-sm font-medium text-gray-700 mb-2">
              {form.professional_type === 'barber' ? 'Barber Name' : form.professional_type === 'makeup_artist' ? 'Makeup Artist Name' : form.professional_type === 'stylist' ? 'Stylist Name' : 'Professional Name'}
            </label>
            <input
              id="barber_name"
              name="barber_name"
              type="text"
              value={form.barber_name}
              onChange={handleChange}
              required
              placeholder="John Smith"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              id="shop_name"
              name="shop_name"
              type="text"
              value={form.shop_name}
              onChange={handleChange}
              required
              placeholder="The Classic Barber Shop"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Replaced massive static city dropdown with Google Places Autocomplete */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <LocationAutocomplete
              id="location"
              name="location"
              value={form.location}
              onChange={(value, data) => {
                setForm({ ...form, location: value });
                setLocationData(data || null);
              }}
              required
              placeholder="Enter city, state, country..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Start typing to search worldwide cities</p>
          </div>

          <div>
            <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              id="service_type"
              name="service_type"
              value={form.service_type}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getServiceOptions(form.professional_type).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Service
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
              Cost <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="cost"
              name="cost"
              type="text"
              value={form.cost}
              onChange={handleChange}
              placeholder="₹1500"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating 
            rating={form.rating} 
            onRatingChange={(rating) => setForm({ ...form, rating })}
          />
          <p className="text-sm text-gray-500 mt-1">Click the stars to rate your experience</p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Great fade, excellent service!"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea 
            id="review_text"
            name="review_text" 
            value={form.review_text} 
            onChange={handleChange} 
            required
            placeholder="Tell others about your experience..."
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            checked={form.is_public}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
            Make this review public (others can see it)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting Review...
            </div>
          ) : (
            'Post Review'
          )}
        </button>
      </form>
    </div>
  );
}
