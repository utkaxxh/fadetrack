
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Reminders</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Setup - Remind me every:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetIntervals.map((days) => (
                <button
                  key={days}
                  className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onClick={() => handleSetReminder(days)}
                  disabled={loading}
                >
                  {days / 7} week{days > 7 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="customDays" className="block text-sm font-medium text-gray-700 mb-2">
              Custom interval (days):
            </label>
            <div className="flex gap-2">
              <input
                id="customDays"
                type="number"
                min="1"
                placeholder="30"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                onClick={() => {
                  if (customDays) handleSetReminder(Number(customDays));
                }}
                disabled={loading || !customDays}
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>

      {reminders.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reminders</h3>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 font-medium">
                    Every {reminder.reminder_days} day{reminder.reminder_days > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  onClick={() => handleDeleteReminder(reminder.id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
