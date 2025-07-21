
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
      <label className="text-white font-semibold">Date</label>
      <input name="date" type="date" value={form.date} onChange={handleChange} required className="input" />
      <input name="barber" value={form.barber} onChange={handleChange} required placeholder="Barber/Salon Name" className="input" />
      <input name="location" value={form.location} onChange={handleChange} required placeholder="Location" className="input" />
      <input name="style" value={form.style} onChange={handleChange} required placeholder="Style" className="input" />
      <input name="cost" type="number" value={form.cost} onChange={handleChange} required placeholder="Cost" className="input" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (optional)" className="input min-h-[60px]" />
      <button type="submit" className="mt-2 py-2 px-6 rounded-lg bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 text-white font-bold transition-all duration-200">Log Haircut</button>
    </form>
  );
}
