
import React, { useState } from 'react';
import { saveReminder, getReminders, deleteReminder } from './remindersApi';
import type { User } from '@supabase/supabase-js';

type Reminder = {
  id: string;
  user_email: string;
  reminder_days: number;
  is_active: boolean;
  last_sent_at: string;
  created_at?: string;
  updated_at?: string;
};

const presetIntervals = [14, 21, 28, 35, 42, 49, 56]; // 2-8 weeks

interface ReminderSettingsProps {
  user: User | null;
}

export default function ReminderSettings({ user }: ReminderSettingsProps) {
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  async function fetchReminders() {
    if (!user || !user.email) return;
    try {
      const data = await getReminders(user.email);
      setReminders(data || []);
    } catch (e) {
      // ignore
    }
  }

  React.useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line
  }, [user]);

  async function handleSetReminder(days: number) {
    if (!user || !user.email) {
      alert('Please log in to set reminders.');
      return;
    }
    setLoading(true);
    try {
      await saveReminder(user.email, days);
      alert(`Reminder set for ${days} days!`);
      await fetchReminders();
    } catch (e) {
      if (e instanceof Error) {
        alert('Failed to set reminder: ' + e.message);
      } else {
        alert('Failed to set reminder.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReminder(id: string) {
    if (!user || !user.email) return;
    setLoading(true);
    try {
      await deleteReminder(id, user.email);
      await fetchReminders();
    } catch (e) {
      alert('Failed to delete reminder.');
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
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 text-white font-semibold transition-all duration-200"
            onClick={() => handleSetReminder(days)}
            disabled={loading}
          >
            {days / 7} weeks
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center mb-4">
        <input
          type="number"
          min="1"
          placeholder="Custom days"
          value={customDays}
          onChange={e => setCustomDays(e.target.value)}
          className="input"
        />
        <button
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 text-white font-semibold transition-all duration-200"
          onClick={() => {
            if (customDays) handleSetReminder(Number(customDays));
          }}
          disabled={loading}
        >
          Set
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Reminders</h3>
        {reminders.length === 0 && <div className="text-gray-400">No reminders set.</div>}
        <ul className="space-y-2">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-white">Every <b>{reminder.reminder_days}</b> days</span>
              <button
                className="ml-4 px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-semibold"
                onClick={() => handleDeleteReminder(reminder.id)}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
