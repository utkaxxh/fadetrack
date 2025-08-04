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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchSpecialties();
    requestLocation();
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

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Location access denied or unavailable');
        }
      );
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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8" style={{border: '1px solid rgba(17, 75, 95, 0.2)'}}>
      {/* Basic Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Search Professionals
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search by name, business, or specialty..."
              className="w-full p-3 pl-10 rounded-lg border focus:outline-none focus:ring-2"
              style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5" style={{color: '#114B5F', opacity: 0.5}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State or ZIP"
              className="w-full p-3 pl-10 rounded-lg border focus:outline-none focus:ring-2"
              style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5" style={{color: '#114B5F', opacity: 0.5}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {userLocation && (
              <button
                onClick={() => handleFilterChange('location', 'near_me')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded"
                style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
              >
                Near me
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
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
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{color: '#114B5F'}}
        >
          <span>Advanced Filters</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          onClick={clearFilters}
          className="text-sm font-medium transition-colors duration-200"
          style={{color: '#114B5F', opacity: 0.8}}
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t" style={{borderColor: 'rgba(17, 75, 95, 0.2)'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Profession Type
              </label>
              <select
                value={filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
              >
                {professionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
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
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{backgroundColor: '#F7F0DE', borderColor: 'rgba(17, 75, 95, 0.3)', color: '#114B5F'}}
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Minimum Rating: {parseFloat(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                className="w-full"
                style={{accentColor: '#114B5F'}}
              />
              <div className="flex justify-between text-xs mt-1" style={{color: '#114B5F', opacity: 0.6}}>
                <span>Any</span>
                <span>1★</span>
                <span>2★</span>
                <span>3★</span>
                <span>4★</span>
                <span>5★</span>
              </div>
            </div>

            {userLocation && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                  Distance: {filters.distance} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={filters.distance}
                  onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
                  className="w-full"
                  style={{accentColor: '#114B5F'}}
                />
                <div className="flex justify-between text-xs mt-1" style={{color: '#114B5F', opacity: 0.6}}>
                  <span>1 mi</span>
                  <span>25 mi</span>
                  <span>50 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
