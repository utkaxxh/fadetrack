-- Supabase table setup for RateMyMUA makeup artist review platform

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_email ON reviews(user_email);
CREATE INDEX IF NOT EXISTS idx_reviews_barber_id ON reviews(barber_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_barbers_location ON barbers(location);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at when a review is modified
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barbers table (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'barbers' AND policyname = 'Public barbers are viewable by everyone'
    ) THEN
        CREATE POLICY "Public barbers are viewable by everyone" ON barbers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'barbers' AND policyname = 'Anyone can insert barbers'
    ) THEN
        CREATE POLICY "Anyone can insert barbers" ON barbers FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'barbers' AND policyname = 'Anyone can update barber stats'
    ) THEN
        CREATE POLICY "Anyone can update barber stats" ON barbers FOR UPDATE USING (true);
    END IF;
END$$;

-- RLS Policies for reviews table (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Public reviews are viewable by everyone'
    ) THEN
        CREATE POLICY "Public reviews are viewable by everyone" ON reviews FOR SELECT USING (is_public = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can view own reviews'
    ) THEN
        CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Anyone can insert reviews'
    ) THEN
        CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can update own reviews'
    ) THEN
        CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can delete own reviews'
    ) THEN
        CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;
END$$;

-- =============================
-- Professional Profiles (Directory)
-- =============================

-- Create professional_profiles table used for the directory and dashboards
CREATE TABLE IF NOT EXISTS professional_profiles (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    profession_type VARCHAR(50) NOT NULL, -- e.g., makeup_artist, barber, stylist, salon, beautician
    bio TEXT,
    phone VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    instagram VARCHAR(255),
    website VARCHAR(255),
    profile_image TEXT,
    years_experience INTEGER DEFAULT 1,
    specialties TEXT[] DEFAULT '{}',
    price_range VARCHAR(10),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure profession_type CHECK constraint allows current set of roles
ALTER TABLE professional_profiles
    DROP CONSTRAINT IF EXISTS professional_profiles_profession_type_check;
ALTER TABLE professional_profiles
    ADD CONSTRAINT professional_profiles_profession_type_check
    CHECK (profession_type IN ('makeup_artist','barber','beautician','stylist','salon'));

-- Indexes for professional_profiles
CREATE INDEX IF NOT EXISTS idx_prof_profiles_email ON professional_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_active ON professional_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_city ON professional_profiles(city);
CREATE INDEX IF NOT EXISTS idx_prof_profiles_profession ON professional_profiles(profession_type);

-- Trigger to auto-update updated_at on profile changes (reuses the function defined above)
DROP TRIGGER IF EXISTS update_professional_profiles_updated_at ON professional_profiles;
CREATE TRIGGER update_professional_profiles_updated_at
        BEFORE UPDATE ON professional_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS and basic policies for professional_profiles
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read active professional profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'professional_profiles' AND policyname = 'Active profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Active profiles are viewable by everyone" ON professional_profiles
            FOR SELECT USING (is_active = true);
    END IF;
END$$;

-- Users can update their own profile (when using anon key directly)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'professional_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON professional_profiles
            FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
            WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;
END$$;

-- Allow inserts into professional_profiles (API validates input)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'professional_profiles' AND policyname = 'Anyone can insert professional profiles'
    ) THEN
        CREATE POLICY "Anyone can insert professional profiles" ON professional_profiles
            FOR INSERT WITH CHECK (true);
    END IF;
END$$;

-- =============================
-- Portfolio (photos/media for professionals)
-- =============================

-- Create portfolio table used to store public media for professional profiles
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    professional_email VARCHAR(255) NOT NULL REFERENCES professional_profiles(user_email) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    service_type VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_professional_email ON portfolio(professional_email);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio(created_at);

-- Enable RLS for portfolio
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Public can read portfolio items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'portfolio' AND policyname = 'Portfolio is viewable by everyone'
    ) THEN
        CREATE POLICY "Portfolio is viewable by everyone" ON portfolio
            FOR SELECT USING (true);
    END IF;
END$$;

-- Users can manage their own portfolio items (for anon key usage)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'portfolio' AND policyname = 'Users can insert own portfolio items'
    ) THEN
        CREATE POLICY "Users can insert own portfolio items" ON portfolio
            FOR INSERT WITH CHECK (professional_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'portfolio' AND policyname = 'Users can update own portfolio items'
    ) THEN
        CREATE POLICY "Users can update own portfolio items" ON portfolio
            FOR UPDATE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email')
            WITH CHECK (professional_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'portfolio' AND policyname = 'Users can delete own portfolio items'
    ) THEN
        CREATE POLICY "Users can delete own portfolio items" ON portfolio
            FOR DELETE USING (professional_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;
END$$;
