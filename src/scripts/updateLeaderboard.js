const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function updateLeaderboard() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the PGA Tour leaderboard
    await page.goto('https://www.pgatour.com/tournaments/2025/masters-tournament/R2025014/leaderboard', {
      waitUntil: 'networkidle0'
    });

    // Execute the scraping script in the page context
    const leaderboardData = await page.evaluate(() => {
      return [...document.querySelectorAll("table tr")].map(row =>
        [...row.querySelectorAll("td, th")].map(cell => cell.innerText)
      );
    });

    // Write the data to ConsoleData.json
    const filePath = path.join(__dirname, '../data/ConsoleData.json');
    fs.writeFileSync(filePath, JSON.stringify(leaderboardData, null, 2));

    console.log('Leaderboard data has been updated successfully!');
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  } finally {
    await browser.close();
  }
}

updateLeaderboard(); 