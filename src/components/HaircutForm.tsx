
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface HaircutFormProps {
  onSubmit: (data: any) => void;
}

export default function HaircutForm({ onSubmit }: HaircutFormProps) {
  const [form, setForm] = useState({
    date: '',
    barber: '',
    location: '',
    style: '',
    cost: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Insert haircut into Supabase
    const { data, error } = await supabase.from('haircuts').insert([form]);
    if (error) {
      alert('Failed to log haircut: ' + error.message);
      return;
    }
    onSubmit(form);
    setForm({ date: '', barber: '', location: '', style: '', cost: '' });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
      <input name="date" type="date" value={form.date} onChange={handleChange} required placeholder="Date" className="input" />
      <input name="barber" value={form.barber} onChange={handleChange} required placeholder="Barber/Salon Name" className="input" />
      <input name="location" value={form.location} onChange={handleChange} required placeholder="Location" className="input" />
      <input name="style" value={form.style} onChange={handleChange} required placeholder="Style" className="input" />
      <input name="cost" type="number" value={form.cost} onChange={handleChange} required placeholder="Cost" className="input" />
      <button type="submit" className="mt-2 py-2 px-6 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all duration-200">Log Haircut</button>
    </form>
  );
}
