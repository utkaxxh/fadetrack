import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Update the existing reminder to use the verified email
    const { data, error } = await supabase
      .from('reminders')
      .update({ user_email: 'utkarsh_agrawal@rocketmail.com' })
      .eq('user_email', 'utkarsh.agrawal777@gmail.com');

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ 
      status: 'Email updated successfully',
      updated: data
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
