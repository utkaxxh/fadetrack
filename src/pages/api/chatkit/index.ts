import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This index route is a placeholder so the base url exists. The ChatKit client
  // calls `${base}/session` which we expose separately. You can add routing here
  // later for uploads or other endpoints if needed.
  return res.status(200).json({ ok: true });
}
