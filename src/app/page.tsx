"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../components/supabaseClient';
import TabNavigation, { TabType } from '../components/TabNavigation';
// Removed haircut & reminder related imports
// import HaircutForm from '../components/HaircutForm';
// import HaircutHistory from '../components/HaircutHistory';
// import ReminderSettings from '../components/ReminderSettings';
import AccountSettings from '../components/AccountSettings';
import AccountDropdown from '../components/AccountDropdown';
import ReviewForm from '../components/ReviewForm';
import PublicReviews from '../components/PublicReviews';
import UserRoleSelection from '../components/UserRoleSelection';
import ProfessionalProfileSetup from '../components/ProfessionalProfileSetup';
import ProfessionalDashboard from '../components/ProfessionalDashboard';
import MyReviews from '../components/MyReviews';
import ChatKitAISearch from '../components/ChatKitAISearch';
import { useSupabaseUser } from '../components/useSupabaseUser';
import { useUserRole } from '../hooks/useUserRole';

export type Barber = {
  id?: number;
  name: string;
  shop_name: string;
  location: string;
  phone?: string;
  instagram?: string;
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
};

export type Review = {
  id?: number;
  user_email: string;
  user_name?: string;
  barber_id: number;
  barber_name: string;
  shop_name: string;
  location: string;
  professional_type?: string; // barber, makeup_artist, stylist, etc.
  service_type: string; // haircut, beard trim, etc.
  rating: number; // 1-5 stars
  cost: string;
  date: string;
  title: string;
  review_text: string;
  photos?: string[]; // URLs to uploaded photos
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
};

// Keep for backward compatibility during migration
export type Haircut = {
  id?: number;
  user_email: string;
  date: string;
  barber: string;
  location: string;
  style: string;
  cost: string;
  notes?: string;
};



