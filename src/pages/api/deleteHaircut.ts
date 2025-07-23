import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../components/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, user_email } = req.body;

    if (!id || !user_email) {
      return res.status(400).json({ error: 'Missing required fields: id and user_email' });
    }

    // Delete the haircut (ensuring it belongs to the authenticated user)
    const { error } = await supabase
      .from('haircuts')
      .delete()
      .eq('id', id)
      .eq('user_email', user_email);

    if (error) {
      console.error('Error deleting haircut:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Haircut deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteHaircut:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
