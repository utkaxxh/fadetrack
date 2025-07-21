import { supabase } from './supabaseClient';

export async function saveReminder(user_email: string, days: number) {
  // Save reminder to Supabase with correct schema, set last_sent_at to today
  const today = new Date().toISOString();
  const { data, error } = await supabase.from('reminders').insert([
    { user_email, reminder_days: days, is_active: true, last_sent_at: today }
  ]);
  if (error) throw error;
  return data;
}

export async function getReminders(user_email: string) {
  const { data, error } = await supabase.from('reminders').select('*').eq('user_email', user_email);
  if (error) throw error;
  return data;
}

export async function deleteReminder(id: string, user_email: string) {
  const { error } = await supabase.from('reminders').delete().eq('id', id).eq('user_email', user_email);
  if (error) throw error;
}
