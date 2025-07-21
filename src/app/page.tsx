
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../components/supabaseClient';
import TabNavigation from '../components/TabNavigation';
import HaircutForm from '../components/HaircutForm';
import HaircutHistory from '../components/HaircutHistory';
import ReminderSettings from '../components/ReminderSettings';
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

  function handleLogHaircut(data: Omit<Haircut, 'user_email'>) {
    if (!user || !user.email) return;
    const haircutWithEmail: Haircut = { ...data, user_email: user.email };
    setHaircuts([haircutWithEmail, ...haircuts]);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto py-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent animate-fade-in">Fadetrack</h1>
          {user ? (
            <button
              className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 text-white font-semibold transition-all duration-200"
              onClick={async () => { await supabase.auth.signOut(); }}
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 text-white font-semibold transition-all duration-200">
              Login / Signup
            </Link>
          )}
        </div>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'log' && <HaircutForm onSubmit={handleLogHaircut} user={user} />}
          {activeTab === 'history' && <HaircutHistory haircuts={haircuts} user={user} />}
          {activeTab === 'reminders' && <ReminderSettings user={user} />}
        </div>
      </div>
    </main>
  );
}
