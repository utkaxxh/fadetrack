-- Professional Profiles table setup for Fadetrack
-- This table stores professional user profiles (barbers, stylists, etc.)

-- Create the professional_profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  profession_type VARCHAR(50) NOT NULL CHECK (profession_type IN ('barber', 'beautician', 'stylist', 'salon')),
  bio TEXT,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  instagram VARCHAR(255),
  website VARCHAR(255),
  profile_image TEXT,
  years_experience INTEGER DEFAULT 1,
  specialties TEXT[], -- Array of specialties
  price_range VARCHAR(10), -- $, $$, $$$, $$$$
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the services table (for professional services)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the portfolio table (for professional portfolio items)
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  service_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_email ON professional_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_city ON professional_profiles(city);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profession_type ON professional_profiles(profession_type);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_is_active ON professional_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_services_professional_id ON services(professional_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional_id ON portfolio(professional_id);

-- Add trigger to update updated_at for professional_profiles
CREATE TRIGGER update_professional_profiles_updated_at 
    BEFORE UPDATE ON professional_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to update updated_at for services
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_profiles table
-- Allow everyone to read active professional profiles
CREATE POLICY "Public professional profiles are viewable by everyone" ON professional_profiles
    FOR SELECT USING (is_active = true);

-- Allow professionals to update their own profiles
CREATE POLICY "Professionals can update own profiles" ON professional_profiles
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow anyone to insert professional profiles (we validate in API)
CREATE POLICY "Anyone can insert professional profiles" ON professional_profiles
    FOR INSERT WITH CHECK (true);

-- RLS Policies for services table
-- Allow everyone to read active services
CREATE POLICY "Public services are viewable by everyone" ON services
    FOR SELECT USING (is_active = true);

-- Allow professionals to manage their own services
CREATE POLICY "Professionals can manage own services" ON services
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM professional_profiles 
            WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- Allow anyone to insert services (we validate in API)
CREATE POLICY "Anyone can insert services" ON services
    FOR INSERT WITH CHECK (true);

-- RLS Policies for portfolio table
-- Allow everyone to read portfolio items
CREATE POLICY "Public portfolio items are viewable by everyone" ON portfolio
    FOR SELECT USING (true);

-- Allow professionals to manage their own portfolio
CREATE POLICY "Professionals can manage own portfolio" ON portfolio
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM professional_profiles 
            WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- Allow anyone to insert portfolio items (we validate in API)
CREATE POLICY "Anyone can insert portfolio items" ON portfolio
    FOR INSERT WITH CHECK (true);

-- Create a function to update professional stats when reviews are added
-- This will be called from the application when a review is created for a professional
CREATE OR REPLACE FUNCTION update_professional_stats(prof_email TEXT, new_rating INTEGER)
RETURNS void AS $$
DECLARE
    current_total INTEGER;
    current_avg DECIMAL(3,2);
    new_total INTEGER;
    new_avg DECIMAL(3,2);
BEGIN
    -- Get current stats
    SELECT total_reviews, average_rating 
    INTO current_total, current_avg
    FROM professional_profiles 
    WHERE user_email = prof_email;
    
    -- Calculate new stats
    new_total := current_total + 1;
    new_avg := ((current_avg * current_total) + new_rating) / new_total;
    
    -- Update the professional profile
    UPDATE professional_profiles 
    SET 
        total_reviews = new_total,
        average_rating = new_avg,
        updated_at = NOW()
    WHERE user_email = prof_email;
END;
$$ LANGUAGE plpgsql;
