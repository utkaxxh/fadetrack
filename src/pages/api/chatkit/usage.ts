import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use service role to read all usage data
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (email && typeof email === 'string') {
      // Get usage for specific user
      const { data, error } = await supabase
        .from('chatkit_usage')
        .select('*')
        .eq('user_email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(200).json({
          user_email: email,
          total_sessions: 0,
          daily_sessions: 0,
          monthly_sessions: 0,
          last_session_at: null,
          message: 'No usage data found for this user'
        });
      }

      return res.status(200).json(data);
    } else {
      // Get usage for all users (admin view)
      const { data, error } = await supabase
        .from('chatkit_usage')
        .select('*')
        .order('total_sessions', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Calculate totals
      const totals = {
        totalUsers: data?.length || 0,
        totalSessions: data?.reduce((sum, user) => sum + (user.total_sessions || 0), 0) || 0,
        totalDailySessions: data?.reduce((sum, user) => sum + (user.daily_sessions || 0), 0) || 0,
        totalMonthlySessions: data?.reduce((sum, user) => sum + (user.monthly_sessions || 0), 0) || 0,
      };

      return res.status(200).json({
        totals,
        users: data || []
      });
    }
  } catch (error) {
    console.error('Error fetching ChatKit usage:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
