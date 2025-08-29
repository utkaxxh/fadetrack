import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const STORAGE_BUCKET = 'portfolio-images';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return res.status(500).json({ error: 'Failed to check existing buckets' });
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (bucketExists) {
      return res.status(200).json({ 
        success: true, 
        message: 'Storage bucket already exists',
        bucket: STORAGE_BUCKET 
      });
    }

    // Create bucket
    const { data: bucketData, error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return res.status(500).json({ error: 'Failed to create storage bucket', details: createError });
    }

    // Set up bucket policies for public access
    // Note: You may need to set up RLS policies in Supabase dashboard manually
    // or via SQL for fine-grained control

    return res.status(201).json({ 
      success: true, 
      message: 'Storage bucket created successfully',
      bucket: STORAGE_BUCKET,
      data: bucketData
    });

  } catch (error) {
    console.error('Storage setup error:', error);
    return res.status(500).json({ 
      error: 'Failed to setup storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
