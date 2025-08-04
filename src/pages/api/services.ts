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
    console.error('Services API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { professionalId } = req.query;

  if (!professionalId) {
    return res.status(400).json({ error: 'Professional ID is required' });
  }

  const { data: services, error } = await supabase
    .from('professional_services')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }

  return res.status(200).json({ services });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { professionalId, name, description, price, duration_minutes } = req.body;

  if (!professionalId || !name || !description || !price || !duration_minutes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data: service, error } = await supabase
    .from('professional_services')
    .insert([{
      professional_id: professionalId,
      name,
      description,
      price,
      duration_minutes,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ error: 'Failed to create service' });
  }

  return res.status(201).json({ service });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, description, price, duration_minutes, is_active } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Service ID is required' });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: service, error } = await supabase
    .from('professional_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ error: 'Failed to update service' });
  }

  return res.status(200).json({ service });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Service ID is required' });
  }

  const { error } = await supabase
    .from('professional_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ error: 'Failed to delete service' });
  }

  return res.status(200).json({ message: 'Service deleted successfully' });
}
