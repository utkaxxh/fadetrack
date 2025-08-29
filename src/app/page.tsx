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



export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // Word flip state for hero headline
  const flipWords = ['Barber', 'Beautician', 'Makeup Artist'];
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % flipWords.length);
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
      <div className="min-h-screen font-inter" style={{background:'#fff'}}>
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur supports-backdrop-blur:bg-white/70" style={{borderBottom:'1px solid rgba(17,75,95,0.08)'}}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3" aria-label="Fadetrack Home">
                <span className="logo-wrapper">
                  <Image src="/fadetrack-logo-new.svg" alt="Fadetrack Logo" width={96} height={24} priority className="logo-img max-h-6" />
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-10 text-sm font-medium" style={{color:'#114B5F'}}>
                <Link href="#features" className="hover:opacity-70 transition-opacity">Features</Link>
                <Link href="/directory" className="hover:opacity-70 transition-opacity">Directory</Link>
                <Link href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</Link>
                <Link href="#faq" className="hover:opacity-70 transition-opacity">FAQ</Link>
              </nav>
              <div className="flex items-center gap-4">
                <Link href="/login" className="btn-secondary-ghost">Log in</Link>
                <Link href="/login" className="btn-primary-minimal">Get Started</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative section pt-32 pb-28 overflow-hidden">
          <div className="hero-gradient" />
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center flex flex-col items-center">
              <div className="eyebrow mb-6" style={{color:'#114B5F'}}>Community Grooming Intelligence</div>
              <h1 className="heading-display-tight font-bold tracking-tight mb-8 text-[clamp(2.8rem,6vw,4.5rem)]" style={{color:'#114B5F'}}>
                Review Your <PillCarousel words={flipWords} index={wordIndex} />
              </h1>
              <p className="subtle-text text-[clamp(1.1rem,2.1vw,1.6rem)] leading-snug max-w-2xl mb-12">
                Track every cut, surface trusted pros, and stay ahead of your style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link href="/login" className="btn-primary-minimal text-base sm:text-lg">Start Free</Link>
                <Link href="/directory" className="btn-secondary-ghost text-base sm:text-lg">Explore Directory</Link>
              </div>
            </div>
          </div>
          <style jsx>{`
            .pill-carousel { position:relative; display:inline-flex; align-items:center; justify-content:center; min-width:11ch; height:1.4em; padding:0 .75ch; vertical-align:baseline; border-radius:999px; background:#ffffff; border:1px solid rgba(17,75,95,0.15); box-shadow:0 2px 4px -2px rgba(17,75,95,0.20); overflow:hidden; margin-left:.15em; }
            .pill-word { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) translateY(12px); font-weight:600; line-height:1; white-space:nowrap; opacity:0; font-size:.9em; letter-spacing:-.01em; }
            @keyframes pillIn { 0% { transform:translate(-50%,-50%) translateY(16px); opacity:0;} 100% { transform:translate(-50%,-50%) translateY(0); opacity:1;} }
            @keyframes pillOut { 0% { transform:translate(-50%,-50%) translateY(0); opacity:1;} 100% { transform:translate(-50%,-50%) translateY(-12px); opacity:0;} }
            .pill-word.incoming { animation: pillIn .7s cubic-bezier(.4,.0,.2,1) forwards; }
            .pill-word.outgoing { animation: pillOut .6s cubic-bezier(.4,.0,.2,1) forwards; }
            @media (prefers-reduced-motion: reduce) { .pill-carousel { min-width:auto; height:auto; padding:0; border:none; box-shadow:none; } .pill-word { animation:none !important; opacity:1 !important; position:relative; top:auto; left:auto; transform:none; } }
          `}</style>
        </section>

        {/* Features Section */}
        <section id="features" className="section" style={{background:'#fafbfd'}}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-20 max-w-3xl">
              <h2 className="font-bold heading-display-tight text-[clamp(2rem,4.4vw,3.2rem)] mb-6" style={{color:'#114B5F'}}>The toolkit for maintaining a consistently great look</h2>
              <p className="subtle-text text-lg leading-relaxed">Purpose‑built features that remove guesswork, capture detail, and surface trustworthy professional talent.</p>
            </div>
            <div className="feature-grid">
              {[
                { icon:'✂️', title:'Haircut History', description:'Remember every cut—style, notes, cost, and what to repeat next time.'},
                { icon:'🔔', title:'Smart Reminders', description:'Adaptive intervals so you never miss the perfect maintenance window.'},
                { icon:'⭐', title:'Authentic Reviews', description:'Recent, signal‑rich feedback focused on craftsmanship and consistency.'},
                { icon:'📍', title:'Professional Directory', description:'Filter real talent by rating, location, and specialization.'},
                { icon:'💾', title:'Style Memory', description:'Capture photos & preferences so any chair becomes your chair.'},
                { icon:'📊', title:'Cost Insights', description:'Track spend trends and optimize quality vs. price.'}
              ].map(item => (
                <div key={item.title} className="feature-card">
                  <div className="feature-icon" aria-hidden="true">{item.icon}</div>
                  <div>
                    <h3 className="feature-title" style={{color:'#114B5F'}}>{item.title}</h3>
                    <p className="feature-desc" style={{color:'#114B5F'}}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Journey Section */}
        <section className="section-tight" style={{background:'#fff'}}>
          <div className="max-w-6xl mx-auto px-6 grid gap-16 md:grid-cols-2 items-start">
            <div>
              <h2 className="heading-display-tight font-semibold tracking-tight text-[clamp(1.9rem,3.4vw,2.6rem)] mb-6" style={{color:'#114B5F'}}>Designed for people who care about the details</h2>
              <p className="subtle-text text-lg leading-relaxed mb-8">From first fade through years of evolution, Fadetrack preserves preference and progress so you can iterate—never guess.</p>
              <div className="flex gap-4">
                <Link href="/login" className="btn-primary-minimal">Create Account</Link>
                <Link href="/directory" className="btn-secondary-ghost">Browse Barbers</Link>
              </div>
            </div>
            <div className="grid gap-6 text-sm" style={{color:'#114B5F'}}>
              {[
                '“I finally stopped scrolling old photos to remember what to ask for.”',
                '“Reminder hit exactly when the fade started looking soft.”',
                '“Directory reviews feel current—not years old fluff.”'
              ].map(q => (
                <div key={q} className="p-6 rounded-2xl" style={{background:'#f5f7f9'}}>{q}</div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section" style={{background:'#0d3a4a'}}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="font-semibold heading-display-tight tracking-tight text-[clamp(2.2rem,4.6vw,3.4rem)] text-white mb-8">Own your look. Keep the standard high.</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">Join early adopters refining how grooming quality is tracked, compared, and improved.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-primary-minimal" style={{background:'#114B5F'}}>Get Started</Link>
              <Link href="/directory" className="btn-secondary-ghost" style={{background:'rgba(255,255,255,0.12)', color:'#fff'}}>Explore Talent</Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-14" style={{background:'#fff', borderTop:'1px solid rgba(17,75,95,0.08)'}}>
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm" style={{color:'#114B5F'}}>
            <div className="flex items-center gap-3">
              <Image src="/fadetrack-logo-new.svg" alt="Fadetrack Logo" width={88} height={22} />
              <span className="opacity-60">© {new Date().getFullYear()} Fadetrack</span>
            </div>
            <div className="flex gap-8 opacity-70">
              <a href="#privacy" className="hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#terms" className="hover:opacity-100 transition-opacity">Terms</a>
              <a href="https://www.x.com/utkaxxh" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @utkaxxh
              </a>
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
            <p className="text-sm flex items-center gap-1" style={{color: '#114B5F'}}>
              Made with 
              <span className="mx-1" style={{color: '#114B5F'}}>♥</span> 
              in San Francisco
            </p>
            <a 
              href="https://www.x.com/utkaxxh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm transition-colors duration-200"
              style={{color: '#114B5F'}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              @utkaxxh
            </a>
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
