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
  const { professionalId } = req.query;

  if (!professionalId) {
    return res.status(400).json({ error: 'Professional ID is required' });
  }

  const { data: portfolio, error } = await supabase
    .from('professional_portfolio')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio:', error);
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }

  return res.status(200).json({ portfolio });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { professionalId, image_url, caption, service_type } = req.body;

  if (!professionalId || !image_url || !caption) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data: portfolioItem, error } = await supabase
    .from('professional_portfolio')
    .insert([{
      professional_id: professionalId,
      image_url,
      caption,
      service_type: service_type || 'general'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating portfolio item:', error);
    return res.status(500).json({ error: 'Failed to create portfolio item' });
  }

  return res.status(201).json({ portfolioItem });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, caption, service_type } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Portfolio item ID is required' });
  }

  const updates: Record<string, unknown> = {};
  if (caption !== undefined) updates.caption = caption;
  if (service_type !== undefined) updates.service_type = service_type;

  const { data: portfolioItem, error } = await supabase
    .from('professional_portfolio')
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
    .from('professional_portfolio')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting portfolio item:', error);
    return res.status(500).json({ error: 'Failed to delete portfolio item' });
  }

  return res.status(200).json({ message: 'Portfolio item deleted successfully' });
}
