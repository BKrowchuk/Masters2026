import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PlayerPayload = {
  player_name: string;
  group: number;
  position?: string;
  total?: number | null;
  thru?: string;
  today?: string | null;
  r1?: number | null;
  r2?: number | null;
  r3?: number | null;
  r4?: number | null;
  strokes?: number | null;
  status?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate via API key (shared secret for the scraper)
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.SCRAPER_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const { year, players } = req.body as { year: number; players: PlayerPayload[] };
  if (!year || !Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'year and players[] are required' });
  }

  // Calculate group positions
  const groupMap = new Map<number, PlayerPayload[]>();
  for (const p of players) {
    if (!groupMap.has(p.group)) groupMap.set(p.group, []);
    groupMap.get(p.group)!.push(p);
  }

  const groupPositions = new Map<string, number>();
  for (const [, groupPlayers] of groupMap) {
    const sorted = [...groupPlayers].sort((a, b) => {
      if (a.total == null && b.total == null) return 0;
      if (a.total == null) return 1;
      if (b.total == null) return -1;
      return a.total - b.total;
    });
    sorted.forEach((p, i) => {
      groupPositions.set(p.player_name, i + 1);
    });
  }

  // Upsert all players
  const rows = players.map((p) => ({
    year,
    player_name: p.player_name,
    group: p.group,
    group_position: groupPositions.get(p.player_name) ?? null,
    position: p.position ?? null,
    total: p.total ?? null,
    thru: p.thru ?? '-',
    today: p.today ?? null,
    r1: p.r1 ?? null,
    r2: p.r2 ?? null,
    r3: p.r3 ?? null,
    r4: p.r4 ?? null,
    strokes: p.strokes ?? null,
    status: p.status ?? 'active',
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from('tournament_players')
    .upsert(rows, { onConflict: 'year,player_name' });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, count: rows.length });
}
