import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role for administrative operations if available, otherwise use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Prefer service role, fallback to anon key
const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Get user role
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
      }

      const { data: userRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_email', email)
        .single();

      return res.status(200).json({ 
        role: userRole?.role || 'customer' // Default to customer if no role set
      });
    }

    if (req.method === 'POST') {
      // Set or update user role
      const { user_email, role } = req.body;

      if (!user_email || !role) {
        return res.status(400).json({ error: 'Missing user_email or role' });
      }

      if (!['customer', 'professional'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be customer or professional' });
      }

      // Check if user already has a role
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_email', user_email)
        .single();

      if (existingRole) {
        // Update existing role
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .update({ role })
          .eq('user_email', user_email)
          .select()
          .single();

        if (error) {
          console.error('Error updating user role:', error);
          return res.status(500).json({ error: 'Failed to update user role' });
        }

        return res.status(200).json({ success: true, role: data.role });
      } else {
        // Create new role record
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .insert([{ user_email, role }])
          .select()
          .single();

        if (error) {
          console.error('Error creating user role:', error);
          return res.status(500).json({ error: 'Failed to create user role' });
        }

        return res.status(201).json({ success: true, role: data.role });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User role API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
