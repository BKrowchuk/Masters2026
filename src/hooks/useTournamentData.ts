import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchTournamentPlayers, fetchPastResults, type TournamentPlayer, type PastResultRow } from '../lib/tournament';
import { computePoolStandings } from '../lib/scoring';
import type { GolferScore, PoolMember } from '../types';
import type { MastersPlayer } from '../data/mastersLeaderboard';
import type { PastResult } from '../data/pastResults';

const CURRENT_YEAR = 2026;

/** Convert a Supabase tournament_player row into the MastersPlayer shape used by the UI */
function toMastersPlayer(tp: TournamentPlayer): MastersPlayer {
  return {
    position: tp.position ?? '',
    playerName: tp.player_name,
    total: tp.status === 'wd' ? ('WD' as const) : tp.total,
    thru: tp.thru,
    round: tp.today ?? null,
    r1: tp.r1,
    r2: tp.r2,
    r3: tp.r3,
    r4: tp.r4,
    strokes: tp.strokes,
    proj: null,
    starting: null,
    oddsToWin: '',
    group: tp.group,
    groupPosition: tp.group_position ?? undefined,
  };
}

/** Convert a Supabase tournament_player row into the GolferScore shape */
function toGolferScore(tp: TournamentPlayer, index: number): GolferScore {
  const isWD = tp.status === 'wd';
  const isCut = tp.status === 'cut';
  const posStr = tp.position ?? '';

  return {
    id: tp.id,
    name: tp.player_name,
    group: tp.group,
    groupPosition: tp.group_position ?? undefined,
    rounds: {
      round1: tp.r1,
      round2: tp.r2,
      round3: tp.r3,
      round4: tp.r4,
    },
    total: isWD ? 'WD' : tp.total,
    position: isWD ? 'WD' : isCut ? 'CUT' : Number(posStr.replace('T', '')) || 0,
    madeCut: !isCut && !isWD,
    thru: tp.thru || '-',
    round: tp.today ?? null,
    isTied: posStr.startsWith('T'),
  };
}

/** Convert a Supabase past_results row into the PastResult shape */
function toPastResult(row: PastResultRow): PastResult {
  return {
    year: row.year,
    champion: row.champion,
    coChampion: row.co_champion ?? undefined,
    runnerUp: row.runner_up ?? undefined,
    coRunnerUp: row.co_runner_up ?? undefined,
    secondPlace: row.second_place ?? undefined,
    thirdPlace: row.third_place ?? undefined,
    comments: row.comments ?? undefined,
    description: row.description ?? undefined,
  };
}

export type TournamentData = {
  leaderboard: MastersPlayer[];
  poolMembers: PoolMember[];
  pastResults: PastResult[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useTournamentData(): TournamentData {
  const [leaderboard, setLeaderboard] = useState<MastersPlayer[]>([]);
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [pastResultsList, setPastResults] = useState<PastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [players, pastRows, profilesRes, picksRes] = await Promise.all([
          fetchTournamentPlayers(CURRENT_YEAR),
          fetchPastResults(),
          supabase.from('profiles').select('*').order('nickname'),
          supabase.from('picks').select('*').eq('year', CURRENT_YEAR),
        ]);

        if (cancelled) return;

        const profiles = profilesRes.data ?? [];
        const picks = picksRes.data ?? [];

        // Build golfer lookup: player_name → GolferScore
        const golferMap = new Map<string, GolferScore>();
        players.forEach((tp, i) => {
          golferMap.set(tp.player_name, toGolferScore(tp, i));
          // Also store a lowercase-trimmed key for fuzzy matching
          golferMap.set(tp.player_name.toLowerCase().trim(), toGolferScore(tp, i));
        });

        // Build a helper to find a golfer by name (with fuzzy matching)
        function findGolfer(name: string): GolferScore | undefined {
          const clean = name.trim();
          if (golferMap.has(clean)) return golferMap.get(clean);
          const lower = clean.toLowerCase();
          if (golferMap.has(lower)) return golferMap.get(lower);
          // Try without amateur suffix
          const base = lower.replace(/\s*\(a\)\s*/g, '').trim();
          for (const [key, val] of golferMap) {
            if (key.replace(/\s*\(a\)\s*/g, '').trim() === base) return val;
          }
          return undefined;
        }

        // Build pool members by combining profiles + picks + golfer scores
        const membersData = profiles.map((profile) => {
          const memberPicks = picks.find((p) => p.user_id === profile.id);
          const selections: Record<string, string> = memberPicks?.selections ?? {};

          const golferPicks: GolferScore[] = [];
          for (const [groupStr, golferName] of Object.entries(selections)) {
            const golfer = findGolfer(golferName);
            if (golfer) {
              golferPicks.push({ ...golfer, group: Number(groupStr) });
            }
          }

          return {
            id: profile.id,
            name: profile.nickname,
            picks: golferPicks,
          };
        });

        // Compute standings
        const computed = computePoolStandings(membersData);

        setLeaderboard(players.map(toMastersPlayer));
        setPoolMembers(computed);
        setPastResults(pastRows.map(toPastResult));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? 'Failed to load tournament data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return {
    leaderboard,
    poolMembers,
    pastResults: pastResultsList,
    loading,
    error,
    refresh: () => setRefreshKey(k => k + 1),
  };
}
