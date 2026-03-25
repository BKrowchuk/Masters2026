# Masters Pool Leaderboard
A real-time leaderboard application for tracking Masters Tournament pool results. Built with React, TypeScript, and Material-UI.


## TODO
- make the desktop nav bar nicer

- auto pull table data from pga tour website on job? and manually add a button to do it or something I can hide for myself? 

### Saturday
- write emails

### Sunday
- formatting the same way the short masters leaderboard does (red lines) - also make the main lines white and red and green as well
- write emails

### Next Year
- history 2023 and 2024 
  - make history section alot nicer
- add filter to masters leaderboard and our leaderboard (or just a top filter for all on the navbar?)
- make small screen scrolling better(but the nav bar at the same level as the conatiner that is behind and scrolling weirdly)

## How to get Leaderboard
Prompt used for chat gpt: is there a way to extract the raw data from a website table?

### Console this works.
https://www.pgatour.com/tournaments/2025/masters-tournament/R2025014/leaderboard

```
[...document.querySelectorAll("table tr")].map(row =>
  [...row.querySelectorAll("td, th")].map(cell => cell.innerText)
)
```
### Python Maybe?
```
import requests
from bs4 import BeautifulSoup

url = "https://example.com/table"
res = requests.get(url)
soup = BeautifulSoup(res.text, "html.parser")

table = soup.find("table")
rows = table.find_all("tr")
data = [[cell.text.strip() for cell in row.find_all(["td", "th"])] for row in rows]

```

## Features

- **Real-time Leaderboard**: Track pool members' standings throughout the tournament
- **Detailed Player Stats**: View individual player scores, rounds, and positions
- **Multiple Views**:
  - Current tournament standings
  - Historical results
- **Interactive Features**:
  - Expandable/collapsible pool member details
  - Sort players by score or group
  - Condensed/expanded view options
- **Visual Indicators**:
  - Color-coded position chips (Gold, Silver, Bronze)
  - Cut status highlighting
  - Score formatting (positive/negative)

## Historical Records

### Champions
- **Most Victories**: The Goose (5 titles)
- **Back-to-Back Winners**: 
  - Za German (2017-2018)
  - The Goose (2015-2016)
- **First-Time Winners in Maiden Start**: Za German (2017)

### Notable Statistics
- **Total Tournaments**: 17 years (2007-2023)
- **Unique Winners**: 10 different champions
- **Tied Victories**: 3 occurrences
  - 2022: Luther & Murph
  - 2015: Jacko & The Goose
  - 2014: Jacko & Palumbi
- **Second Place Ties**: 3 occurrences
  - 2019: Za German & Krow
  - 2013: Luther & Rocky
  - 2008: Mr 62 & Hammy

### Champions List
1. The Goose (5 wins: 2020, 2016, 2015*, 2011, 2008)
2. Za German (2 wins: 2018, 2017)
3. Luther (2 wins: 2022*, 2021)
4. Jacko (2 wins: 2015*, 2014*)
5. Others (1 win each):
   - Palumbi (2019)
   - G.D. Leo Greco (2013)
   - Dool Time (2012)
   - Hammy (2010)
   - Mr 62 (2009)
   - Rocky (2007)

*Denotes shared victory

## Data Structure

The application uses three main data files:

1. `mastersLeaderboard.ts`: Contains the official tournament leaderboard data
2. `mockGolfers.ts`: Maps leaderboard data to pool-usable format
3. `mockData.ts`: Processes pool member picks and calculates standings

## Sorting Options

The player list within each pool member's details can be sorted in two ways:

1. **By Score**: Shows players ordered by their total tournament score
2. **By Group**: Shows players in their original selection order (1-15)

## View Modes

- **Current**: Shows the ongoing tournament standings
- **Past**: Displays historical tournament results

## Technical Details

- Built with React and TypeScript
- Uses Material-UI for components and styling
- Responsive design that works on desktop and mobile
- Real-time score updates (when connected to live data)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Deployment

### GitHub Pages
1. Update the `vite.config.ts` file to include your base URL:
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     // ... other config
   })
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deployment scripts to `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Netlify/Vercel
1. Create an account on [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. The `dist` folder will contain the production-ready files
3. Deploy these files to any static hosting service

## Data Updates

To update the tournament data:

1. Update `mastersLeaderboard.ts` with the latest scores
2. The application will automatically process and display the new data

## Contributing

Feel free to submit issues and enhancement requests!

## Search Commits
Great command `git log -S'left'`
## License

This project is licensed under the MIT License. 
