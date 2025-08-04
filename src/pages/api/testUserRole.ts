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
    console.log('Test API: Starting database test');
    
    // Test 1: Check environment variables
    console.log('Test API: Environment check', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      usingServiceKey: !!supabaseServiceKey
    });

    // Test 2: Check if user_roles table exists
    console.log('Test API: Checking if user_roles table exists');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .limit(1);

    console.log('Test API: Table check result', { tables, tablesError });

    if (tablesError) {
      return res.status(500).json({ 
        error: 'Table check failed',
        details: tablesError,
        suggestion: 'Run the QUICK_USER_ROLES_FIX.md script in Supabase'
      });
    }

    // Test 3: Try to insert a test record
    console.log('Test API: Attempting test insert');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert([{ user_email: testEmail, role: 'professional' }])
      .select()
      .single();

    console.log('Test API: Insert result', { insertData, insertError });

    if (insertError) {
      return res.status(500).json({ 
        error: 'Insert test failed',
        details: insertError,
        suggestion: 'Check RLS policies and permissions'
      });
    }

    // Test 4: Try to read the test record
    console.log('Test API: Attempting test read');
    const { data: readData, error: readError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_email', testEmail)
      .single();

    console.log('Test API: Read result', { readData, readError });

    // Clean up test record
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_email', testEmail);

    if (readError) {
      return res.status(500).json({ 
        error: 'Read test failed',
        details: readError,
        suggestion: 'Check RLS policies'
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'All tests passed',
      testResults: {
        tableExists: true,
        canInsert: true,
        canRead: true,
        testRecord: readData
      }
    });

  } catch (error) {
    console.error('Test API: Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
