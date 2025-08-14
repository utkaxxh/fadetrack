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
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{backgroundColor: 'rgba(247, 240, 222, 0.95)', borderColor: 'rgba(17, 75, 95, 0.1)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110" style={{background: 'linear-gradient(135deg, #114B5F, #0d3a4a)'}}>
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Fadetrack
              </h1>
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-3 text-sm font-semibold text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-0.5"
              style={{background: 'linear-gradient(135deg, #114B5F, #0d3a4a)', boxShadow: '0 10px 25px rgba(17, 75, 95, 0.3)'}}
            >
              Join Fadetrack
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6" style={{backgroundColor: 'rgba(17, 75, 95, 0.1)', color: '#114B5F'}}>
              <span className="mr-2">✨</span>
              Professional Directory
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Find Your Perfect
              <br />
              <span className="text-4xl md:text-5xl">Hair Professional</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover talented barbers, stylists, and beauticians. Browse reviews, compare services, and book your next perfect cut.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Search Component */}
        <div className="mb-12">
          <div className="backdrop-blur-sm rounded-2xl shadow-xl border" style={{backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(17, 75, 95, 0.1)'}}>
            <EnhancedSearch onSearch={handleSearch} />
          </div>
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative text-8xl mb-8">🚀</div>
              </div>
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                Coming Soon!
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We&apos;re working hard to bring amazing professionals to your area. 
                Professional barbers and stylists can join our platform soon!
              </p>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <h4 className="text-xl font-bold mb-4 text-gray-900">
                  Are you a professional?
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get notified when we launch professional profiles in your area.
                </p>
                <Link 
                  href="/login" 
                  className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                  style={{background: 'linear-gradient(135deg, #114B5F, #0d3a4a)'}}
                >
                  <span className="mr-2">✨</span>
                  Join as Professional
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLoading ? 'Searching...' : `${totalResults} Professional${totalResults !== 1 ? 's' : ''} Found`}
                </h2>
                <p className="text-gray-600">
                  {isLoading ? 'Please wait while we find the best matches' : 'Browse and compare top-rated professionals'}
                </p>
              </div>
              {!isLoading && totalResults > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live results
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {searchResults.map((professional) => (
                <Link 
                  key={professional.id} 
                  href={`/professional/${professional.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-16 translate-x-16 transition-all duration-300 group-hover:scale-150"></div>
                    
                    {/* Profile Section */}
                    <div className="relative flex items-start mb-6">
                      <div className="relative">
                        <div 
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mr-4 shadow-lg transition-all duration-300 group-hover:scale-110"
                          style={{background: 'linear-gradient(135deg, #114B5F, #0d3a4a)', color: 'white'}}
                        >
                          {professional.profile_image ? (
                            <Image 
                              src={professional.profile_image} 
                              alt={professional.display_name}
                              width={80}
                              height={80}
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            professional.display_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {professional.is_verified && (
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors truncate">
                          {professional.business_name}
                        </h3>
                        <p className="text-gray-600 mb-2 font-medium">
                          {professional.display_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">📍</span>
                          {professional.city}, {professional.state}
                        </div>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="mb-6">
                      {professional.average_rating > 0 ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex mr-3">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${i < Math.floor(professional.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="font-bold text-gray-900">
                              {professional.average_rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {professional.total_reviews} review{professional.total_reviews !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-500 text-sm font-medium">New Professional</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {professional.bio && (
                      <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                        {professional.bio}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          �
                        </span>
                        <span className="text-gray-700 font-medium">
                          {professional.profession_type.charAt(0).toUpperCase() + professional.profession_type.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          �
                        </span>
                        <span className="text-gray-700">
                          {professional.years_experience} year{professional.years_experience !== 1 ? 's' : ''} experience
                        </span>
                      </div>
                    </div>

                    {/* Specialties */}
                    {professional.specialties && professional.specialties.length > 0 && (
                      <div className="border-t border-gray-100 pt-6">
                        <div className="flex flex-wrap gap-2">
                          {professional.specialties.slice(0, 3).map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-900 border border-blue-100"
                            >
                              {specialty}
                            </span>
                          ))}
                          {professional.specialties.length > 3 && (
                            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                              +{professional.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover arrow */}
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <span className="text-white text-lg">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-20 py-16" style={{background: 'linear-gradient(135deg, #114B5F, #0d3a4a)'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold text-white">Fadetrack</span>
            </div>
            
            <div className="text-center">
              <p className="text-white/80 flex items-center justify-center gap-2">
                Made with 
                <span className="text-red-400 text-xl">♥</span> 
                in San Francisco
              </p>
            </div>
            
            <div className="flex justify-end gap-6">
              <Link href="/" className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                Home
              </Link>
              <Link href="/directory" className="text-white hover:text-white transition-colors duration-200 font-medium">
                Directory
              </Link>
              <a 
                href="https://www.x.com/utkaxxh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                @utkaxxh
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
