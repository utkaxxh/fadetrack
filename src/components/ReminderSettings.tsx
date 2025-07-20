import React, { useState } from 'react';
import { saveReminder } from './remindersApi';

const presetIntervals = [14, 21, 28, 35, 42, 49, 56]; // 2-8 weeks


interface ReminderSettingsProps {
  user?: { id: string; email: string };
}


  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSetReminder(days: number) {
    if (!user) {
      alert('Please log in to set reminders.');
      return;
    }
    setLoading(true);
    try {
      await saveReminder(user.id, days, user.email);
      alert(`Reminder set for ${days} days!`);
    } catch (e: any) {
      alert('Failed to set reminder: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-6 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-white">Set Email Reminder</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {presetIntervals.map((days) => (
          <button
            key={days}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all duration-200"
            onClick={() => handleSetReminder(days)}
            disabled={loading}
          >
            {days / 7} weeks
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min="1"
          placeholder="Custom days"
          value={customDays}
          onChange={e => setCustomDays(e.target.value)}
          className="input"
        />
        <button
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all duration-200"
          onClick={() => {
            if (customDays) handleSetReminder(Number(customDays));
          }}
          disabled={loading}
        >
          Set
        </button>
      </div>
    </div>
  );
}
