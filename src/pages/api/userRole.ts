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

      const { data: userRole, error } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_email', email)
        .single();

      // If table doesn't exist or other error, return default role
      if (error) {
        console.log('Error fetching user role (defaulting to customer):', error);
        return res.status(200).json({ role: 'customer' });
      }

      return res.status(200).json({ 
        role: userRole?.role || 'customer' // Default to customer if no role set
      });
    }

    if (req.method === 'POST') {
      // Set or update user role
      const { user_email, role } = req.body;
      console.log('userRole API: POST request received', { user_email, role });

      if (!user_email || !role) {
        console.log('userRole API: Missing user_email or role');
        return res.status(400).json({ error: 'Missing user_email or role' });
      }

      if (!['customer', 'professional'].includes(role)) {
        console.log('userRole API: Invalid role:', role);
        return res.status(400).json({ error: 'Invalid role. Must be customer or professional' });
      }

      // Try to create the table first if it doesn't exist
      try {
        await supabaseAdmin.rpc('create_user_roles_table_if_not_exists');
      } catch (error) {
        // Ignore error if function doesn't exist, we'll handle table creation differently
        console.log('userRole API: Note - create_user_roles_table_if_not_exists function not available');
      }

      console.log('userRole API: Checking for existing role');
      // Check if user already has a role
      const { data: existingRole, error: fetchError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_email', user_email)
        .single();

      console.log('userRole API: Existing role check result', { existingRole, fetchError });

      // If the table doesn't exist, we'll get an error here
      if (fetchError && (fetchError.code === 'PGRST116' || fetchError.message?.includes('relation "user_roles" does not exist'))) {
        console.log('userRole API: Table not found error');
        return res.status(500).json({ 
          error: 'User roles table not found. Please run the database setup script in your Supabase dashboard.',
          details: 'Execute the COMPLETE_DATABASE_SETUP.md instructions in your Supabase SQL Editor'
        });
      }

      if (existingRole) {
        console.log('userRole API: Updating existing role');
        // Update existing role
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .update({ role })
          .eq('user_email', user_email)
          .select()
          .single();

        if (error) {
          console.error('userRole API: Error updating user role:', error);
          return res.status(500).json({ 
            error: 'Failed to update user role',
            details: error.message 
          });
        }

        console.log('userRole API: Successfully updated role:', data);
        return res.status(200).json({ success: true, role: data.role });
      } else {
        console.log('userRole API: Creating new role record');
        // Create new role record
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .insert([{ user_email, role }])
          .select()
          .single();

        if (error) {
          console.error('userRole API: Error creating user role:', error);
          return res.status(500).json({ 
            error: 'Failed to create user role',
            details: error.message
          });
        }

        console.log('userRole API: Successfully created role:', data);
        return res.status(201).json({ success: true, role: data.role });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User role API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
