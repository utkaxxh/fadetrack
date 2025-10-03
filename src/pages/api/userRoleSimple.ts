import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For user role operations, we MUST use service role to bypass RLS
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('userRoleSimple API: Request method:', req.method);
    console.log('userRoleSimple API: Has service key:', !!supabaseServiceKey);

    if (req.method === 'GET') {
      const { email } = req.query;
      console.log('userRoleSimple API: GET request for email:', email);

      if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_email', email)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record exists

      console.log('userRoleSimple API: GET result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('userRoleSimple API: GET error:', error);
        return res.status(500).json({ error: error.message });
      }

  return res.status(200).json({ role: data?.role || 'customer', hasRecord: !!data });
    }

    if (req.method === 'POST') {
      const { user_email, role } = req.body;
      console.log('userRoleSimple API: POST request:', { user_email, role });

      if (!user_email || !role) {
        return res.status(400).json({ error: 'Missing user_email or role' });
      }

      if (!['customer', 'professional'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // First, try to find existing record
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_email', user_email)
        .maybeSingle();

      console.log('userRoleSimple API: Existing record:', existing);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_roles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('user_email', user_email)
          .select()
          .single();

        console.log('userRoleSimple API: Update result:', { data, error });

        if (error) {
          return res.status(500).json({ error: error.message, details: error });
        }

  return res.status(200).json({ success: true, role: data.role, hasRecord: true });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('user_roles')
          .insert([{ 
            user_email, 
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        console.log('userRoleSimple API: Insert result:', { data, error });

        if (error) {
          return res.status(500).json({ error: error.message, details: error });
        }

  return res.status(201).json({ success: true, role: data.role, hasRecord: true });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('userRoleSimple API: Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
