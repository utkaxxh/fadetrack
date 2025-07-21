
"use client";

import React, { useState } from 'react';
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
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in">Fadetrack</h1>
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
