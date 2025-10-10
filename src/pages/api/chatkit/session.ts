import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use service role to bypass RLS for usage tracking
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

// Usage limits (configurable)
const DAILY_LIMIT = 20; // Sessions per day
const MONTHLY_LIMIT = 100; // Sessions per month

// Check and update user usage
async function checkAndUpdateUsage(userEmail: string) {
  try {
    // Get or create user usage record
    let { data: usage, error } = await supabase
      .from('chatkit_usage')
      .select('*')
      .eq('user_email', userEmail)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error);
      // Allow session creation if we can't check usage (fail open)
      return { allowed: true, usage: null, message: '' };
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    if (!usage) {
      // Create new usage record
      const { data: newUsage, error: insertError } = await supabase
        .from('chatkit_usage')
        .insert({
          user_email: userEmail,
          total_sessions: 1,
          daily_sessions: 1,
          monthly_sessions: 1,
          last_session_at: new Date().toISOString(),
          last_reset_date: today,
          last_monthly_reset: today,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating usage record:', insertError);
        return { allowed: true, usage: null, message: '' };
      }

      return { 
        allowed: true, 
        usage: newUsage,
        message: '' 
      };
    }

    // Reset daily counter if it's a new day
    let dailySessions = usage.daily_sessions;
    if (usage.last_reset_date !== today) {
      dailySessions = 0;
    }

    // Reset monthly counter if it's a new month
    let monthlySessions = usage.monthly_sessions;
    const lastMonthlyReset = usage.last_monthly_reset?.slice(0, 7);
    if (lastMonthlyReset !== currentMonth) {
      monthlySessions = 0;
    }

    // Check limits
    if (dailySessions >= DAILY_LIMIT) {
      return {
        allowed: false,
        usage,
        message: `Daily limit of ${DAILY_LIMIT} sessions exceeded. Try again tomorrow.`
      };
    }

    if (monthlySessions >= MONTHLY_LIMIT) {
      return {
        allowed: false,
        usage,
        message: `Monthly limit of ${MONTHLY_LIMIT} sessions exceeded. Limit resets next month.`
      };
    }

    // Update usage
    const { error: updateError } = await supabase
      .from('chatkit_usage')
      .update({
        total_sessions: usage.total_sessions + 1,
        daily_sessions: dailySessions + 1,
        monthly_sessions: monthlySessions + 1,
        last_session_at: new Date().toISOString(),
        last_reset_date: today,
        last_monthly_reset: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', userEmail);

    if (updateError) {
      console.error('Error updating usage:', updateError);
    }

    return {
      allowed: true,
      usage: {
        ...usage,
        daily_sessions: dailySessions + 1,
        monthly_sessions: monthlySessions + 1,
      },
      message: ''
    };
  } catch (error) {
    console.error('Unexpected error in checkAndUpdateUsage:', error);
    // Fail open - allow session creation if there's an error
    return { allowed: true, usage: null, message: '' };
  }
}

// Creates a ChatKit session by calling OpenAI's API and returns the client_secret
// This client_secret is used by the ChatKit frontend to connect to the workflow
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const workflowId = process.env.OPENAI_WORKFLOW_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!workflowId) {
    return res.status(500).json({ error: 'Missing OPENAI_WORKFLOW_ID' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    // Generate a unique user identifier (you can customize this based on your auth system)
    const userId = req.body?.user || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Creating ChatKit session for user:', userId);

    // Check and update usage limits
    const usageCheck = await checkAndUpdateUsage(userId);
    if (!usageCheck.allowed) {
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        message: usageCheck.message,
        dailyLimit: DAILY_LIMIT,
        monthlyLimit: MONTHLY_LIMIT,
        usage: usageCheck.usage
      });
    }
    
    // Call OpenAI's ChatKit session API to create a new session
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: userId, // Required parameter
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChatKit session creation failed:', errorText);
      return res.status(response.status).json({ 
        error: 'Failed to create ChatKit session',
        details: errorText 
      });
    }

    const data = await response.json();
    
    // Return the client_secret that ChatKit needs
    return res.status(200).json({ client_secret: data.client_secret });
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
