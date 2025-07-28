import React, { useState } from 'react';
import type { Review } from '../app/page';

interface BarberDirectoryProps {
  reviews: Review[];
}

export default function BarberDirectory({ reviews }: BarberDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  // Group reviews by barber and calculate stats
  const barberStats = reviews
    .filter(review => review.is_public)
    .reduce((acc, review) => {
      const key = `${review.barber_name}-${review.shop_name}`;
      
      if (!acc[key]) {
        acc[key] = {
          barber_name: review.barber_name,
          shop_name: review.shop_name,
          location: review.location,
          reviews: [],
          totalRating: 0,
          averageRating: 0,
          reviewCount: 0
        };
      }
      
      acc[key].reviews.push(review);
      acc[key].totalRating += review.rating;
      acc[key].reviewCount = acc[key].reviews.length;
      acc[key].averageRating = acc[key].totalRating / acc[key].reviewCount;
      
      return acc;
    }, {} as Record<string, {
      barber_name: string;
      shop_name: string;
      location: string;
      reviews: Review[];
      totalRating: number;
      averageRating: number;
      reviewCount: number;
    }>);

  // Convert to array and filter/sort
  const barbers = Object.values(barberStats)
    .filter(barber => 
      barber.barber_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'name':
          return a.barber_name.localeCompare(b.barber_name);
        default:
          return 0;
      }
    });

  const StarDisplay = ({ rating, showNumber = true }: { rating: number, showNumber?: boolean }) => (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
      {showNumber && <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>}
    </div>
  );

  const getServiceTypes = (reviews: Review[]) => {
    const types = new Set(reviews.map(r => r.service_type));
    return Array.from(types).map(type => {
      const typeNames: { [key: string]: string } = {
        'haircut': 'Haircuts',
        'beard_trim': 'Beard Trims',
        'shave': 'Shaves',
        'haircut_beard': 'Haircut + Beard',
        'other': 'Other'
      };
      return typeNames[type] || type;
    });
  };

  const getPriceRange = (reviews: Review[]) => {
    const costs = reviews.map(r => parseFloat(r.cost.replace(/[^0-9.]/g, ''))).filter(cost => !isNaN(cost));
    if (costs.length === 0) return 'N/A';
    
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  if (barbers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No barbers found</div>
        <div className="text-gray-500 text-sm">Try adjusting your search terms</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search barbers, shops, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {barbers.length} barber{barbers.length !== 1 ? 's' : ''} found
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{barber.barber_name}</h3>
                <StarDisplay rating={barber.averageRating} />
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="font-medium text-blue-600">{barber.shop_name}</div>
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{barber.location}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reviews:</span>
                <span className="font-medium">{barber.reviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price Range:</span>
                <span className="font-medium">{getPriceRange(barber.reviews)}</span>
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Services:</div>
              <div className="flex flex-wrap gap-1">
                {getServiceTypes(barber.reviews).map((service, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Review */}
            {barber.reviews.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600 mb-1">Latest Review:</div>
                <div className="text-sm text-gray-800 line-clamp-2">
                  &quot;{barber.reviews[barber.reviews.length - 1].review_text}&quot;
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <StarDisplay rating={barber.reviews[barber.reviews.length - 1].rating} showNumber={false} />
                  <span>by {barber.reviews[barber.reviews.length - 1].user_name || 'Anonymous'}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
