# Structured Location Data Migration

This directory contains SQL migration scripts to add structured location columns (city, state, country, place_id) to the existing tables.

## Migration Files

### `add-structured-location-columns.sql`
Adds the following columns to existing tables:
- **reviews**: `city`, `state`, `country`, `place_id`
- **haircuts**: `city`, `state`, `country`, `place_id` 
- **professional_profiles**: `country`, `place_id` (city/state already existed)

### What Changed in the Application

1. **LocationAutocomplete Component**
   - Now returns structured `LocationData` object with parsed city/state/country
   - Includes place_id for future reference
   - TypeScript interface exported for reuse

2. **HaircutForm Component**
   - Captures structured location data alongside formatted string
   - Sends both to database on form submission

3. **ReviewForm Component**
   - Same structured data capture as HaircutForm
   - Updated to handle new location data format

4. **createReview API**
   - Accepts and stores structured location fields
   - Backwards compatible with existing location string

## Running the Migration

**Option 1: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `add-structured-location-columns.sql`
4. Run the script

**Option 2: Local psql (if you have direct database access)**
```bash
psql -h db.your-project.supabase.co -p 5432 -d postgres -U postgres -f add-structured-location-columns.sql
```

**Option 3: Supabase CLI (if configured)**
```bash
supabase db reset --linked
# Or apply specific migration
```

## Migration Features

### New Indexes
- Performance optimized queries by city, state, country
- Composite indexes for location-based searches
- Individual field indexes for filtering

### Data Migration Helper
- Included `parse_location_string()` function to migrate existing location data
- Handles "City, State, Country" format parsing
- Commented out but ready to use for data migration

### Example Migration of Existing Data
```sql
-- Uncomment these in the migration file if you have existing data to migrate
UPDATE reviews 
SET (city, state, country) = (
    SELECT city, state, country 
    FROM parse_location_string(location)
)
WHERE city IS NULL AND location IS NOT NULL;
```

## Benefits

1. **Better Filtering**: Users can now filter by specific cities, states, or countries
2. **Analytics**: Aggregate data by geographic regions  
3. **Performance**: Indexed searches instead of string matching
4. **Global Scale**: Proper handling of international locations
5. **Future Features**: Enables maps, local recommendations, regional insights

## Backwards Compatibility

- Existing `location` field preserved
- New structured fields are optional (can be empty)
- Forms now populate both formats for transition period
- APIs accept both old and new formats

## Next Steps After Migration

1. **Verify Migration**: Check that columns were added successfully
2. **Test Forms**: Submit a new haircut/review to confirm structured data is saved
3. **Update Filters**: Enhance PublicReviews to use structured location data
4. **Data Migration**: Optionally migrate existing location strings to structured format
5. **Remove Legacy**: Eventually remove dependence on single location string (future cleanup)

## Database Schema After Migration

```sql
-- reviews table additions
city VARCHAR(100)
state VARCHAR(100) 
country VARCHAR(100)
place_id VARCHAR(255)

-- haircuts table additions  
city VARCHAR(100)
state VARCHAR(100)
country VARCHAR(100)
place_id VARCHAR(255)

-- professional_profiles table additions
country VARCHAR(100)  -- city, state already existed
place_id VARCHAR(255)
```
