import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Get all active reminders
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('id, user_email, reminder_days, last_sent_at')
      .eq('is_active', true);

    if (error) return res.status(500).json({ error: error.message });

    const today = new Date();
    const emailsSent = [];

    for (const reminder of reminders || []) {
      // Calculate when the next reminder should be sent
      const lastSentDate = new Date(reminder.last_sent_at);
      const nextReminderDate = new Date(lastSentDate);
      nextReminderDate.setDate(nextReminderDate.getDate() + reminder.reminder_days);

      // Check if it's time to send the reminder
      if (nextReminderDate <= today) {
        try {
          // Send email with Resend
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'onboarding@resend.dev', // Use Resend's test domain
              to: reminder.user_email,
              subject: 'Time for your next haircut! ✂️',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Time for your next haircut!</h2>
                  <p>Hey there! 👋</p>
                  <p>It's been ${reminder.reminder_days} days since your last reminder. Time to book your next haircut and keep your style looking fresh!</p>
                  <p><a href="https://fadetrack.vercel.app" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Open Fadetrack</a></p>
                  <p style="color: #6b7280; font-size: 14px;">Log your haircut and track your style journey with Fadetrack.</p>
                  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px;">Made with ♥ in San Francisco</p>
                </div>
              `,
            }),
          });

          const emailResult = await emailResponse.text();
          console.log(`Email API response for ${reminder.user_email}:`, emailResponse.status, emailResult);

          if (emailResponse.ok) {
            // Update last_sent_at to today
            await supabase
              .from('reminders')
              .update({ last_sent_at: today.toISOString() })
              .eq('id', reminder.id);

            emailsSent.push(reminder.user_email);
          }
        } catch (emailError) {
          console.error(`Failed to send email to ${reminder.user_email}:`, emailError);
        }
      }
    }

    res.status(200).json({ 
      status: 'Reminders processed', 
      emailsSent: emailsSent.length,
      recipients: emailsSent 
    });
  } catch (error) {
    console.error('Error in sendReminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
