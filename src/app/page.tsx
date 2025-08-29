"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../components/supabaseClient';
import TabNavigation, { TabType } from '../components/TabNavigation';
import HaircutForm from '../components/HaircutForm';
import HaircutHistory from '../components/HaircutHistory';
import ReminderSettings from '../components/ReminderSettings';
import AccountSettings from '../components/AccountSettings';
import AccountDropdown from '../components/AccountDropdown';
import ReviewForm from '../components/ReviewForm';
import PublicReviews from '../components/PublicReviews';
import UserRoleSelection from '../components/UserRoleSelection';
import ProfessionalProfileSetup from '../components/ProfessionalProfileSetup';
import ProfessionalDashboard from '../components/ProfessionalDashboard';
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



// Static list of rotating words for hero animation (module-level avoids hook deps warnings)
const FLIP_WORDS = ['Barber', 'Beautician', 'Makeup Artist'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // Word flip state for hero headline
  const flipWords = FLIP_WORDS; // alias for clarity inside component
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
  setWordIndex(i => (i + 1) % FLIP_WORDS.length);
    }, 2400); // cycle every 2.4s
    return () => clearInterval(interval);
  }, []);
  const user = useSupabaseUser();
  const { role, updateUserRole, isProfessional, isLoading: roleLoading } = useUserRole(user);

  // Set default tab based on user role
  useEffect(() => {
    if (!roleLoading) {
      if (isProfessional && activeTab === 'log') {
        setActiveTab('dashboard');
      } else if (!isProfessional && activeTab === 'dashboard') {
        setActiveTab('log');
      }
    }
  }, [isProfessional, roleLoading, activeTab]);

  // Check if new user needs role selection
  useEffect(() => {
    if (user && !roleLoading && role === 'customer') {
      // Check if this is a new user (no previous role set) or if they want to switch
      const hasSeenRoleSelection = localStorage.getItem(`role-selected-${user.email}`);
      if (!hasSeenRoleSelection) {
        setShowRoleSelection(true);
      }
    }
  }, [user, role, roleLoading]);

  const handleRoleSelection = (selectedRole?: string) => {
    console.log('🔄 handleRoleSelection called with selectedRole:', selectedRole);
    console.log('🔄 Current role state:', role);
    
    if (user?.email) {
      localStorage.setItem(`role-selected-${user.email}`, 'true');
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

  // Fetch haircuts from Supabase when user logs in
  useEffect(() => {
    async function fetchHaircuts() {
      if (!user || !user.email) {
        setHaircuts([]);
        return;
      }
      const { data, error } = await supabase
        .from('haircuts')
        .select('*')
        .eq('user_email', user.email)
        .order('date', { ascending: false });
      if (!error && data) setHaircuts(data);
    }
    fetchHaircuts();
  }, [user]);

  // Fetch reviews for the directory/browse functionality
  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (!error && data) setReviews(data);
    }
    fetchReviews();
  }, []);

  function handleLogHaircut(data: Omit<Haircut, 'user_email'>) {
    if (!user || !user.email) return;
    const haircutWithEmail: Haircut = { ...data, user_email: user.email };
    setHaircuts([haircutWithEmail, ...haircuts]);
  }

  function handleReviewSubmitted(data: Omit<Review, 'user_email'>) {
    if (!user || !user.email) return;
    const reviewWithEmail: Review = { ...data, user_email: user.email };
    if (reviewWithEmail.is_public) {
      setReviews([reviewWithEmail, ...reviews]);
    }
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
        setReviews(reviews.filter(review => review.id !== reviewId));
      } else {
        const errorData = await response.json();
        alert('Failed to delete review: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  }

  async function handleDeleteHaircut(haircutId: number) {
    if (!user || !user.email || !haircutId) return;

    try {
      const response = await fetch('/api/deleteHaircut', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: haircutId,
          user_email: user.email,
        }),
      });

      if (response.ok) {
        // Remove the deleted haircut from the local state
        setHaircuts(haircuts.filter(cut => cut.id !== haircutId));
      } else {
        const errorData = await response.json();
        alert('Failed to delete haircut: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error deleting haircut:', error);
      alert('Failed to delete haircut. Please try again.');
    }
  }

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
                    src="/fadetrack-logo-new.svg" 
                    alt="Fadetrack Logo" 
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
                  Find Professionals
                </Link>
                <Link 
                  href="/login" 
                  className="btn-primary-teal px-6 py-2.5 text-sm font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  Get Started
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
                aria-label="Review Your Barber, Beautician, or Stylist"
                className="text-5xl md:text-7xl font-bold mb-10 leading-tight tracking-tight"
                style={{color: '#114B5F'}}
              >
                Review Your{' '}
                <PillCarousel words={flipWords} index={wordIndex} />
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{color: '#114B5F'}}>
                Honest, recent, community-powered grooming reviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/login" 
                  className="btn-primary-teal px-8 py-4 text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  Rate My Stylist
                </Link>
                <Link 
                  href="/directory" 
                  className="btn-secondary-light px-8 py-4 text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                >
                  Find Professionals
                </Link>
              </div>
            </div>
          </div>
          {/* Animation styles */}
          <style jsx>{`
            .pill-carousel { position:relative; display:inline-flex; align-items:center; justify-content:center; min-width:13ch; height:1.6em; padding:0 .9ch; vertical-align:baseline; border-radius:999px; background:linear-gradient(135deg,#ffffff,#f1f5f9); box-shadow:0 2px 6px -2px rgba(17,75,95,0.25),0 0 0 1px rgba(17,75,95,0.18); overflow:hidden; }
            .pill-carousel::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 30% 25%,rgba(17,75,95,.08),transparent 65%); pointer-events:none; }
            .pill-word { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-weight:700; line-height:1; white-space:nowrap; opacity:0; }
            @keyframes pillIn { 0% { transform:translate(-50%,-50%) translateX(40%); opacity:0;} 100% { transform:translate(-50%,-50%) translateX(0); opacity:1;} }
            @keyframes pillOut { 0% { transform:translate(-50%,-50%) translateX(0); opacity:1;} 100% { transform:translate(-50%,-50%) translateX(-40%); opacity:0;} }
            .pill-word.incoming { animation: pillIn .7s cubic-bezier(.77,.03,.22,1) forwards; }
            .pill-word.outgoing { animation: pillOut .7s cubic-bezier(.77,.03,.22,1) forwards; }
            .pill-word.static { opacity:1; position:relative; left:auto; top:auto; transform:none; animation:none; }
            @media (prefers-reduced-motion: reduce) { .pill-carousel { background:none; box-shadow:none; min-width:auto; height:auto; padding:0; } .pill-word { animation:none !important; opacity:1 !important; position:relative; left:auto; top:auto; transform:none; } }
          `}</style>
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
                Everything You Need to Track Your Style
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{color: '#114B5F'}}>
                Comprehensive tools to help you maintain your perfect look and discover amazing barbers
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "�",
                  title: "Haircut History",
                  description: "Keep detailed records of every haircut including style, cost, and notes"
                },
                {
                  icon: "🔔",
                  title: "Smart Reminders",
                  description: "Get notified when it's time for your next cut based on your schedule"
                },
                {
                  icon: "✂️",
                  title: "Pro Reviews",
                  description: "Rate and review barbers, makeup artists, stylists—discover top talent near you"
                },
                {
                  icon: "📱",
                  title: "Mobile Friendly",
                  description: "Access your haircut history and reminders from any device, anywhere"
                },
                {
                  icon: "🏪",
                  title: "Professional Directory",
                  description: "Browse verified grooming professionals and read authentic customer reviews"
                },
                {
                  icon: "💰",
                  title: "Cost Tracking",
                  description: "Monitor your grooming expenses and find the best value for money"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{backgroundColor: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(17, 75, 95, 0.2)'}}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3" style={{color: '#114B5F'}}>{feature.title}</h3>
                  <p className="leading-relaxed" style={{color: '#114B5F'}}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{color: '#114B5F'}}>
              Your Haircut Journey Starts Here
            </h2>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto" style={{color: '#114B5F', opacity: 0.8}}>
              Log every cut, discover great barbers, never settle for less
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Track Your Perfect Cut?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{color: '#ffffff', opacity: 0.9}}>
              Start your personalized haircut tracking journey today
            </p>
            <Link 
              href="/login" 
              className="inline-block px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 shadow-2xl transform hover:scale-105 btn-secondary-light focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              Get Started for Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12" style={{backgroundColor: '#114B5F', color: '#f1f5f9'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="logo-wrapper">
                  <Image 
                    src="/fadetrack-logo-new.svg" 
                    alt="Fadetrack Logo" 
                    width={100} 
                    height={26}
                    className="logo-img"
                  />
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm" style={{color:'#f1f5f9', opacity:.9}}>
                <p className="flex items-center gap-1">
                  Made with <span className="mx-1">♥</span> in San Francisco
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
                  <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
                  <a href="mailto:support@fadetrack.com" className="hover:opacity-100 transition-opacity">support@fadetrack.com</a>
                  <a 
                    href="https://www.x.com/utkaxxh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors duration-200"
                    style={{color: '#f1f5f9'}}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    @utkaxxh
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
                  src="/fadetrack-logo-new.svg" 
                  alt="Fadetrack Logo" 
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
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} userRole={role} />
          <div className="p-6" style={{backgroundColor: 'rgba(248, 250, 252, 0.3)'}}>
            {activeTab === 'log' && !isProfessional && <HaircutForm onSubmit={handleLogHaircut} user={user} />}
            {activeTab === 'history' && !isProfessional && <HaircutHistory haircuts={haircuts} user={user} onDelete={handleDeleteHaircut} />}
            {activeTab === 'reminders' && !isProfessional && <ReminderSettings user={user} />}
            {activeTab === 'reviews' && !isProfessional && <ReviewForm onSubmit={handleReviewSubmitted} user={user} />}
            {activeTab === 'directory' && <PublicReviews reviews={reviews} user={user} onDeleteReview={handleDeleteReview} />}
            {activeTab === 'dashboard' && isProfessional && <ProfessionalDashboard user={user} onSetupProfile={handleOpenProfileSetup} />}
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
              <p className="flex items-center gap-1">
                Made with <span className="mx-1">♥</span> in San Francisco
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
                <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
                <a href="mailto:support@fadetrack.com" className="hover:opacity-80 transition-opacity">support@fadetrack.com</a>
                <a 
                  href="https://www.x.com/utkaxxh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @utkaxxh
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Local component for pill carousel headline animation
function PillCarousel({ words, index }: { words: string[]; index: number }) {
  // Keep track of previous index to apply outgoing animation
  const [prevIndex, setPrevIndex] = React.useState(index);
  React.useEffect(() => {
    if (index !== prevIndex) {
      setPrevIndex(index);
    }
  }, [index, prevIndex]);
  return (
    <span className="pill-carousel" aria-live="polite" aria-atomic="true">
      {words.map((w, i) => {
        const state = i === index ? 'incoming' : i === prevIndex ? 'outgoing' : 'hidden';
        if (state === 'hidden') return null;
        return (
          <span
            key={w + i + state}
            className={`pill-word ${state === 'incoming' ? 'incoming' : state === 'outgoing' ? 'outgoing' : ''}`}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
}
