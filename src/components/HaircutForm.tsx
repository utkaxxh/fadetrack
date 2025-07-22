
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

import type { Haircut } from '../app/page';
import type { User } from '@supabase/supabase-js';


interface HaircutFormProps {
  onSubmit: (data: Omit<Haircut, 'user_email'>) => void;
  user: User | null;
}


export default function HaircutForm({ onSubmit, user }: HaircutFormProps) {
  const [form, setForm] = useState<Omit<Haircut, 'user_email'>>({
    date: '',
    barber: '',
    location: '',
    style: '',
    cost: '',
    notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !user.email) {
      alert('You must be logged in to log a haircut.');
      return;
    }
    const haircutWithEmail: Haircut = { ...form, user_email: user.email };
    // Insert haircut into Supabase
    const { error } = await supabase.from('haircuts').insert([haircutWithEmail]);
    if (error) {
      alert('Failed to log haircut: ' + error.message);
      return;
    }
    onSubmit(form);
    setForm({ date: '', barber: '', location: '', style: '', cost: '', notes: '' });
  }

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input 
              id="date"
              name="date" 
              type="date" 
              value={form.date} 
              onChange={handleChange} 
              required 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
              Cost
            </label>
            <input 
              id="cost"
              name="cost" 
              type="number" 
              value={form.cost} 
              onChange={handleChange} 
              required 
              placeholder="25.00" 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="barber" className="block text-sm font-medium text-gray-700 mb-2">
            Barber/Salon Name
          </label>
          <input 
            id="barber"
            name="barber" 
            value={form.barber} 
            onChange={handleChange} 
            required 
            placeholder="John's Barbershop" 
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input 
            id="location"
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            required 
            placeholder="Downtown SF" 
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <input 
            id="style"
            name="style" 
            value={form.style} 
            onChange={handleChange} 
            required 
            placeholder="Fade, Buzz Cut, etc." 
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea 
            id="notes"
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            placeholder="Any additional notes..." 
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Log Haircut
        </button>
      </form>
    </div>
  );
}
