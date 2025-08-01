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
      // Check if username exists or get user's current username
      const { username, email } = req.query;

      if (username) {
        // Check if username is available
        const { data: existingUser } = await supabaseAdmin
          .from('usernames')
          .select('username')
          .eq('username', username)
          .single();

        return res.status(200).json({ 
          available: !existingUser,
          exists: !!existingUser 
        });
      }

      if (email) {
        // Get user's current username
        const { data: userRecord } = await supabaseAdmin
          .from('usernames')
          .select('username')
          .eq('user_email', email)
          .single();

        return res.status(200).json({ 
          username: userRecord?.username || null 
        });
      }

      return res.status(400).json({ error: 'Missing username or email parameter' });
    }

    if (req.method === 'POST') {
      // Set or update username
      const { user_email, username } = req.body;

      if (!user_email || !username) {
        return res.status(400).json({ error: 'Missing user_email or username' });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ 
          error: 'Username can only contain letters, numbers, and underscores' 
        });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ 
          error: 'Username must be between 3 and 20 characters' 
        });
      }

      // Check if username is already taken
      const { data: existingUser } = await supabaseAdmin
        .from('usernames')
        .select('user_email')
        .eq('username', username)
        .single();

      if (existingUser && existingUser.user_email !== user_email) {
        return res.status(409).json({ error: 'Username is already taken' });
      }

      // Check if user already has a username
      const { data: currentUser } = await supabaseAdmin
        .from('usernames')
        .select('*')
        .eq('user_email', user_email)
        .single();

      if (currentUser) {
        // Update existing username
        const { data, error } = await supabaseAdmin
          .from('usernames')
          .update({ username })
          .eq('user_email', user_email)
          .select()
          .single();

        if (error) {
          console.error('Error updating username:', error);
          return res.status(500).json({ error: 'Failed to update username' });
        }

        return res.status(200).json({ success: true, username: data.username });
      } else {
        // Create new username record
        const { data, error } = await supabaseAdmin
          .from('usernames')
          .insert([{ user_email, username }])
          .select()
          .single();

        if (error) {
          console.error('Error creating username:', error);
          return res.status(500).json({ error: 'Failed to create username' });
        }

        return res.status(201).json({ success: true, username: data.username });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Username API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
