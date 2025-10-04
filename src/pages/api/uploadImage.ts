import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable, { Fields, Files, File as FormidableFile } from 'formidable';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const STORAGE_BUCKET = 'portfolio-images';

// Disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

  const [fields, files]: [Fields, Files] = await form.parse(req);
  const fileField = files.file; // may be File | File[] | undefined
  const file: FormidableFile | undefined = Array.isArray(fileField) ? fileField[0] : fileField;
  const folderRaw = (fields.folder as string | string[] | undefined);
  const folder = Array.isArray(folderRaw) ? folderRaw[0] : (folderRaw || '');

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
    }

    // Generate unique filename
    const fileExt = file.originalFilename?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === STORAGE_BUCKET);
    const bucketExists = !!bucket;
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: allowedTypes
      });

      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return res.status(500).json({ error: 'Failed to create storage bucket' });
      }
    } else {
      // Ensure bucket is public if it already existed
      if (bucket?.public === false) {
        const { error: policyError } = await supabase.storage.updateBucket(STORAGE_BUCKET, { public: true });
        if (policyError) {
          console.warn('Warning: failed to set bucket public:', policyError);
        }
      }
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ 
      success: true, 
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
