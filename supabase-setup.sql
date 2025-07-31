-- Supabase table setup for Fadetrack barber review platform

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
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barbers table
-- Allow everyone to read barbers
CREATE POLICY "Public barbers are viewable by everyone" ON barbers
    FOR SELECT USING (true);

-- Allow anyone to insert barbers (needed for review creation)
CREATE POLICY "Anyone can insert barbers" ON barbers
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update barber stats (needed for review aggregation)
CREATE POLICY "Anyone can update barber stats" ON barbers
    FOR UPDATE USING (true);

-- RLS Policies for reviews table
-- Allow everyone to read public reviews
CREATE POLICY "Public reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_public = true);

-- Allow users to see their own reviews (public or private)
CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow anyone to insert reviews (we validate user_email in the API)
CREATE POLICY "Anyone can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
