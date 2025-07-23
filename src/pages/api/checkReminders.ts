import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all reminders to debug
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true);

    if (error) return res.status(500).json({ error: error.message });

    const today = new Date();
    const reminderStatus = reminders?.map(reminder => {
      const lastSentDate = new Date(reminder.last_sent_at);
      const nextReminderDate = new Date(lastSentDate);
      nextReminderDate.setDate(nextReminderDate.getDate() + reminder.reminder_days);
      
      return {
        id: reminder.id,
        user_email: reminder.user_email,
        reminder_days: reminder.reminder_days,
        last_sent_at: reminder.last_sent_at,
        next_reminder_due: nextReminderDate.toISOString(),
        is_due: nextReminderDate <= today,
        days_until_due: Math.ceil((nextReminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    res.status(200).json({ 
      reminders: reminderStatus,
      current_time: today.toISOString()
    });
  } catch (error) {
    console.error('Error in checkReminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
