import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!callerProfile?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { nickname, password } = req.body as { nickname: string; password?: string };
  if (!nickname) {
    return res.status(400).json({ error: 'nickname is required' });
  }

  const tempPassword = password || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const email = `${nickname.toLowerCase().replace(/\s+/g, '_')}@masterspool.app`;

  const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { nickname, must_change_password: true },
  });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  // The DB trigger handle_new_auth_user auto-creates the profile row.
  // Wait briefly and verify it was created.
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (!profile) {
    return res.status(500).json({ error: 'Profile was not created by trigger' });
  }

  return res.status(200).json({ success: true, userId: data.user.id, tempPassword });
}
