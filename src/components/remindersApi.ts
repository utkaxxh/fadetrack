import { supabase } from './supabaseClient';

export async function saveReminder(user_email: string, days: number) {
  // Set last_sent_at to a date in the past so the reminder can be sent based on the interval
  // This allows the first reminder to be sent after 'days' from when it was created
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days); // Set to 'days' ago so next reminder is due today
  
  const { data, error } = await supabase.from('reminders').insert([
    { user_email, reminder_days: days, is_active: true, last_sent_at: pastDate.toISOString() }
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
