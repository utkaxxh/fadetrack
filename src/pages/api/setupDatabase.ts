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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user_roles table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_roles');

    console.log('Tables check result:', { tables, tablesError });

    if (!tables || tables.length === 0) {
      // Create user_roles table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_roles (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL UNIQUE,
          role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'professional')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(user_email);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Anyone can read user roles" ON user_roles
          FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Users can insert their own role" ON user_roles
          FOR INSERT WITH CHECK (true);

        CREATE POLICY IF NOT EXISTS "Users can update their own role" ON user_roles
          FOR UPDATE USING (true);
      `;

      const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating user_roles table:', createError);
        return res.status(500).json({ 
          error: 'Failed to create user_roles table', 
          details: createError 
        });
      }

      return res.status(200).json({ 
        message: 'user_roles table created successfully' 
      });
    } else {
      return res.status(200).json({ 
        message: 'user_roles table already exists' 
      });
    }
  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      error: 'Failed to setup database', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
