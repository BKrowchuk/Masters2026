import consoleData from './ConsoleData.json';
import golfers from './golfers.json';

export interface MastersPlayer {
  position: string;
  playerName: string;
  total: number | null | 'WD';
  thru: string;
  round?: string | null;
  r1: number | null;
  r2: number | null;
  r3: number | null;
  r4: number | null;
  strokes: number | null;
  proj: number | null;
  starting: number | null;
  oddsToWin: string;
  group?: number;
  groupPosition?: number;
}

// Function to parse score string to number
function parseScore(score: string): number | null {
  if (score === "-" || score === "" || score === undefined) return null;
  if (score === "E") return 0;
  return parseInt(score.replace("+", ""), 10);
}

// Function to clean player name
function cleanPlayerName(name: string | undefined): string {
  if (!name) return '';
  // Remove newlines and extra spaces, and ensure (a) is properly formatted
  return name
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\(a\)\s*/g, ' (a)')
    .trim();
}

// Function to get player's group
function getPlayerGroup(playerName: string): number | undefined {
  const golfer = golfers.find(g => g.name === playerName);
  return golfer?.group;
}

// Function to calculate group positions for all players
export function calculateGroupPositions(leaderboard: MastersPlayer[]): MastersPlayer[] {
  // Group players by their group number
  const groups = new Map<number, MastersPlayer[]>();
  
  leaderboard.forEach(player => {
    const group = getPlayerGroup(player.playerName);
    if (group !== undefined) {
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(player);
    }
  });

  // Sort each group by total score
  groups.forEach((groupPlayers, groupNumber) => {
    const sortedGroup = [...groupPlayers].sort((a, b) => {
      if (a.total === null && b.total === null) return 0;
      if (a.total === null) return 1;
      if (b.total === null) return -1;
      if (a.total === 'WD' && b.total === 'WD') return 0;
      if (a.total === 'WD') return 1;
      if (b.total === 'WD') return -1;
      return (a.total as number) - (b.total as number);
    });

    // Log the sorted group for debugging
    // console.log(`Group ${groupNumber} Leaderboard:`, sortedGroup.map(p => ({
    //   name: p.playerName,
    //   total: p.total,
    //   position: sortedGroup.findIndex(g => g.playerName === p.playerName) + 1
    // })));

    // Assign group positions
    sortedGroup.forEach((player, index) => {
      player.groupPosition = index + 1;
    });
  });

  return leaderboard;
}

// Function to parse the console data and populate the leaderboard
export function populateLeaderboardFromConsoleData(consoleData: any[]): MastersPlayer[] {
  const leaderboard: MastersPlayer[] = [];
  
  // Find the first non-empty row that starts with "POS" to get the header
  const headerRow = consoleData.find(row => row.length > 0 && row[0] === "POS");
  if (!headerRow) return leaderboard;
  
  const headerIndex = consoleData.indexOf(headerRow);
  
  // Process rows after the header
  for (let i = headerIndex + 1; i < consoleData.length; i++) {
    const row = consoleData[i];
    
    // Skip empty rows and headers
    if (row.length === 0 || row[0] === "POS") continue;
    
    // Skip rows that are just empty strings or don't have enough data
    if (row.length === 1 && row[0] === "") continue;
    if (!row[2]) continue; // Skip if player name is missing
    
    const playerName = cleanPlayerName(row[2]);
    const group = getPlayerGroup(playerName);
    
    const player: MastersPlayer = {
      position: row[0] || '',
      playerName,
      total: parseScore(row[3]),
      thru: row[4] || '',
      round: row[5] || '',
      r1: parseScore(row[6]),
      r2: parseScore(row[7]),
      r3: parseScore(row[8]),
      r4: parseScore(row[9]),
      strokes: parseScore(row[10]),
      proj: parseScore(row[11]),
      starting: parseScore(row[12]),
      oddsToWin: row[14] || '',
      group,
      groupPosition: undefined
    };
    
    leaderboard.push(player);
  }
  
  return leaderboard;
}

// Initialize the leaderboard with the console data
const initialLeaderboard = [
  ...populateLeaderboardFromConsoleData(consoleData),
  {
    position: "WD",
    playerName: "Vijay Singh",
    total: "WD" as const,
    thru: "WD",
    round: "WD",
    r1: null,
    r2: null,
    r3: null,
    r4: null,
    strokes: null,
    proj: null,
    starting: null,
    oddsToWin: "WD",
    group: 15,
    groupPosition: 2
  }
];

// Calculate group positions and export the final leaderboard
export const mastersLeaderboard: MastersPlayer[] = calculateGroupPositions(initialLeaderboard); 