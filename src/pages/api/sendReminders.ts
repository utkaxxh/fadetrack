import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Get all reminders and their users' last haircut
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('user_email, days');

  if (error) return res.status(500).json({ error: error.message });

  for (const reminder of reminders || []) {
    // Get the user's last haircut
    const { data: haircuts } = await supabase
      .from('haircuts')
      .select('date')
      .eq('user_email', reminder.user_email)
      .order('date', { ascending: false })
      .limit(1);

    if (!haircuts || haircuts.length === 0) continue;

    const lastDate = new Date(haircuts[0].date);
    const nextDue = new Date(lastDate);
    nextDue.setDate(nextDue.getDate() + reminder.days);

    if (nextDue <= new Date()) {
      // Send email with Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'reminders@yourdomain.com',
          to: reminder.user_email,
          subject: 'Time for your next haircut!',
          html: `<p>Hey! It's time to book your next haircut. Log in to Fadetrack to keep your style fresh.</p>`,
        }),
      });
    }
  }

  res.status(200).json({ status: 'Reminders sent' });
}
