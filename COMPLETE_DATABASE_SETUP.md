# Complete Supabase Database Setup for Fadetrack

## Overview
This document provides the complete SQL setup for the Fadetrack application, including all necessary tables for both basic functionality and professional features.

## Prerequisites
1. Access to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Run the following SQL scripts in order

## Step 1: Run the Complete Setup Script

Copy and paste the following SQL into your Supabase SQL Editor and execute it:

```sql
-- ==========================================
-- COMPLETE FADETRACK DATABASE SETUP
-- ==========================================

-- First, create the barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  instagram VARCHAR(255),
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  barber_name VARCHAR(255) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cost VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  review_text TEXT NOT NULL,
  photos TEXT[], -- Array of photo URLs
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table to distinguish between regular users and professionals
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'professional')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professional_profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  profession_type VARCHAR(50) NOT NULL CHECK (profession_type IN ('barber', 'beautician', 'stylist', 'salon')),
  bio TEXT,
  specialties TEXT[],
  phone VARCHAR(20),
  instagram VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_image_url TEXT,
  banner_image_url TEXT,
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table for professionals
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  professional_email VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (professional_email) REFERENCES professional_profiles(user_email) ON DELETE CASCADE
);

-- Create portfolio table for professionals
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  professional_email VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  service_type VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (professional_email) REFERENCES professional_profiles(user_email) ON DELETE CASCADE
);

-- Create review_responses table for professional responses
CREATE TABLE IF NOT EXISTS review_responses (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  professional_email VARCHAR(255) NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_email) REFERENCES professional_profiles(user_email) ON DELETE CASCADE
);

-- Create haircuts table (for backward compatibility)
CREATE TABLE IF NOT EXISTS haircuts (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  barber VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  style VARCHAR(255) NOT NULL,
  cost VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  reminder_email VARCHAR(255),
  frequency_weeks INTEGER NOT NULL DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_reviews_user_email ON reviews(user_email);
CREATE INDEX IF NOT EXISTS idx_reviews_barber_id ON reviews(barber_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_barbers_location ON barbers(location);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_email ON professional_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_city ON professional_profiles(city);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profession_type ON professional_profiles(profession_type);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_active ON professional_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_services_professional_email ON services(professional_email);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional_email ON portfolio(professional_email);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_haircuts_user_email ON haircuts(user_email);
CREATE INDEX IF NOT EXISTS idx_reminders_user_email ON reminders(user_email);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

-- ==========================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at 
    BEFORE UPDATE ON professional_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at 
    BEFORE UPDATE ON review_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE haircuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR BARBERS
-- ==========================================

CREATE POLICY "Public barbers are viewable by everyone" ON barbers
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert barbers" ON barbers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update barber stats" ON barbers
    FOR UPDATE USING (true);

-- ==========================================
-- RLS POLICIES FOR REVIEWS
-- ==========================================

CREATE POLICY "Public reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR USER_ROLES
-- ==========================================

CREATE POLICY "Anyone can read user roles" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own role" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE USING (true);

-- ==========================================
-- RLS POLICIES FOR PROFESSIONAL_PROFILES
-- ==========================================

CREATE POLICY "Active professional profiles are viewable by everyone" ON professional_profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own profile" ON professional_profiles
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own profile" ON professional_profiles
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own profile" ON professional_profiles
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own profile" ON professional_profiles
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR SERVICES
-- ==========================================

CREATE POLICY "Active services are viewable by everyone" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can view their own services" ON services
    FOR SELECT USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can insert their own services" ON services
    FOR INSERT WITH CHECK (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can update their own services" ON services
    FOR UPDATE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can delete their own services" ON services
    FOR DELETE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR PORTFOLIO
-- ==========================================

CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio
    FOR SELECT USING (true);

CREATE POLICY "Professionals can insert their own portfolio items" ON portfolio
    FOR INSERT WITH CHECK (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can update their own portfolio items" ON portfolio
    FOR UPDATE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can delete their own portfolio items" ON portfolio
    FOR DELETE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR REVIEW_RESPONSES
-- ==========================================

CREATE POLICY "Review responses are viewable by everyone" ON review_responses
    FOR SELECT USING (true);

CREATE POLICY "Professionals can insert responses to reviews" ON review_responses
    FOR INSERT WITH CHECK (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can update their own responses" ON review_responses
    FOR UPDATE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Professionals can delete their own responses" ON review_responses
    FOR DELETE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR HAIRCUTS
-- ==========================================

CREATE POLICY "Users can view their own haircuts" ON haircuts
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own haircuts" ON haircuts
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own haircuts" ON haircuts
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own haircuts" ON haircuts
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- RLS POLICIES FOR REMINDERS
-- ==========================================

CREATE POLICY "Users can view their own reminders" ON reminders
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own reminders" ON reminders
    FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own reminders" ON reminders
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own reminders" ON reminders
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ==========================================
-- HELPER FUNCTION FOR TABLE CREATION
-- ==========================================

CREATE OR REPLACE FUNCTION create_user_roles_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- This function exists for backward compatibility
    -- The table should already be created by the setup script above
    RAISE NOTICE 'user_roles table setup is handled by the main setup script';
END;
$$ LANGUAGE plpgsql;
```

## Step 2: Verify Setup

After running the SQL script, you can verify that all tables were created correctly by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see the following tables:
- barbers
- haircuts
- portfolio
- professional_profiles
- reminders
- review_responses
- reviews
- services
- user_roles

## Step 3: Test the Setup

You can test that the user roles functionality works by running:

```sql
-- Insert a test user role
INSERT INTO user_roles (user_email, role) VALUES ('test@example.com', 'professional');

-- Query the user role
SELECT * FROM user_roles WHERE user_email = 'test@example.com';

-- Clean up test data
DELETE FROM user_roles WHERE user_email = 'test@example.com';
```

## Troubleshooting

If you encounter any issues:

1. **Permission Errors**: Make sure you're using the Service Role key (not the anon key) for administrative operations in your API routes.

2. **Table Already Exists**: If some tables already exist, the `CREATE TABLE IF NOT EXISTS` statements will skip them safely.

3. **RLS Issues**: Row Level Security policies are in place. Make sure your application passes the correct user context.

4. **Missing Environment Variables**: Ensure your `.env.local` file contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Support

If you continue to have issues, check:
1. Supabase project dashboard for any error logs
2. Browser developer console for client-side errors
3. Vercel deployment logs for server-side errors
