import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import EnhancedSearch from '../components/EnhancedSearch';

interface Professional {
  id: string;
  business_name: string;
  display_name: string;
  profession_type: string;
  bio: string;
  city: string;
  state: string;
  specialties: string[];
  average_rating: number;
  total_reviews: number;
  years_experience: number;
  is_verified: boolean;
  profile_image?: string;
  distance?: number | null;
}

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

export default function ProfessionalDirectory() {
  const [searchResults, setSearchResults] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  // Initialize with basic search
  useEffect(() => {
    handleSearch({
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
  }, []);

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all' && value !== '0') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/enhancedSearch?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.professionals || []);
        setTotalResults(data.total || 0);
      } else {
        setError(data.error || 'Failed to search professionals');
      }
    } catch (err) {
      console.error('Error searching professionals:', err);
      setError('Failed to search professionals');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && searchResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #F7F0DE, #faf5e4, #F7F0DE)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: '#114B5F'}}></div>
          <p style={{color: '#114B5F'}}>Loading professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #F7F0DE, #faf5e4, #F7F0DE)'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{backgroundColor: 'rgba(247, 240, 222, 0.8)', borderBottom: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded" style={{backgroundColor: '#114B5F'}}></div>
              <h1 className="text-2xl font-bold" style={{color: '#114B5F'}}>
                Fadetrack
              </h1>
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
            >
              Join Fadetrack
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{color: '#114B5F'}}>
            Find Your Perfect Professional
          </h1>
          <p className="text-lg" style={{color: '#114B5F', opacity: 0.8}}>
            Discover talented barbers, stylists, and beauticians in your area
          </p>
        </div>

        {/* Enhanced Search Component */}
        <div className="mb-8">
          <EnhancedSearch onSearch={handleSearch} />
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold mb-4" style={{color: '#114B5F'}}>
                Coming Soon!
              </h3>
              <p className="text-lg mb-6" style={{color: '#114B5F', opacity: 0.8}}>
                We&apos;re working hard to bring amazing professionals to your area. 
                Professional barbers and stylists can join our platform soon!
              </p>
              <div className="bg-white rounded-lg p-6 shadow-sm" style={{border: '1px solid rgba(17, 75, 95, 0.2)'}}>
                <h4 className="font-semibold mb-2" style={{color: '#114B5F'}}>
                  Are you a professional?
                </h4>
                <p className="text-sm mb-4" style={{color: '#114B5F', opacity: 0.7}}>
                  Get notified when we launch professional profiles in your area.
                </p>
                <Link 
                  href="/login" 
                  className="inline-block px-6 py-2 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
                >
                  Join as Professional
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
                {isLoading ? 'Searching...' : `Showing ${totalResults} professional${totalResults !== 1 ? 's' : ''}`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((professional) => (
                <Link 
                  key={professional.id} 
                  href={`/professional/${professional.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:scale-105" style={{border: '1px solid rgba(17, 75, 95, 0.2)'}}>
                    {/* Profile Image */}
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl mr-4"
                        style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
                      >
                        {professional.profile_image ? (
                          <Image 
                            src={professional.profile_image} 
                            alt={professional.display_name}
                            width={64}
                            height={64}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          professional.display_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" style={{color: '#114B5F'}}>
                          {professional.business_name}
                        </h3>
                        <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
                          {professional.display_name}
                        </p>
                        {professional.distance && (
                          <p className="text-xs" style={{color: '#114B5F', opacity: 0.6}}>
                            {professional.distance.toFixed(1)} miles away
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      {professional.average_rating > 0 ? (
                        <>
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < Math.floor(professional.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium" style={{color: '#114B5F'}}>
                            {professional.average_rating.toFixed(1)} ({professional.total_reviews})
                          </span>
                        </>
                      ) : (
                        <span className="text-sm" style={{color: '#114B5F', opacity: 0.6}}>
                          No reviews yet
                        </span>
                      )}
                      {professional.is_verified && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-sm mb-4 line-clamp-2" style={{color: '#114B5F', opacity: 0.8}}>
                      {professional.bio}
                    </p>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span style={{color: '#114B5F', opacity: 0.6}}>📍</span>
                        <span className="ml-2" style={{color: '#114B5F'}}>
                          {professional.city}, {professional.state}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span style={{color: '#114B5F', opacity: 0.6}}>💼</span>
                        <span className="ml-2" style={{color: '#114B5F'}}>
                          {professional.profession_type.charAt(0).toUpperCase() + professional.profession_type.slice(1)} • {professional.years_experience} years
                        </span>
                      </div>
                    </div>

                    {/* Specialties */}
                    {professional.specialties.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {professional.specialties.slice(0, 3).map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
                            >
                              {specialty}
                            </span>
                          ))}
                          {professional.specialties.length > 3 && (
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}
                            >
                              +{professional.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16" style={{backgroundColor: 'rgba(247, 240, 222, 0.5)', borderTop: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm flex items-center gap-1" style={{color: '#114B5F'}}>
              Made with 
              <span className="mx-1" style={{color: '#114B5F'}}>♥</span> 
              in San Francisco
            </p>
            <div className="flex gap-4">
              <Link href="/" className="text-sm transition-colors duration-200" style={{color: '#114B5F'}}>
                Home
              </Link>
              <Link href="/directory" className="text-sm transition-colors duration-200" style={{color: '#114B5F'}}>
                Find Professionals
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
