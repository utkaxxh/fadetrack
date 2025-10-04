import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Portfolio API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { professionalEmail } = req.query;

  if (!professionalEmail) {
    return res.status(400).json({ error: 'Professional email is required' });
  }

  const { data: portfolio, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('professional_email', professionalEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio:', error);
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }

  return res.status(200).json({ portfolio });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { professionalEmail, image_url, caption, service_type } = req.body;

  if (!professionalEmail || !image_url || !caption) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch professional profile ID for legacy schemas that still require professional_id
  const { data: prof, error: profErr } = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('user_email', professionalEmail)
    .maybeSingle();

  if (profErr) {
    console.error('Error fetching professional profile:', profErr);
    return res.status(500).json({ error: 'Failed to create portfolio item', details: profErr.message });
  }

  if (!prof) {
    return res.status(400).json({ error: 'Failed to create portfolio item', details: 'Professional profile not found for email' });
  }

  // Attempt insert including professional_id (for legacy schemas). If that column doesn't exist, fallback without it.
  const insertWithId = {
    professional_email: professionalEmail,
    professional_id: prof.id,
    image_url,
    description: caption, // DB field is 'description'
    service_type: service_type || 'general'
  } as Record<string, unknown>;

  let portfolioItem: unknown | null = null;
  let error: unknown | null = null;

  try {
    const result = await supabase
      .from('portfolio')
      .insert([insertWithId])
      .select()
      .single();
    portfolioItem = result.data;
    error = result.error;
  } catch (e) {
    error = e;
  }

  // If error indicates undefined column (42703) for professional_id, retry without that column
  type SupaErr = { message: string; code?: string; hint?: string };
  if (error && (error as SupaErr).code === '42703') {
    const { data: dataNoId, error: errNoId } = await supabase
      .from('portfolio')
      .insert([{
        professional_email: professionalEmail,
        image_url,
        description: caption,
        service_type: service_type || 'general'
      }])
      .select()
      .single();
    portfolioItem = dataNoId;
    error = errNoId;
  }

  if (error) {
    console.error('Error creating portfolio item:', error);
    const err = error as SupaErr;
    return res.status(500).json({ 
      error: 'Failed to create portfolio item',
      details: err.message,
      code: err.code,
      hint: err.hint
    });
  }

  return res.status(201).json({ portfolioItem });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, caption, service_type } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Portfolio item ID is required' });
  }

  const updates: Record<string, unknown> = {};
  if (caption !== undefined) updates.description = caption; // DB field is 'description'
  if (service_type !== undefined) updates.service_type = service_type;

  const { data: portfolioItem, error } = await supabase
    .from('portfolio')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating portfolio item:', error);
    return res.status(500).json({ error: 'Failed to update portfolio item' });
  }

  return res.status(200).json({ portfolioItem });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Portfolio item ID is required' });
  }

  const { error } = await supabase
    .from('portfolio')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting portfolio item:', error);
    return res.status(500).json({ error: 'Failed to delete portfolio item' });
  }

  return res.status(200).json({ message: 'Portfolio item deleted successfully' });
}
