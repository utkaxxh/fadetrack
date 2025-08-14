import React, { useState, useEffect } from 'react';

interface SearchFilters {
  searchTerm: string;
  profession: string;
  location: string;
  specialty: string;
  priceRange: string;
  rating: string;
  distance: string;
  availability: string;
  sortBy: string;
  userLat?: number;
  userLng?: number;
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function EnhancedSearch({ onSearch, initialFilters = {} }: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    profession: 'all',
    location: '',
    specialty: 'all',
    priceRange: 'all',
    rating: '0',
    distance: '25',
    availability: 'all',
    sortBy: 'rating',
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      const data = await response.json();
      if (response.ok) {
        setSpecialties(data.specialties || []);
      }
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      profession: 'all',
      location: '',
      specialty: 'all',
      priceRange: 'all',
      rating: '0',
      distance: '25',
      availability: 'all',
      sortBy: 'rating'
    });
  };

  const professionTypes = [
    { value: 'all', label: 'All Professions' },
    { value: 'barber', label: 'Barber' },
    { value: 'hair_stylist', label: 'Hair Stylist' },
    { value: 'beautician', label: 'Beautician' },
    { value: 'cosmetologist', label: 'Cosmetologist' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Any Price' },
    { value: 'budget', label: '$20 - $40' },
    { value: 'mid', label: '$40 - $80' },
    { value: 'premium', label: '$80 - $120' },
    { value: 'luxury', label: '$120+' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'distance', label: 'Nearest' },
    { value: 'experience', label: 'Most Experience' },
    { value: 'newest', label: 'Newest' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'Any Time' },
    { value: 'today', label: 'Available Today' },
    { value: 'tomorrow', label: 'Available Tomorrow' },
    { value: 'this_week', label: 'This Week' },
    { value: 'next_week', label: 'Next Week' }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Match</h2>
        <p className="text-gray-600">Search and filter to discover the best professionals for you</p>
      </div>

      {/* Basic Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Search Professionals
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search by name, business, or specialty..."
              className="w-full p-4 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State or ZIP"
              className="w-full p-4 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
        >
          <span className="font-semibold">Advanced Filters</span>
          <svg 
            className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Profession Type
              </label>
              <select
                value={filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
              >
                {professionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Minimum Rating: {parseFloat(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any Rating'}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(parseFloat(filters.rating) / 5) * 100}%, #E5E7EB ${(parseFloat(filters.rating) / 5) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Any</span>
                  <span>1★</span>
                  <span>2★</span>
                  <span>3★</span>
                  <span>4★</span>
                  <span>5★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
