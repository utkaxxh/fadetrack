# Professional Photo Upload Setup

This implementation adds real photo upload functionality to the professional portfolio using Supabase Storage.

## Features Added

1. **Real Image Upload**: Professionals can now upload actual image files (not just URLs)
2. **File Validation**: Validates file type (JPEG, PNG, WebP, GIF) and size (max 5MB)
3. **Upload Progress**: Shows progress bar during upload
4. **Supabase Storage**: Images are stored in Supabase Storage bucket
5. **Error Handling**: Proper error messages for failed uploads
6. **Image Preview**: Shows actual images in portfolio grid

## Setup Instructions

### 1. Initialize Storage Bucket

The storage bucket will be automatically created when the first image is uploaded. If you want to set it up manually:

```bash
# Call the setup API endpoint
curl -X POST http://localhost:3000/api/setupStorage
```

### 2. Storage Bucket Configuration

The system creates a bucket named `portfolio-images` with these settings:
- **Public access**: Yes (for displaying images)
- **File size limit**: 5MB
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Folder structure**: `portfolio/filename.ext`

### 3. Environment Variables

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Schema

The portfolio table uses these fields:
- `professional_email` (VARCHAR) - Links to professional profile
- `image_url` (TEXT) - Full URL to uploaded image
- `description` (TEXT) - Image caption/description
- `service_type` (VARCHAR) - Type of service shown
- `created_at` (TIMESTAMP) - Upload timestamp

## API Endpoints

### Upload Image: `POST /api/uploadImage`
- Accepts multipart form data with `file` field
- Optional `folder` field for organization
- Returns `{ success: true, url: "...", path: "..." }`

### Portfolio Management: `/api/portfolio`
- `GET ?professionalEmail=email` - Fetch portfolio items
- `POST` - Create new portfolio item
- `PUT` - Update portfolio item
- `DELETE ?id=itemId` - Delete portfolio item

## File Structure

```
src/
├── utils/
│   └── supabaseStorage.ts     # Storage utilities
├── pages/api/
│   ├── uploadImage.ts         # File upload handler
│   ├── setupStorage.ts        # Bucket initialization
│   └── portfolio.ts           # Portfolio CRUD operations
└── components/
    ├── PortfolioModal.tsx     # Upload form with progress
    └── ProfessionalDashboard.tsx # Portfolio display
```

## Usage Flow

1. Professional clicks "Upload Photos" button
2. Selects file or pastes URL in modal
3. File is validated and uploaded to Supabase Storage
4. Progress bar shows upload status
5. Image URL is saved to database
6. Portfolio grid displays the actual image

## Security Notes

- File validation prevents malicious uploads
- 5MB size limit prevents abuse
- Service role key is used server-side only
- Public bucket allows direct image access for performance

## Troubleshooting

### Upload Fails
- Check file size (must be < 5MB)
- Verify file type (JPEG, PNG, WebP, GIF only)
- Ensure Supabase Storage is enabled
- Check service role key permissions

### Images Don't Display
- Verify bucket is public
- Check image URL format
- Test direct image URL access
- Review browser console for errors
