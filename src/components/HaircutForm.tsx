
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import confetti from 'canvas-confetti';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Confetti celebration function
  function celebrateHaircut() {
    // Fire confetti from multiple angles
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from left and right
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    // Additional burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !user.email) {
      alert('You must be logged in to log a haircut.');
      return;
    }

    setIsSubmitting(true);
    
    const haircutWithEmail: Haircut = { ...form, user_email: user.email };
    // Insert haircut into Supabase
    const { error } = await supabase.from('haircuts').insert([haircutWithEmail]);
    
    if (error) {
      alert('Failed to log haircut: ' + error.message);
      setIsSubmitting(false);
      return;
    }

    // Success! Celebrate with confetti
    celebrateHaircut();
    setShowSuccess(true);
    
    // Hide success message after 4 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);

    onSubmit(form);
    setForm({ date: '', barber: '', location: '', style: '', cost: '', notes: '' });
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Haircut logged successfully! ✂️🎉</span>
          </div>
        </div>
      )}
      
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
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging...
            </div>
          ) : (
            'Log Haircut'
          )}
        </button>
      </form>
    </div>
  );
}
