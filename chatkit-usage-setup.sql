-- ChatKit Usage Tracking Table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chatkit_usage (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  total_sessions INTEGER DEFAULT 0,
  daily_sessions INTEGER DEFAULT 0,
  monthly_sessions INTEGER DEFAULT 0,
  last_session_at TIMESTAMP DEFAULT NOW(),
  last_reset_date DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chatkit_usage_email ON chatkit_usage(user_email);
CREATE INDEX IF NOT EXISTS idx_chatkit_usage_last_reset ON chatkit_usage(last_reset_date);

-- Enable Row Level Security (RLS)
ALTER TABLE chatkit_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage
CREATE POLICY "Users can view their own usage"
  ON chatkit_usage
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role has full access"
  ON chatkit_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to reset daily counters (optional - can be called via cron)
CREATE OR REPLACE FUNCTION reset_daily_chatkit_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chatkit_usage
  SET 
    daily_sessions = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_chatkit_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chatkit_usage
  SET 
    monthly_sessions = 0,
    last_monthly_reset = CURRENT_DATE
  WHERE last_monthly_reset < DATE_TRUNC('month', CURRENT_DATE);
END;
$$;

COMMENT ON TABLE chatkit_usage IS 'Tracks ChatKit AI search usage per user';
COMMENT ON COLUMN chatkit_usage.total_sessions IS 'Total number of ChatKit sessions created by this user (all time)';
COMMENT ON COLUMN chatkit_usage.daily_sessions IS 'Number of sessions created today';
COMMENT ON COLUMN chatkit_usage.monthly_sessions IS 'Number of sessions created this month';
COMMENT ON COLUMN chatkit_usage.last_session_at IS 'Timestamp of the last session creation';
COMMENT ON COLUMN chatkit_usage.last_reset_date IS 'Date when daily counter was last reset';