// Removed rotating hero word animation; keeping file lean

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('myreviews');
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  // Removed haircut state
  const [reviews, setReviews] = useState<Review[]>([]); // public reviews for directory
  const [myReviews, setMyReviews] = useState<Review[]>([]); // current user's reviews (public + private)
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // Removed flip word animation state & interval
  const user = useSupabaseUser();
  const { role, updateUserRole, isProfessional, isLoading: roleLoading, hasRecord } = useUserRole(user);

  // Set default tab based on user role (only once when role is known)
  const hasSetDefaultTabRef = useRef(false);
  useEffect(() => {
    if (roleLoading || hasSetDefaultTabRef.current) return;
    if (isProfessional) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('myreviews');
    }
    hasSetDefaultTabRef.current = true;
  }, [isProfessional, roleLoading]);

  // Compute a safe current tab for rendering to avoid blank state on refresh
  // Professionals default to 'dashboard' unless they explicitly choose 'directory'
  // Customers never render 'dashboard' and default to 'myreviews'
  const currentTab: TabType = React.useMemo(() => {
    if (isProfessional) {
      return activeTab === 'directory' ? 'directory' : 'dashboard';
    }
    // Non-professionals: if state somehow is 'dashboard', map to 'myreviews'
    return activeTab === 'dashboard' ? 'myreviews' : activeTab;
  }, [activeTab, isProfessional]);

  // Check if new user needs role selection
  useEffect(() => {
    if (user && !roleLoading) {
      try {
        const seen = localStorage.getItem(`role-selected-${user.email}`);
        const cached = localStorage.getItem(`cached-role-${user.email}`);
        const justSignedOut = sessionStorage.getItem('just-signed-out');
        if (justSignedOut) {
          // Clear the flag and avoid showing role selection modal on first load after sign-out
          sessionStorage.removeItem('just-signed-out');
          return;
        }
        // Show only if there's truly no record in DB (first-time user) and role is default customer
        if (!hasRecord && !seen && !cached && role === 'customer') {
          setShowRoleSelection(true);
        }
      } catch {
        if (role === 'customer') setShowRoleSelection(true);
      }
    }
  }, [user, role, roleLoading, hasRecord]);

  const handleRoleSelection = (selectedRole?: string) => {
    console.log('🔄 handleRoleSelection called with selectedRole:', selectedRole);
    console.log('🔄 Current role state:', role);
    
    if (user?.email) {
      try {
        localStorage.setItem(`role-selected-${user.email}`, 'true');
        if (selectedRole) {
          localStorage.setItem(`cached-role-${user.email}`, selectedRole);
        }
  } catch { /* ignore storage errors */ }
    }
    setShowRoleSelection(false);
    
    // Use the selectedRole parameter if provided, otherwise use the role state
    const roleToCheck = selectedRole || role;
    console.log('🔄 Role to check for professional setup:', roleToCheck);
    
    // If they selected professional, show profile setup
    if (roleToCheck === 'professional') {
      console.log('🚀 Setting showProfileSetup to true for professional role');
      setShowProfileSetup(true);
    } else {
      console.log('🔄 Not a professional role, roleToCheck:', roleToCheck);
    }
  };

  const handleOpenProfileSetup = () => {
    console.log('🚀 handleOpenProfileSetup called - showing profile setup modal');
    setShowProfileSetup(true);
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  const handleProfileSetupSkip = () => {
    setShowProfileSetup(false);
  };

  // Handle escape key to close account settings modal
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && showAccountSettings) {
        setShowAccountSettings(false);
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAccountSettings]);

  // Removed haircut fetching logic

  // Fetch reviews for the directory/browse functionality
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    if (!error && data) setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Fetch current user's reviews (all visibility)
  const fetchMyReviews = React.useCallback(async () => {
    if (!user?.email) return;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });
    if (!error && data) setMyReviews(data);
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchMyReviews();
    } else {
      setMyReviews([]);
    }
  }, [fetchMyReviews, user?.email]);

  // Removed handleLogHaircut

  function handleReviewSubmitted(data: Omit<Review, 'user_email'>) {
    if (!user || !user.email) return;
    const reviewWithEmail: Review = { ...data, user_email: user.email };
    if (reviewWithEmail.is_public) {
      setReviews([reviewWithEmail, ...reviews]);
    }
    setMyReviews([reviewWithEmail, ...myReviews]);
  }

  async function handleDeleteReview(reviewId: number) {
    if (!user || !user.email || !reviewId) return;

    try {
      const response = await fetch('/api/deleteReview', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reviewId,
          user_email: user.email,
        }),
      });

      if (response.ok) {
        // Refetch reviews from database to ensure consistency
        await Promise.all([fetchReviews(), fetchMyReviews()]);
      } else {
        const errorData = await response.json();
        alert('Failed to delete review: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  }

  async function handleReviewUpdated() {
    await Promise.all([fetchMyReviews(), fetchReviews()]);
  }

  // Removed handleDeleteHaircut

  function handleOpenAccountSettings() {
    setShowAccountSettings(true);
  }

  if (!user) {
    // Landing page for non-authenticated users
    return (
      <div className="min-h-screen font-inter" style={{background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #f8fafc)'}}>
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md" style={{backgroundColor: 'rgba(248, 250, 252, 0.8)', borderBottom: '1px solid rgba(17, 75, 95, 0.2)'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <span className="logo-wrapper">
                  <Image 
                    src="/ratemymua-logo.png" 
                    alt="RateMyMUA Logo" 
                    width={100} 
                    height={24}
                    priority
                    className="logo-img max-h-6"  
                  />
                </span>
              </div>
              <div className="flex items-center gap-6">
                <Link 
                  href="/directory" 
                  className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
                  style={{color: '#114B5F'}}
                >
                  Find Makeup Artists
                </Link>
                <Link 
                  href="/login" 
                  className="btn-primary-teal px-6 py-2.5 text-sm font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/40 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign Up with Google
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1
                aria-label="The Ultimate Platform for Makeup Artists and Clients"
                className="text-5xl md:text-7xl font-bold mb-10 leading-tight tracking-tight"
                style={{color: '#114B5F'}}
              >
                Discover Your Perfect{' '}
                <span className="text-gradient bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Makeup Artist</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed" style={{color: '#114B5F'}}>
                The platform where clients discover and review top makeup artists, and where talented <span className="font-semibold">Makeup Artist</span> profiles showcase their expertise
              </p>
              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/login" 
                    className="btn-primary-teal px-8 py-4 text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    Find & Review Makeup Artists
                  </Link>
                  <Link 
                    href="/directory" 
                    className="btn-secondary-light px-8 py-4 text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    Browse Directory
                  </Link>
                </div>
                <div className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>or</div>
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/40 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Create Makeup Artist Profile
                </Link>
              </div>
              {/* Removed promotional tagline per design update */}
            </div>
          </div>
          {/* Removed animation styles */}
          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(17, 75, 95, 0.2), transparent)'}}></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(247, 240, 222, 0.3), transparent)'}}></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgba(248, 250, 252, 0.5)'}}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color: '#114B5F'}}>
                The Ultimate Makeup Artist Platform
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{color: '#114B5F'}}>
                Discover vetted makeup artists, explore real client results, compare services & pricing, and build a credible professional brand—all in one place.
              </p>
            </div>
            
            {/* For Clients Section */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4" style={{color: '#114B5F'}}>
                  💁‍♀️ For Clients
                </h3>
                <p className="text-lg" style={{color: '#114B5F', opacity: 0.8}}>
                  Discover, review, and book talented makeup artists
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    icon: "🔍",
                    title: "Smart Artist Discovery",
                    description: "Filter by style, occasion & location to quickly find the right MUA"
                  },
                  {
                    icon: "💬",
                    title: "Authentic Reviews",
                    description: "Real client feedback with context so you can book confidently"
                  },
                  {
                    icon: "🎯",
                    title: "Occasion Matching",
                    description: "Bridal, reception, party or editorial—see specialists instantly"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    style={{backgroundColor: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
                  >
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h4 className="text-lg font-bold mb-3" style={{color: '#114B5F'}}>{feature.title}</h4>
                    <p className="text-sm leading-relaxed" style={{color: '#114B5F'}}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Professionals Section */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4" style={{color: '#114B5F'}}>
                  💄 For Makeup Artists
                </h3>
                <p className="text-lg" style={{color: '#114B5F', opacity: 0.8}}>
                  Showcase your artistry and grow your makeup business
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    icon: "🖼️",
                    title: "Portfolio & Media Showcase",
                    description: "Curate your best work & demonstrate range with high-impact visuals"
                  },
                  {
                    icon: "⭐",
                    title: "Reputation Engine",
                    description: "Build trust through verified client reviews that elevate your profile"
                  },
                  {
                    icon: "🌟",
                    title: "Credibility Badges",
                    description: "Earn verification & quality markers to stand out in searches"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    style={{backgroundColor: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(147, 51, 234, 0.2)'}}
                  >
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h4 className="text-lg font-bold mb-3" style={{color: '#114B5F'}}>{feature.title}</h4>
                    <p className="text-sm leading-relaxed" style={{color: '#114B5F'}}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Client Journey */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{color: '#114B5F'}}>
                  🌟 Your Makeup Journey Starts Here
                </h2>
                <p className="text-lg md:text-xl mb-8" style={{color: '#114B5F', opacity: 0.8}}>
                  Discover talented makeup artists, share your experiences, and build a community around authentic makeup artistry reviews.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/login" 
                    className="btn-primary-teal px-6 py-3 text-base font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    Start Reviewing
                  </Link>
                  <Link 
                    href="/directory" 
                    className="btn-secondary-light px-6 py-3 text-base font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    Browse Makeup Artists
                  </Link>
                </div>
              </div>
              
              {/* Professional Journey */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{color: '#114B5F'}}>
                  � Grow Your Makeup Artistry Brand
                </h2>
                <p className="text-lg md:text-xl mb-8" style={{color: '#114B5F', opacity: 0.8}}>
                  Showcase your makeup portfolio, earn authentic reviews, and connect with clients who appreciate your artistry and creativity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/login" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 text-base font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/40 hover:shadow-lg transition-all duration-200"
                  >
                    Create Artist Profile
                  </Link>
                  <Link 
                    href="/directory" 
                    className="border-2 border-purple-600 text-purple-600 px-6 py-3 text-base font-semibold rounded-full hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
                  >
                    See Artist Examples
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA removed per new minimalist landing strategy */}

        {/* Footer */}
        <footer className="py-12" style={{backgroundColor: '#114B5F', color: '#f1f5f9'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="logo-wrapper">
                  <Image 
                    src="/ratemymua-logo.png" 
                    alt="RateMyMUA Logo" 
                    width={100} 
                    height={26}
                    className="logo-img"
                  />
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm" style={{color:'#f1f5f9', opacity:.9}}>
                <p className="flex items-center gap-1">Made with ♥ in India</p>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
                  <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
                  <a href="mailto:support@ratemymua.com" className="hover:opacity-100 transition-opacity">Support</a>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdFg5beubYdZpjmjDkA2EBZboEZAZN1gCSmsdwX_XZ-KTBu2A/viewform"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Give Feedback
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}  // Authenticated user dashboard
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #f8fafc)'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgba(248, 250, 252, 0.95)', borderBottom: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="logo-wrapper">
                <Image 
                  src="/ratemymua-logo.png" 
                  alt="RateMyMUA Logo" 
                  width={100} 
                  height={24}
                  className="logo-img max-h-6"
                />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AccountDropdown user={user} onAccountSettings={handleOpenAccountSettings} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="backdrop-blur-sm rounded-xl shadow-lg overflow-hidden" style={{backgroundColor: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
          <TabNavigation activeTab={currentTab} setActiveTab={setActiveTab} userRole={role} />
          <div className="p-6" style={{backgroundColor: 'rgba(248, 250, 252, 0.3)'}}>
            {currentTab === 'myreviews' && !isProfessional && (
              <MyReviews
                reviews={myReviews}
                user={user}
                onDeleteReview={handleDeleteReview}
                onReviewUpdated={handleReviewUpdated}
              />
            )}
            {currentTab === 'aisearch' && !isProfessional && <ChatKitAISearch user={user} />}
            {currentTab === 'reviews' && !isProfessional && <ReviewForm onSubmit={handleReviewSubmitted} user={user} />}
            {currentTab === 'directory' && <PublicReviews reviews={reviews} user={user} onDeleteReview={handleDeleteReview} />}
            {currentTab === 'dashboard' && isProfessional && <ProfessionalDashboard user={user} onSetupProfile={handleOpenProfileSetup} />}
          </div>
        </div>
      </main>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAccountSettings(false);
            }
          }}
        >
          <div className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{backgroundColor: '#f8fafc', border: '1px solid rgba(17, 75, 95, 0.2)'}}>
            <div className="flex items-center justify-between p-6" style={{borderBottom: '1px solid rgba(17, 75, 95, 0.2)'}}>
              <h2 className="text-xl font-semibold" style={{color: '#114B5F'}}>Account Settings</h2>
              <button
                onClick={() => setShowAccountSettings(false)}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{color: '#114B5F', opacity: 0.7}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6" style={{backgroundColor: 'rgba(248, 250, 252, 0.5)'}}>
              <AccountSettings user={user} />
            </div>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleSelection && (
        <UserRoleSelection
          currentRole={role}
          onRoleUpdate={updateUserRole}
          onComplete={handleRoleSelection}
        />
      )}

      {/* Professional Profile Setup Modal */}
      {showProfileSetup && (
        <ProfessionalProfileSetup
          user={user}
          onComplete={handleProfileSetupComplete}
          onSkip={handleProfileSetupSkip}
        />
      )}

      {/* Footer */}
      <footer className="mt-16" style={{backgroundColor: 'rgba(248, 250, 252, 0.5)', borderTop: '1px solid rgba(17, 75, 95, 0.2)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm" style={{color:'#114B5F'}}>
              <p className="flex items-center gap-1">Made with ♥ in India</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
                <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
                <a href="mailto:support@ratemymua.com" className="hover:opacity-80 transition-opacity">Support</a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdFg5beubYdZpjmjDkA2EBZboEZAZN1gCSmsdwX_XZ-KTBu2A/viewform"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:opacity-80 transition-opacity"
                >
                  Give Feedback
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Removed PillCarousel component (animation no longer used)
