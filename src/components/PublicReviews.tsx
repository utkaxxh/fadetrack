import React, { useState } from 'react';
import type { Review } from '../app/page';
import type { User } from '@supabase/supabase-js';

interface PublicReviewsProps {
  reviews: Review[];
  user: User | null;
  onDeleteReview?: (reviewId: number) => Promise<void>;
}

export default function PublicReviews({ reviews, user, onDeleteReview }: PublicReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'oldest'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Get unique locations from reviews for the dropdown
  const uniqueLocations = Array.from(new Set(reviews
    .filter(review => review.is_public && review.location)
    .map(review => review.location.trim())
  )).sort();

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesPublic = review.is_public;
      const matchesRating = filterRating === null || review.rating === filterRating;
      const matchesLocation = filterLocation === '' || 
        review.location.toLowerCase().includes(filterLocation.toLowerCase());
      
      return matchesPublic && matchesRating && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleDelete = async (reviewId: number) => {
    if (!reviewId || !onDeleteReview) return;
    
    const isConfirmed = window.confirm('Are you sure you want to delete this review? This action cannot be undone.');
    if (!isConfirmed) return;

    setDeletingId(reviewId);
    try {
      await onDeleteReview(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  const getServiceTypeDisplay = (serviceType: string) => {
    const types: { [key: string]: string } = {
      'haircut': 'Haircut',
      'beard_trim': 'Beard Trim',
      'shave': 'Shave',
      'haircut_beard': 'Haircut + Beard',
      'other': 'Other'
    };
    return types[serviceType] || serviceType;
  };

  if (filteredAndSortedReviews.length === 0) {
    const hasFilters = filterRating !== null || filterLocation !== '';
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          {hasFilters ? 'No reviews match your filters' : 'No public reviews yet'}
        </div>
        <div className="text-gray-500 text-sm">
          {hasFilters ? 'Try adjusting your search criteria' : 'Be the first to share your experience!'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Filters and Sort */}
      <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'rgba(17, 75, 95, 0.05)', border: '1px solid rgba(17, 75, 95, 0.1)'}}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'oldest')}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-slate-100 focus:bg-white"
              style={{
                color: '#114B5F',
                borderColor: 'rgba(17, 75, 95, 0.3)',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div>
            <select
              id="filter"
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-slate-100 focus:bg-white"
              style={{
                color: '#114B5F',
                borderColor: 'rgba(17, 75, 95, 0.3)',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              id="location-filter"
              type="text"
              placeholder="Search locations..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-200 w-40 bg-slate-100 focus:bg-white"
              style={{
                color: '#114B5F',
                borderColor: 'rgba(17, 75, 95, 0.3)',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            {uniqueLocations.length > 0 && (
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-slate-100 focus:bg-white"
                style={{
                  color: '#114B5F',
                  borderColor: 'rgba(17, 75, 95, 0.3)',
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        <div className="text-sm mt-3" style={{color: '#114B5F'}}>
          {filteredAndSortedReviews.length} review{filteredAndSortedReviews.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                  <StarDisplay rating={review.rating} />
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Barber:</span>
                    <span className="text-blue-600">{review.barber_name}</span>
                    <span className="text-gray-400">at</span>
                    <span className="font-medium">{review.shop_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>📍 {review.location}</span>
                    <span>✂️ {getServiceTypeDisplay(review.service_type)}</span>
                    <span>💰 {review.cost.startsWith('₹') ? review.cost : `₹${review.cost}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {user && user.email === review.user_email && onDeleteReview && review.id && (
                  <button
                    onClick={() => handleDelete(review.id!)}
                    disabled={deletingId === review.id}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                      deletingId === review.id
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {deletingId === review.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                )}
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <p className="text-gray-800 leading-relaxed">{review.review_text}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {review.user_name?.charAt(0).toUpperCase() || review.user_email.charAt(0).toUpperCase()}
                </div>
                <span>by {review.user_name || review.user_email.split('@')[0]}</span>
              </div>
              
              <div className="text-xs text-gray-400">
                Posted {new Date(review.created_at || review.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
