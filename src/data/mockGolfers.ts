import { mastersLeaderboard } from './mastersLeaderboard';
import { GolferScore } from '../types';

export const mockGolfers: GolferScore[] = mastersLeaderboard.map((player, index) => ({
  id: `golfer-${index + 1}`,
  name: player.playerName,
  group: player.group || 1, // Default group since it's required by GolferScore interface
  groupPosition: player.groupPosition,
  rounds: {
    round1: player.r1 ? Number(player.r1) : null,
    round2: player.r2 ? Number(player.r2) : null,
    round3: player.r3 ? Number(player.r3) : null,
    round4: player.r4 ? Number(player.r4) : null
  },
  total: typeof player.total === 'string' ? "WD" : (typeof player.total === 'number' ? player.total : null),
  position: typeof player.total === 'string' && player.total === "WD" ? "WD" : (player.position === 'CUT' ? 'CUT' : Number(player.position.replace('T', ''))),
  madeCut: player.position !== 'CUT' && !(typeof player.total === 'string' && player.total === "WD"),
  thru: player.thru || '-',
  round: player.round || null,
  isTied: typeof player.position === 'string' && player.position.includes('T')
})); 