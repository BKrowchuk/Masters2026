# 2026
## Fundamental
- deploy in vercel and supabase
    - use supabase db for picks, leaderboard, groups etc. 
- login as guest? or read only for once picks are in? 
- form is just for entering picks, then they can edit how? 

## Priorities
- picks done in app
- leaderboard auto updated every hour (historical leaderboards per day?). (admin side theres a button to click then there is a preview before clicking confirm which updates the real data)
- show leaderboard last updated at: time
- css fix bugs - nav bar, sizing, resizing, etc.


## TODO
- make the desktop nav bar nicer
- auto pull table data from pga tour website on job? and manually add a button to do it or something I can hide for myself? 
- formatting the same way the short masters leaderboard does (red lines) - also make the main lines white and red and green as well

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
