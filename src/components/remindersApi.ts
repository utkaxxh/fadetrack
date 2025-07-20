import { supabase } from './supabaseClient';

export async function saveReminder(user_id: string, days: number, email: string) {
  // Save reminder to Supabase
  const { data, error } = await supabase.from('reminders').insert([
    { user_id, days, email }
  ]);
  if (error) throw error;
  return data;
}
