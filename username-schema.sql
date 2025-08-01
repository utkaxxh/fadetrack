-- Username system for Fadetrack
-- Run this in your Supabase SQL Editor

-- Create usernames table
CREATE TABLE IF NOT EXISTS usernames (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_usernames_user_email ON usernames(user_email);
CREATE INDEX IF NOT EXISTS idx_usernames_username ON usernames(username);

-- Add constraints
ALTER TABLE usernames ADD CONSTRAINT username_length_check 
    CHECK (char_length(username) >= 3 AND char_length(username) <= 20);
    
ALTER TABLE usernames ADD CONSTRAINT username_format_check 
    CHECK (username ~ '^[a-zA-Z0-9_]+$');

-- Enable RLS
ALTER TABLE usernames ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usernames table
-- Allow everyone to read usernames (for uniqueness checking)
CREATE POLICY "Usernames are viewable by everyone" ON usernames
    FOR SELECT USING (true);

-- Allow users to insert their own username
CREATE POLICY "Users can insert their own username" ON usernames
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own username
CREATE POLICY "Users can update their own username" ON usernames
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_usernames_updated_at 
    BEFORE UPDATE ON usernames 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add username field to reviews table for display
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS display_username VARCHAR(50);

-- Create function to get display name (username or email prefix)
CREATE OR REPLACE FUNCTION get_display_name(email VARCHAR, username VARCHAR DEFAULT NULL)
RETURNS VARCHAR AS $$
BEGIN
    IF username IS NOT NULL AND username != '' THEN
        RETURN username;
    ELSE
        RETURN split_part(email, '@', 1);
    END IF;
END;
$$ LANGUAGE plpgsql;
