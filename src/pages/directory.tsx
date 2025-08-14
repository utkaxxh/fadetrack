import { useState, useEffect, useCallback } from 'react';
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

  const handleSearch = useCallback(async (filters: SearchFilters) => {
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSearchResults(data.professionals || []);
      setTotalResults(data.total || 0);
    } catch (err) {
      console.error('Error searching professionals:', err);
      setError(err instanceof Error ? err.message : 'Failed to search professionals');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize with basic search
  useEffect(() => {
    const initialFilters = {
      searchTerm: '',
      profession: 'all',
      location: '',
      specialty: 'all',
      priceRange: 'all',
      rating: '0',
      distance: '25',
      availability: 'all',
      sortBy: 'rating'
    };
    handleSearch(initialFilters);
  }, [handleSearch]);

  // Show loading only on initial load
  if (isLoading && searchResults.length === 0 && totalResults === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading professionals...
          </h2>
          <p className="text-gray-600 text-lg">Finding the perfect matches for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-40 sticky top-0 backdrop-blur-xl border-b border-white/20" style={{background: 'rgba(255, 255, 255, 0.8)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Fadetrack
              </h1>
            </Link>
            <Link 
              href="/login" 
              className="relative px-8 py-3 text-sm font-semibold text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <span className="relative z-10">Join Fadetrack</span>
              <div className="absolute inset-0 rounded-full shadow-lg group-hover:shadow-2xl transition-all duration-300" style={{boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)'}}></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 backdrop-blur-sm">
              <span className="mr-2 text-2xl">✨</span>
              <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent font-semibold">Professional Directory</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <br />
              <span className="text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hair Professional
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Discover talented barbers, stylists, and beauticians. Browse reviews, compare services, and book your next perfect cut.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Enhanced Search Component */}
        <div className="mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/40 rounded-3xl blur-sm"></div>
            <div className="relative backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-white/30"></div>
              <div className="relative">
                <EnhancedSearch onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-3xl p-12 max-w-md mx-auto backdrop-blur-sm">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-xl font-bold text-red-800 mb-4">Something went wrong</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative text-9xl mb-8 filter drop-shadow-lg">🚀</div>
              </div>
              <h3 className="text-4xl font-black mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Coming Soon!
              </h3>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                We&apos;re working hard to bring amazing professionals to your area. 
                Professional barbers and stylists can join our platform soon!
              </p>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 rounded-3xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-white/80 via-white/60 to-white/40 rounded-3xl p-10 backdrop-blur-xl border border-white/30 shadow-2xl">
                  <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Are you a professional?
                  </h4>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Get notified when we launch professional profiles in your area.
                  </p>
                  <Link 
                    href="/login" 
                    className="relative inline-flex items-center px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <span className="relative z-10 mr-3 text-2xl">✨</span>
                    <span className="relative z-10">Join as Professional</span>
                    <div className="absolute inset-0 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300" style={{boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'}}></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {isLoading ? 'Searching...' : `${totalResults} Professional${totalResults !== 1 ? 's' : ''} Found`}
                </h2>
                <p className="text-lg text-gray-600">
                  {isLoading ? 'Please wait while we find the best matches' : 'Browse and compare top-rated professionals'}
                </p>
              </div>
              {!isLoading && totalResults > 0 && (
                <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50">
                  <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></span>
                  <span className="font-medium text-green-700">Live results</span>
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
      <footer className="relative mt-32 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.3),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.3),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-75"></div>
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 shadow-2xl">
                  <span className="text-white font-black text-2xl">F</span>
                </div>
              </div>
              <span className="text-3xl font-black text-white">Fadetrack</span>
            </div>
            
            <div className="text-center">
              <p className="text-white/90 flex items-center justify-center gap-3 text-lg">
                Made with 
                <span className="text-red-400 text-2xl animate-pulse">♥</span> 
                in San Francisco
              </p>
            </div>
            
            <div className="flex justify-end gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-all duration-300 font-semibold text-lg hover:scale-105">
                Home
              </Link>
              <Link href="/directory" className="text-white hover:text-white transition-all duration-300 font-semibold text-lg hover:scale-105">
                Directory
              </Link>
              <a 
                href="https://www.x.com/utkaxxh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:rotate-12 transition-transform duration-300">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-semibold">@utkaxxh</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
