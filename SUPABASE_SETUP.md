# Supabase Database Setup Instructions

## Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section

## Step 2: Run the SQL Script
Copy and paste the contents of `supabase-setup.sql` into the SQL Editor and run it.

Alternatively, you can run each table creation separately:

### Create Barbers Table:
```sql
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
```

### Create Reviews Table:
```sql
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
  photos TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 3: Enable Row Level Security (Optional but Recommended)
The full script includes Row Level Security policies to ensure users can only modify their own reviews.

## Step 4: Test the Setup
After running the SQL script, try posting a review from your app to verify everything works correctly.

## Troubleshooting
- If you get permission errors, make sure you're running the SQL as the project owner
- If barber_id reference fails, make sure the barbers table is created first
- Check that your Supabase client connection is properly configured
