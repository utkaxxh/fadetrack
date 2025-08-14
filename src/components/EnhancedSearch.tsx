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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    // Only trigger search after component is initialized to prevent initial infinite loop
    if (isInitialized) {
      // Debounce the search to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        onSearch(filters);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Only depend on filters, not onSearch to prevent infinite loop

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
    <div className="p-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
          Find Your Perfect Match
        </h2>
        <p className="text-gray-600 text-lg">Search and filter to discover the best professionals for you</p>
      </div>

      {/* Basic Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-4">
            Search Professionals
          </label>
          <div className="relative group">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search by name, business, or specialty..."
              className="w-full p-5 pl-14 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-blue-500">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">
            Location
          </label>
          <div className="relative group">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State or ZIP"
              className="w-full p-5 pl-14 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-blue-500">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg font-medium"
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
      <div className="flex justify-between items-center border-t border-gray-200/50 pt-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-all duration-300 group bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-xl"
        >
          <span className="font-bold text-lg">Advanced Filters</span>
          <svg 
            className={`w-6 h-6 transition-all duration-300 group-hover:scale-110 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          onClick={clearFilters}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold bg-gray-50"
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-12 pt-12 border-t border-gray-200/50 space-y-8 animate-in slide-in-from-top duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Profession Type
              </label>
              <select
                value={filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg font-medium"
              >
                {professionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg font-medium"
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
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg font-medium"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300 text-lg font-medium"
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-gray-50/80 to-gray-100/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-200/50">
                <label className="block text-sm font-bold text-gray-700 mb-6">
                  <span className="text-lg">Minimum Rating: </span>
                  <span className="text-blue-600 font-black text-xl">
                    {parseFloat(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any Rating'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider hover:bg-gray-300 transition-colors duration-300"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #8B5CF6 ${(parseFloat(filters.rating) / 5) * 100}%, #E5E7EB ${(parseFloat(filters.rating) / 5) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm mt-4 text-gray-500 font-medium">
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
        </div>
      )}
    </div>
  );
}
