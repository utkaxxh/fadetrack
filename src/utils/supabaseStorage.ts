import { supabase } from '../components/supabaseClient';

export const STORAGE_BUCKET = 'portfolio-images';

// Upload image to Supabase Storage
export async function uploadImage(file: File, folder: string = ''): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { url: null, error };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return { url: null, error: error as Error };
  }
}

// Delete image from Supabase Storage
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`/${STORAGE_BUCKET}/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid image URL format');
    }
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    return { success: false, error: error as Error };
  }
}

// Check if storage bucket exists and create if needed
export async function ensureStorageBucket(): Promise<{ success: boolean; error: Error | null }> {
  try {
    // List buckets to check if our bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError };
    }

    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return { success: false, error: createError };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error with storage bucket:', error);
    return { success: false, error: error as Error };
  }
}
