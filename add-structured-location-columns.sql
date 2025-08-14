-- Add structured location columns to existing tables
-- Run this migration after your initial setup

-- Add structured location columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100), 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS place_id VARCHAR(255);

-- Add structured location columns to haircuts table  
ALTER TABLE haircuts
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100), 
ADD COLUMN IF NOT EXISTS place_id VARCHAR(255);

-- Add structured location columns to professional_profiles table (country field)
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS place_id VARCHAR(255);

-- Add indexes for better query performance on new location fields
CREATE INDEX IF NOT EXISTS idx_reviews_city ON reviews(city);
CREATE INDEX IF NOT EXISTS idx_reviews_state ON reviews(state);
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country);

CREATE INDEX IF NOT EXISTS idx_haircuts_city ON haircuts(city);
CREATE INDEX IF NOT EXISTS idx_haircuts_state ON haircuts(state); 
CREATE INDEX IF NOT EXISTS idx_haircuts_country ON haircuts(country);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_country ON professional_profiles(country);

-- Create a composite index for location-based searches
CREATE INDEX IF NOT EXISTS idx_reviews_location_composite ON reviews(city, state, country);
CREATE INDEX IF NOT EXISTS idx_haircuts_location_composite ON haircuts(city, state, country);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_location_composite ON professional_profiles(city, state, country);

-- Optional: Create a function to parse existing location strings into structured data
-- This is useful if you want to migrate existing data
CREATE OR REPLACE FUNCTION parse_location_string(location_str TEXT)
RETURNS TABLE(city TEXT, state TEXT, country TEXT) AS $$
BEGIN
    -- Simple parser for "City, State, Country" format
    -- You can enhance this based on your data patterns
    IF location_str IS NULL OR location_str = '' THEN
        RETURN QUERY SELECT ''::TEXT, ''::TEXT, ''::TEXT;
        RETURN;
    END IF;
    
    -- Split by comma and trim whitespace
    DECLARE
        parts TEXT[];
        parsed_city TEXT := '';
        parsed_state TEXT := '';
        parsed_country TEXT := '';
    BEGIN
        parts := string_to_array(location_str, ',');
        
        -- Extract components based on number of parts
        IF array_length(parts, 1) >= 1 THEN
            parsed_city := trim(parts[1]);
        END IF;
        
        IF array_length(parts, 1) >= 2 THEN
            parsed_state := trim(parts[2]);
        END IF;
        
        IF array_length(parts, 1) >= 3 THEN
            parsed_country := trim(parts[3]);
        END IF;
        
        RETURN QUERY SELECT parsed_city, parsed_state, parsed_country;
    END;
END;
$$ LANGUAGE plpgsql;

-- Example migration of existing data (uncomment and run if needed)
-- UPDATE reviews 
-- SET (city, state, country) = (
--     SELECT city, state, country 
--     FROM parse_location_string(location)
-- )
-- WHERE city IS NULL AND location IS NOT NULL;

-- UPDATE haircuts
-- SET (city, state, country) = (
--     SELECT city, state, country 
--     FROM parse_location_string(location) 
-- )
-- WHERE city IS NULL AND location IS NOT NULL;

-- UPDATE professional_profiles
-- SET (city, state, country) = (
--     SELECT city, state, country
--     FROM parse_location_string(city || CASE WHEN state IS NOT NULL THEN ', ' || state ELSE '' END)
-- )
-- WHERE country IS NULL AND city IS NOT NULL;
