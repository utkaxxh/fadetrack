import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

// Advanced search filters removed – simplifying to basic directory fetch

const Star = ({ filled }: { filled?: boolean }) => (
  <svg aria-hidden="true" className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.037a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.037a1 1 0 00-1.175 0l-2.803 2.037c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);

export default function ProfessionalDirectory() {
  const [searchResults, setSearchResults] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [hasPerformedInitialSearch, setHasPerformedInitialSearch] = useState(false);
  const fetchProfessionals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/professionalDirectory');
      if (!response.ok) throw new Error(`Failed to load directory (status ${response.status})`);
      const data = await response.json();
      setSearchResults(data.professionals || []);
      setTotalResults((data.professionals || []).length);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load professionals');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
      setHasPerformedInitialSearch(true);
    }
  };

  // Fetch once on mount (advanced filters removed)
  useEffect(() => {
    fetchProfessionals();
  }, []);

  // Show loading only on initial load
  if (!hasPerformedInitialSearch && searchResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(17,75,95,0.08),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(17,75,95,0.06),transparent_55%)]"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[rgba(17,75,95,0.10)] rounded-full mix-blend-multiply blur-2xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[rgba(248,250,252,0.4)] rounded-full mix-blend-multiply blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-4" style={{color:'#114B5F'}}>
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(17,75,95,0.08),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(17,75,95,0.06),transparent_55%)]"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[rgba(17,75,95,0.10)] rounded-full mix-blend-multiply blur-2xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[rgba(248,250,252,0.4)] rounded-full mix-blend-multiply blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-40 sticky top-0 backdrop-blur-xl border-b border-[rgba(17,75,95,0.15)]" style={{background:'rgba(248,250,252,0.85)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur opacity-60 group-hover:opacity-90 transition-opacity" style={{background:'linear-gradient(90deg,#114B5F,#0d3a4a)'}}></div>
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg" style={{background:'linear-gradient(135deg,#114B5F,#0d3a4a)'}}>
                  <span className="text-white font-bold text-xl">F</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold" style={{color:'#114B5F'}}>
                RateMyMUA
              </h1>
            </Link>
            <Link
              href="/login"
              className="relative px-8 py-3 text-sm font-semibold text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 group overflow-hidden"
            >
              <div className="absolute inset-0 transition-all duration-300" style={{background:'linear-gradient(90deg,#114B5F,#0d3a4a)'}}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{background:'linear-gradient(90deg,#0d3a4a,#114B5F)'}}></div>
              <span className="relative z-10">Join RateMyMUA</span>
              <div className="absolute inset-0 rounded-full shadow-lg group-hover:shadow-2xl transition-all duration-300" style={{boxShadow:'0 10px 25px rgba(17,75,95,0.35)'}}></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border" style={{background:'rgba(248,250,252,0.7)',borderColor:'rgba(17,75,95,0.25)',color:'#114B5F'}}>
              <span className="mr-2 text-2xl">✨</span>
              <span className="font-semibold" style={{color:'#114B5F'}}>Professional Directory</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="text-[#114B5F]">Find Your Perfect</span>
              <br />
              <span className="text-4xl md:text-5xl text-[#0d3a4a]">Beauty Professional</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={{color:'#114B5F'}}>
              Discover talented makeup artists, barbers, stylists, and beauty professionals. Browse reviews, compare services, and book your next perfect appointment.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Simplified header block – advanced search removed */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-3" style={{color:'#114B5F'}}>Browse Top Professionals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Curated list of active profiles ordered by rating. Advanced filters coming back later if needed.</p>
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
                <h2 className="text-3xl font-black mb-2" style={{color:'#114B5F'}}>
                  {isLoading ? 'Loading Directory...' : `${totalResults} Professional${totalResults !== 1 ? 's' : ''}`}
                </h2>
                <p className="text-lg text-gray-600">{isLoading ? 'Fetching profiles' : 'Ordered by rating (desc)'}</p>
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
                  className="group relative rounded-2xl backdrop-blur-xl ring-1 p-5 flex flex-col gap-5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{background:'rgba(248,250,252,0.85)',borderColor:'rgba(17,75,95,0.10)'}}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'linear-gradient(135deg,rgba(17,75,95,0.08),rgba(17,75,95,0.02))'}} />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl text-white flex items-center justify-center font-semibold text-xl shadow-lg ring-2 ring-white/40 group-hover:scale-105 transition-transform overflow-hidden" style={{background:'linear-gradient(135deg,#114B5F,#0d3a4a)'}}>
                        {professional.profile_image ? (
                          <Image src={professional.profile_image} alt={professional.display_name} width={64} height={64} className="w-full h-full object-cover" />
                        ) : (
                          professional.display_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {professional.is_verified && (
                        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-800">✓</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-[#114B5F] transition-colors line-clamp-1">
                        {professional.business_name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-1">
                        {professional.display_name}
                      </p>
                      <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {professional.city}, {professional.state}
                        {professional.distance != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
                            {professional.distance.toFixed(1)} mi
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 relative z-10">
                    {professional.average_rating > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} filled={i < Math.round(professional.average_rating)} />
                          ))}
                        </div>
                        <span className="text-sm font-medium" style={{color:'#114B5F'}}>
                          {professional.average_rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">({professional.total_reviews})</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">New</span>
                    )}

                    <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                      {professional.profession_type}
                    </span>
                  </div>

                  {professional.bio && (
                    <p className="text-sm leading-relaxed line-clamp-2 relative z-10" style={{color:'#114B5F',opacity:0.85}}>
                      {professional.bio}
                    </p>
                  )}

                  {professional.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
                      {professional.specialties.slice(0, 4).map((spec, i) => (
                        <span key={i} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1" style={{background:'rgba(248,250,252,0.8)',color:'#114B5F',borderColor:'rgba(17,75,95,0.12)'}}>
                          {spec}
                        </span>
                      ))}
                      {professional.specialties.length > 4 && (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-900/5">
                          +{professional.specialties.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm shadow-md" style={{background:'#114B5F',color:'#f8fafc'}}>→</span>
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
              <span className="text-3xl font-black text-white">RateMyMUA</span>
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
