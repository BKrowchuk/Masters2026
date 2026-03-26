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

  const { nickname, password } = req.body as { nickname: string; password: string };
  if (!nickname || !password) {
    return res.status(400).json({ error: 'nickname and password are required' });
  }

  const email = `${nickname.toLowerCase().replace(/\s+/g, '_')}@masterspool.app`;

  const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: data.user.id,
    nickname,
    is_admin: false,
  });

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  return res.status(200).json({ success: true, userId: data.user.id });
}
