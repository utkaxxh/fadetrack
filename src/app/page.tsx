
"use client";
import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import HaircutForm from '../components/HaircutForm';
import HaircutHistory from '../components/HaircutHistory';
import ReminderSettings from '../components/ReminderSettings';
import { useSupabaseUser } from '../components/useSupabaseUser';


export default function HomePage() {
  const [activeTab, setActiveTab] = useState('log');
  const [haircuts, setHaircuts] = useState<any[]>([]);
  const user = useSupabaseUser();

  function handleLogHaircut(data: any) {
    setHaircuts([data, ...haircuts]);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto py-8 px-2">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in">Fadetrack</h1>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'log' && <HaircutForm onSubmit={handleLogHaircut} />}
          {activeTab === 'history' && <HaircutHistory haircuts={haircuts} />}
          {activeTab === 'reminders' && <ReminderSettings user={user} />}
        </div>
      </div>
    </main>
  );
}
