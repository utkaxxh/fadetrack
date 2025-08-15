import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import confetti from 'canvas-confetti';
import LocationAutocomplete, { LocationData } from './LocationAutocomplete';

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

  const [locationData, setLocationData] = useState<LocationData | null>(null);
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

    if (!form.location || !locationData) {
      alert('Please select a location from suggestions so we can save full details.');
      return;
    }

    setIsSubmitting(true);
    
    const fullLocation = locationData?.formatted || form.location;
    const haircutWithEmail: Haircut = { ...form, location: fullLocation, user_email: user.email };
    
    // Prepare data with structured location
    const haircutData = {
      ...haircutWithEmail,
      city: locationData?.city || '',
      state: locationData?.state || '',
      country: locationData?.country || '',
      place_id: locationData?.place_id || null
    };
    
    const { error } = await supabase.from('haircuts').insert([haircutData]);
    
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

    onSubmit({ ...form, location: fullLocation });
    setForm({ date: '', barber: '', location: '', style: '', cost: '', notes: '' });
    setLocationData(null);
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 rounded-lg animate-pulse" style={{backgroundColor: 'rgba(247, 240, 222, 0.8)', border: '1px solid #114B5F', color: '#114B5F'}}>
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
            <label htmlFor="date" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Date
            </label>
            <input 
              id="date"
              name="date" 
              type="date" 
              value={form.date} 
              onChange={handleChange} 
              required 
              className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              style={{
                color: '#114B5F',
                borderColor: 'rgba(17, 75, 95, 0.3)'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
          
          <div>
            <label htmlFor="cost" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
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
              className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              style={{
                color: '#114B5F',
                borderColor: 'rgba(17, 75, 95, 0.3)'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="barber" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Barber/Salon Name
          </label>
          <input 
            id="barber"
            name="barber" 
            value={form.barber} 
            onChange={handleChange} 
            required 
            placeholder="John's Barbershop" 
            className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            style={{
              color: '#114B5F',
              borderColor: 'rgba(17, 75, 95, 0.3)'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Location
          </label>
          <LocationAutocomplete
            id="location"
            name="location" 
            value={form.location} 
            onChange={(value: string, data?: LocationData) => {
              setForm({ ...form, location: value });
              setLocationData(data || null);
            }}
            required 
            placeholder="Enter city, state, country..." 
            className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            style={{
              color: '#114B5F',
              borderColor: 'rgba(17, 75, 95, 0.3)'
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.boxShadow = 'none'}
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Style
          </label>
          <input 
            id="style"
            name="style" 
            value={form.style} 
            onChange={handleChange} 
            required 
            placeholder="Fade, Buzz Cut, etc." 
            className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            style={{
              color: '#114B5F',
              borderColor: 'rgba(17, 75, 95, 0.3)'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Notes (optional)
          </label>
          <textarea 
            id="notes"
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            placeholder="Any additional notes..." 
            rows={3}
            className="block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            style={{
              color: '#114B5F',
              borderColor: 'rgba(17, 75, 95, 0.3)'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(17, 75, 95, 0.3)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 btn-primary-teal disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isSubmitting ? 'rgba(17, 75, 95, 0.5)' : undefined,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{color: '#ffffff'}}>
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
