import { GolferScore, PoolMember } from '../types';

/** Get the best 8 players who made the cut, sorted by total score */
export function getBestEightPlayers(picks: GolferScore[]): GolferScore[] {
  return picks
    .filter(golfer => golfer.madeCut)
    .sort((a, b) => {
      if (a.total === 'WD' && b.total === 'WD') return 0;
      if (a.total === 'WD') return 1;
      if (b.total === 'WD') return -1;
      if (a.total === null && b.total === null) return 0;
      if (a.total === null) return 1;
      if (b.total === null) return -1;
      return (a.total as number) - (b.total as number);
    })
    .slice(0, 8);
}

export function calculateBestEightTotal(picks: GolferScore[]): number {
  return getBestEightPlayers(picks)
    .reduce((sum, golfer) => {
      if (golfer.total === 'WD' || golfer.total === null) return sum;
      return sum + golfer.total;
    }, 0);
}

export function isPoolMemberCut(picks: GolferScore[]): boolean {
  const playersWhoMadeCut = picks.filter(golfer => golfer.madeCut).length;
  return playersWhoMadeCut < 8;
}

function calculateRoundPositions(
  poolMembers: { id: string; picks: GolferScore[] }[],
  roundKey: 'round1' | 'round2' | 'round3' | 'round4'
): { [key: string]: { position: number | 'CUT'; isTied: boolean } } {
  const activePoolMembers = poolMembers.filter(member => !isPoolMemberCut(member.picks));

  const roundScores = activePoolMembers.map(member => {
    const bestEight = member.picks
      .map(golfer => {
        let cumulativeScore = 0;
        if (roundKey === 'round1') {
          cumulativeScore = golfer.rounds.round1 || 0;
        } else if (roundKey === 'round2') {
          cumulativeScore = (golfer.rounds.round1 || 0) + (golfer.rounds.round2 || 0);
        } else if (roundKey === 'round3') {
          cumulativeScore = (golfer.rounds.round1 || 0) + (golfer.rounds.round2 || 0) + (golfer.rounds.round3 || 0);
        } else if (roundKey === 'round4') {
          cumulativeScore = (golfer.rounds.round1 || 0) + (golfer.rounds.round2 || 0) + (golfer.rounds.round3 || 0) + (golfer.rounds.round4 || 0);
        }
        return { golfer, cumulativeScore };
      })
      .filter(({ golfer }) => {
        if (roundKey === 'round1') return golfer.rounds.round1 !== null;
        if (roundKey === 'round2') return golfer.rounds.round2 !== null;
        if (roundKey === 'round3') return golfer.rounds.round3 !== null;
        if (roundKey === 'round4') return golfer.rounds.round4 !== null;
        return true;
      })
      .sort((a, b) => a.cumulativeScore - b.cumulativeScore)
      .slice(0, 8);

    const totalScore = bestEight.reduce((sum, { cumulativeScore }) => sum + cumulativeScore, 0);
    return { id: member.id, score: totalScore };
  });

  roundScores.sort((a, b) => a.score - b.score);

  const positions: { [key: string]: { position: number | 'CUT'; isTied: boolean } } = {};

  const scoreCounts = new Map<number, number>();
  roundScores.forEach(score => {
    scoreCounts.set(score.score, (scoreCounts.get(score.score) || 0) + 1);
  });

  let currentPosition = 1;
  let currentScore = roundScores[0]?.score;
  let skipPositions = 0;

  roundScores.forEach((score) => {
    if (score.score === currentScore) {
      positions[score.id] = { position: currentPosition, isTied: scoreCounts.get(score.score)! > 1 };
      skipPositions++;
    } else {
      currentPosition += skipPositions;
      currentScore = score.score;
      positions[score.id] = { position: currentPosition, isTied: scoreCounts.get(score.score)! > 1 };
      skipPositions = 1;
    }
  });

  poolMembers.forEach(member => {
    if (isPoolMemberCut(member.picks)) {
      positions[member.id] = { position: 'CUT', isTied: false };
    }
  });

  return positions;
}

export function computePoolStandings(
  membersData: { id: string; name: string; picks: GolferScore[] }[]
): PoolMember[] {
  const round1Positions = calculateRoundPositions(membersData, 'round1');
  const round2Positions = calculateRoundPositions(membersData, 'round2');
  const round3Positions = calculateRoundPositions(membersData, 'round3');
  const round4Positions = calculateRoundPositions(membersData, 'round4');

  // Current positions based on best 8 total
  const activeMembers = membersData.filter(m => !isPoolMemberCut(m.picks));
  const currentScores = activeMembers.map(m => ({
    id: m.id,
    score: calculateBestEightTotal(m.picks),
  }));
  currentScores.sort((a, b) => a.score - b.score);

  const currentPositions: { [key: string]: { position: number | 'CUT'; isTied: boolean } } = {};
  const scoreCounts = new Map<number, number>();
  currentScores.forEach(s => scoreCounts.set(s.score, (scoreCounts.get(s.score) || 0) + 1));

  let currentPosition = 1;
  let currentScore = currentScores[0]?.score;
  let skipPositions = 0;

  currentScores.forEach((score) => {
    if (score.score === currentScore) {
      currentPositions[score.id] = { position: currentPosition, isTied: scoreCounts.get(score.score)! > 1 };
      skipPositions++;
    } else {
      currentPosition += skipPositions;
      currentScore = score.score;
      currentPositions[score.id] = { position: currentPosition, isTied: scoreCounts.get(score.score)! > 1 };
      skipPositions = 1;
    }
  });

  membersData.forEach(m => {
    if (isPoolMemberCut(m.picks)) {
      currentPositions[m.id] = { position: 'CUT', isTied: false };
    }
  });

  return membersData.map(member => ({
    ...member,
    bestFourTotal: calculateBestEightTotal(member.picks),
    roundPositions: {
      round1: round1Positions[member.id],
      round2: round2Positions[member.id],
      round3: round3Positions[member.id],
      round4: round4Positions[member.id],
      current: currentPositions[member.id],
    },
    isCut: isPoolMemberCut(member.picks),
  }));
}
