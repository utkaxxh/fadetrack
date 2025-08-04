-- Professional User System for Fadetrack
-- Run this in your Supabase SQL Editor

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
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  instagram VARCHAR(255),
  website VARCHAR(255),
  profile_image VARCHAR(500),
  years_experience INTEGER,
  specialties TEXT[], -- Array of specialties like ['haircuts', 'coloring', 'styling']
  price_range VARCHAR(50), -- e.g., '$50-$100', '$$'
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table for what professionals offer
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio table for professional work showcase
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  service_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add professional response capability to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS professional_response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response_date TIMESTAMP WITH TIME ZONE;

-- Add professional_id to reviews for easier querying
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS professional_id INTEGER REFERENCES professional_profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_email ON professional_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profession ON professional_profiles(profession_type);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_city ON professional_profiles(city);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_active ON professional_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_services_professional ON services(professional_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_professional ON portfolio(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Anyone can read user roles" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own role" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for professional_profiles
CREATE POLICY "Anyone can view active professional profiles" ON professional_profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage their own profile" ON professional_profiles
    FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can insert professional profiles" ON professional_profiles
    FOR INSERT WITH CHECK (true);

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage their own services" ON services
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM professional_profiles 
            WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Anyone can insert services" ON services
    FOR INSERT WITH CHECK (true);

-- RLS Policies for portfolio
CREATE POLICY "Anyone can view portfolio" ON portfolio
    FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their own portfolio" ON portfolio
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM professional_profiles 
            WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Anyone can insert portfolio" ON portfolio
    FOR INSERT WITH CHECK (true);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at 
    BEFORE UPDATE ON professional_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update professional ratings when reviews are added
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the professional's average rating and review count
    UPDATE professional_profiles 
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM reviews 
            WHERE professional_id = NEW.professional_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE professional_id = NEW.professional_id
        )
    WHERE id = NEW.professional_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating updates
CREATE TRIGGER update_professional_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.professional_id IS NOT NULL)
    EXECUTE FUNCTION update_professional_rating();
