import { supabase } from './supabaseClient';

export async function saveReminder(user_email: string, days: number) {
  // Save reminder to Supabase with user_email as PK
  const { data, error } = await supabase.from('reminders').insert([
    { user_email, days }
  ]);
  if (error) throw error;
  return data;
}
