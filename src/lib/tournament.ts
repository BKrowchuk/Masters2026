import { supabase } from './supabase';

export type TournamentPlayer = {
  id: string;
  year: number;
  player_name: string;
  group: number;
  group_position: number | null;
  position: string | null;
  total: number | null;
  thru: string;
  today: string | null;
  r1: number | null;
  r2: number | null;
  r3: number | null;
  r4: number | null;
  strokes: number | null;
  status: string;
  updated_at: string;
};

export type PastResultRow = {
  id: string;
  year: number;
  champion: string;
  co_champion: string | null;
  runner_up: string | null;
  co_runner_up: string | null;
  second_place: string | null;
  third_place: string | null;
  comments: string | null;
  description: string | null;
};

/** Fetch all tournament players for a given year, ordered by total score */
export async function fetchTournamentPlayers(year: number): Promise<TournamentPlayer[]> {
  const { data, error } = await supabase
    .from('tournament_players')
    .select('*')
    .eq('year', year)
    .order('total', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

/** Fetch all past results, ordered by year descending */
export async function fetchPastResults(): Promise<PastResultRow[]> {
  const { data, error } = await supabase
    .from('past_results')
    .select('*')
    .order('year', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
