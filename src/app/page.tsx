
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../components/supabaseClient';
import TabNavigation from '../components/TabNavigation';
import HaircutForm from '../components/HaircutForm';
import HaircutHistory from '../components/HaircutHistory';
import ReminderSettings from '../components/ReminderSettings';
import ThemeToggle from '../components/ThemeToggle';
import { useSupabaseUser } from '../components/useSupabaseUser';

export type Haircut = {
  user_email: string;
  date: string;
  barber: string;
  location: string;
  style: string;
  cost: string;
  notes?: string;
};



export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'reminders'>('log');
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const user = useSupabaseUser();

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

  function handleLogHaircut(data: Omit<Haircut, 'user_email'>) {
    if (!user || !user.email) return;
    const haircutWithEmail: Haircut = { ...data, user_email: user.email };
    setHaircuts([haircutWithEmail, ...haircuts]);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image 
                src="/fadetrack-logo.svg" 
                alt="Fadetrack Logo" 
                width={32} 
                height={32}
                className="transition-transform hover:scale-105"
              />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Fadetrack</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={async () => { await supabase.auth.signOut(); }}
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-6">
            {activeTab === 'log' && <HaircutForm onSubmit={handleLogHaircut} user={user} />}
            {activeTab === 'history' && <HaircutHistory haircuts={haircuts} user={user} />}
            {activeTab === 'reminders' && <ReminderSettings user={user} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              Made with 
              <span className="text-red-500 mx-1">♥</span> 
              in San Francisco
            </p>
            <a 
              href="https://www.x.com/utkaxxh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
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
