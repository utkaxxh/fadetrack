# Quick Fix: Create User Roles Table

If you're experiencing issues with the complete setup script, run this simplified version first to create just the `user_roles` table:

## Step 1: Create User Roles Table Only

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'professional')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Anyone can read user roles" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own role" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own role" ON user_roles
    FOR UPDATE USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 2: Test the Table

After running the above SQL, test that it works:

```sql
-- Test insertion
INSERT INTO user_roles (user_email, role) VALUES ('test@example.com', 'professional');

-- Test query
SELECT * FROM user_roles WHERE user_email = 'test@example.com';

-- Clean up test data
DELETE FROM user_roles WHERE user_email = 'test@example.com';
```

## Step 3: Verify in Your App

After running this, try selecting "I'm a Professional" in your app. It should now work without the error message.

## Next Steps

Once this is working, you can run the complete setup script from `COMPLETE_DATABASE_SETUP.md` to create all the other tables for the full professional features.
