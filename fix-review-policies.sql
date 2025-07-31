-- Run this script to fix the review posting issues
-- This can be run safely even if tables already exist

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert barbers" ON barbers;
DROP POLICY IF EXISTS "Users can update barber stats" ON barbers;
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Create more permissive policies for barbers table
CREATE POLICY "Anyone can insert barbers" ON barbers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update barber stats" ON barbers
    FOR UPDATE USING (true);

-- Create more permissive policies for reviews table
CREATE POLICY "Anyone can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Update policies for user-specific actions (using proper JWT claims)
CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
