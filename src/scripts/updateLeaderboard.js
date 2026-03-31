require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load golfer group assignments
const golfers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/golfers.json'), 'utf-8')
);
const golferGroupMap = new Map(golfers.map(g => [g.name, g.group]));

function parseScore(score) {
  if (!score || score === '-' || score === '') return null;
  if (score === 'E') return 0;
  return parseInt(score.replace('+', ''), 10);
}

function cleanPlayerName(name) {
  if (!name) return '';
  return name
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\(a\)\s*/g, ' (a)')
    .trim();
}

function findGroup(playerName) {
  // Exact match
  if (golferGroupMap.has(playerName)) return golferGroupMap.get(playerName);
  // Try without amateur suffix
  const base = playerName.replace(/\s*\(a\)\s*/, '').trim();
  for (const [name, group] of golferGroupMap) {
    if (name.replace(/\s*\(a\)\s*/, '').trim() === base) return group;
  }
  return null;
}

async function updateLeaderboard() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.pgatour.com/tournaments/2026/masters-tournament/R2026014/leaderboard', {
      waitUntil: 'networkidle0'
    });

    const leaderboardData = await page.evaluate(() => {
      return [...document.querySelectorAll('table tr')].map(row =>
        [...row.querySelectorAll('td, th')].map(cell => cell.innerText)
      );
    });

    // Also save raw data locally as backup
    const filePath = path.join(__dirname, '../data/ConsoleData.json');
    fs.writeFileSync(filePath, JSON.stringify(leaderboardData, null, 2));
    console.log('Raw data saved to ConsoleData.json');

    // Parse into structured player data
    const headerRow = leaderboardData.find(row => row.length > 0 && row[0] === 'POS');
    if (!headerRow) {
      console.error('Could not find header row in leaderboard data');
      return;
    }

    const headerIndex = leaderboardData.indexOf(headerRow);
    const players = [];

    for (let i = headerIndex + 1; i < leaderboardData.length; i++) {
      const row = leaderboardData[i];
      if (row.length === 0 || row[0] === 'POS') continue;
      if (row.length === 1 && row[0] === '') continue;
      if (!row[2]) continue;

      const playerName = cleanPlayerName(row[2]);
      const group = findGroup(playerName);
      if (group === null) {
        console.warn(`No group found for: ${playerName} — skipping`);
        continue;
      }

      const position = row[0] || '';
      const isWD = position === 'WD' || (row[3] && row[3].toUpperCase() === 'WD');
      const isCut = position === 'CUT';

      players.push({
        player_name: playerName,
        group,
        position,
        total: isWD ? null : parseScore(row[3]),
        thru: row[4] || '-',
        today: row[5] || null,
        r1: parseScore(row[6]),
        r2: parseScore(row[7]),
        r3: parseScore(row[8]),
        r4: parseScore(row[9]),
        strokes: parseScore(row[10]),
        status: isWD ? 'wd' : isCut ? 'cut' : 'active',
      });
    }

    console.log(`Parsed ${players.length} players`);

    // Push to Supabase via API
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/update-leaderboard`
      : (process.env.API_URL || 'http://localhost:3000/api/update-leaderboard');
    const apiKey = process.env.SCRAPER_API_KEY;

    if (!apiKey) {
      console.error('SCRAPER_API_KEY environment variable is required');
      console.log('Data saved locally but NOT pushed to Supabase.');
      return;
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ year: 2026, players }),
    });

    const result = await res.json();
    if (result.success) {
      console.log(`Successfully pushed ${result.count} players to Supabase`);
    } else {
      console.error('API error:', result.error);
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  } finally {
    await browser.close();
  }
}

updateLeaderboard();
