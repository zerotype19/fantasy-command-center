export interface NFLGame {
  game_id: string;
  week: number;
  game_date: string;
  kickoff_time?: string;
  home_team: string;
  away_team: string;
  location?: string;
  network?: string;
  game_type: string;
}

// Team name to abbreviation mapping
const TEAM_MAPPING: { [key: string]: string } = {
  'Arizona Cardinals': 'ARI',
  'Atlanta Falcons': 'ATL',
  'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF',
  'Carolina Panthers': 'CAR',
  'Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN',
  'Cleveland Browns': 'CLE',
  'Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN',
  'Detroit Lions': 'DET',
  'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU',
  'Indianapolis Colts': 'IND',
  'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC',
  'Las Vegas Raiders': 'LV',
  'Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LAR',
  'Miami Dolphins': 'MIA',
  'Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE',
  'New Orleans Saints': 'NO',
  'New York Giants': 'NYG',
  'New York Jets': 'NYJ',
  'Philadelphia Eagles': 'PHI',
  'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF',
  'Seattle Seahawks': 'SEA',
  'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN',
  'Washington Commanders': 'WAS',
  // Common variations
  'Cardinals': 'ARI',
  'Falcons': 'ATL',
  'Ravens': 'BAL',
  'Bills': 'BUF',
  'Panthers': 'CAR',
  'Bears': 'CHI',
  'Bengals': 'CIN',
  'Browns': 'CLE',
  'Cowboys': 'DAL',
  'Broncos': 'DEN',
  'Lions': 'DET',
  'Packers': 'GB',
  'Texans': 'HOU',
  'Colts': 'IND',
  'Jaguars': 'JAX',
  'Chiefs': 'KC',
  'Raiders': 'LV',
  'Chargers': 'LAC',
  'Rams': 'LAR',
  'Dolphins': 'MIA',
  'Vikings': 'MIN',
  'Patriots': 'NE',
  'Saints': 'NO',
  'Giants': 'NYG',
  'Jets': 'NYJ',
  'Eagles': 'PHI',
  'Steelers': 'PIT',
  '49ers': 'SF',
  'Seahawks': 'SEA',
  'Buccaneers': 'TB',
  'Titans': 'TEN',
  'Commanders': 'WAS'
};

export function normalizeTeamName(teamName: string): string {
  const normalized = teamName.trim();
  
  // Direct mapping
  if (TEAM_MAPPING[normalized]) {
    return TEAM_MAPPING[normalized];
  }
  
  // Try partial matches
  for (const [fullName, abbrev] of Object.entries(TEAM_MAPPING)) {
    if (fullName.toLowerCase().includes(normalized.toLowerCase()) || 
        normalized.toLowerCase().includes(fullName.toLowerCase())) {
      return abbrev;
    }
  }
  
  console.warn(`Could not normalize team name: ${teamName}`);
  return teamName; // Return original if no match found
}

export function generateGameId(gameDate: string, homeTeam: string, awayTeam: string, week?: number): string {
  // Format: YYYY-MM-DD-HOME-AWAY-WEEK (if week provided)
  if (week) {
    return `${gameDate}-${homeTeam}-${awayTeam}-W${week}`;
  }
  // Format: YYYY-MM-DD-HOME-AWAY (fallback)
  return `${gameDate}-${homeTeam}-${awayTeam}`;
}

export async function scrapeNFLSchedule(): Promise<NFLGame[]> {
  try {
    console.log('Starting NFL schedule scrape...');
    
    // Try to scrape from the NFL website
    try {
      return await scrapeNFLScheduleFromWeb();
    } catch (webError) {
      console.warn('Web scraping failed, falling back to test data:', webError);
      return getTestScheduleData();
    }
    
  } catch (error) {
    console.error('Error scraping NFL schedule:', error);
    throw new Error(`Failed to scrape NFL schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getTestScheduleData(): NFLGame[] {
  // Generate complete 18-week NFL schedule programmatically
  const testGames: NFLGame[] = [];
  
  // All 32 NFL teams
  const teams = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
    'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
    'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
  ];
  
  // Stadium locations for each team
  const stadiums: { [key: string]: string } = {
    'ARI': 'State Farm Stadium, Glendale, AZ',
    'ATL': 'Mercedes-Benz Stadium, Atlanta, GA',
    'BAL': 'M&T Bank Stadium, Baltimore, MD',
    'BUF': 'Highmark Stadium, Orchard Park, NY',
    'CAR': 'Bank of America Stadium, Charlotte, NC',
    'CHI': 'Soldier Field, Chicago, IL',
    'CIN': 'Paycor Stadium, Cincinnati, OH',
    'CLE': 'FirstEnergy Stadium, Cleveland, OH',
    'DAL': 'AT&T Stadium, Arlington, TX',
    'DEN': 'Empower Field at Mile High, Denver, CO',
    'DET': 'Ford Field, Detroit, MI',
    'GB': 'Lambeau Field, Green Bay, WI',
    'HOU': 'NRG Stadium, Houston, TX',
    'IND': 'Lucas Oil Stadium, Indianapolis, IN',
    'JAX': 'TIAA Bank Field, Jacksonville, FL',
    'KC': 'Arrowhead Stadium, Kansas City, MO',
    'LAC': 'SoFi Stadium, Inglewood, CA',
    'LAR': 'SoFi Stadium, Inglewood, CA',
    'LV': 'Allegiant Stadium, Las Vegas, NV',
    'MIA': 'Hard Rock Stadium, Miami Gardens, FL',
    'MIN': 'U.S. Bank Stadium, Minneapolis, MN',
    'NE': 'Gillette Stadium, Foxborough, MA',
    'NO': 'Caesars Superdome, New Orleans, LA',
    'NYG': 'MetLife Stadium, East Rutherford, NJ',
    'NYJ': 'MetLife Stadium, East Rutherford, NJ',
    'PHI': 'Lincoln Financial Field, Philadelphia, PA',
    'PIT': 'Acrisure Stadium, Pittsburgh, PA',
    'SF': 'Levi\'s Stadium, Santa Clara, CA',
    'SEA': 'Lumen Field, Seattle, WA',
    'TB': 'Raymond James Stadium, Tampa, FL',
    'TEN': 'Nissan Stadium, Nashville, TN',
    'WAS': 'FedExField, Landover, MD'
  };
  
  // Generate games for 18 weeks
  for (let week = 1; week <= 18; week++) {
    const weekGames = generateWeekGames(week, teams, stadiums);
    testGames.push(...weekGames);
  }
  
  console.log(`Generated ${testGames.length} complete NFL season games across 18 weeks`);
  return testGames;
}

function generateWeekGames(week: number, teams: string[], stadiums: { [key: string]: string }): NFLGame[] {
  const games: NFLGame[] = [];
  
  // Calculate base date for the season (first Thursday in September)
  const baseDate = new Date('2025-09-04'); // Thursday of Week 1
  const weekStartDate = new Date(baseDate);
  weekStartDate.setDate(baseDate.getDate() + (week - 1) * 7);
  
  // Generate exactly 16 games per week (32 teams / 2 = 16 games)
  // Use a simple, deterministic approach that ensures unique matchups
  const teamsCopy = [...teams];
  
  // Create matchups based on week number to ensure variety
  for (let i = 0; i < 16; i++) {
    // Use week number to create different matchups each week
    const awayIndex = (i + week) % 32;
    const homeIndex = (i + week + 16) % 32;
    
    const awayTeam = teamsCopy[awayIndex];
    const homeTeam = teamsCopy[homeIndex];
    
    if (!awayTeam || !homeTeam) {
      console.error(`Could not find teams for game ${i} in week ${week}`);
      continue;
    }
    
    // Calculate game date based on position in week
    const gameDate = new Date(weekStartDate);
    if (i === 0 && week === 1) {
      // Thursday Night Football for Week 1
      gameDate.setDate(weekStartDate.getDate() - 1); // Wednesday
    } else if (i === 15) {
      // Monday Night Football
      gameDate.setDate(weekStartDate.getDate() + 3); // Monday
    } else {
      // Sunday games
      gameDate.setDate(weekStartDate.getDate() + 2); // Sunday
    }
    
    // Determine kickoff time and network
    let kickoffTime: string;
    let network: string;
    
    if (i === 0 && week === 1) {
      kickoffTime = '20:20';
      network = 'NBC';
    } else if (i === 0) {
      kickoffTime = '20:15';
      network = 'Prime Video';
    } else if (i === 15) {
      kickoffTime = '20:20';
      network = 'ESPN';
    } else if (i === 14) {
      kickoffTime = '20:20';
      network = 'NBC';
    } else if (i < 8) {
      kickoffTime = '13:00';
      network = i % 2 === 0 ? 'CBS' : 'FOX';
    } else {
      kickoffTime = i < 12 ? '16:05' : '16:25';
      network = i % 2 === 0 ? 'CBS' : 'FOX';
    }
    
    const gameDateStr = gameDate.toISOString().split('T')[0];
    
    games.push({
      game_id: generateGameId(gameDateStr, homeTeam, awayTeam, week),
      week,
      game_date: gameDateStr,
      kickoff_time: kickoffTime,
      home_team: homeTeam,
      away_team: awayTeam,
      location: stadiums[homeTeam],
      network,
      game_type: 'Regular'
    });
  }
  
  return games;
}

// Actual web scraping implementation
export async function scrapeNFLScheduleFromWeb(): Promise<NFLGame[]> {
  try {
    console.log('Attempting to scrape NFL schedule from web...');
    
    // The NFL website URL
    const url = 'https://operations.nfl.com/gameday/nfl-schedule/2025-nfl-schedule/';
    
    // Make the request
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Fantasy-Command-Center/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Successfully fetched NFL schedule page (${html.length} characters)`);
    
    // Parse the HTML to extract game data
    const games = parseNFLScheduleHTML(html);
    
    if (games.length === 0) {
      throw new Error('No games found in the scraped HTML');
    }
    
    console.log(`Successfully parsed ${games.length} games from NFL website`);
    return games;
    
  } catch (error) {
    console.error('Web scraping failed:', error);
    throw new Error(`Failed to scrape NFL website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseNFLScheduleHTML(html: string): NFLGame[] {
  const games: NFLGame[] = [];
  
  try {
    // This is a simplified parser - in a real implementation, you'd need to adapt
    // to the actual HTML structure of the NFL website
    
    // Look for game data patterns in the HTML
    // This is a placeholder implementation - the actual parsing would depend on the NFL site structure
    
    // Example patterns to look for:
    // - Game containers with team names
    // - Date/time information
    // - Network information
    // - Stadium/location data
    
    console.log('Parsing HTML for game data...');
    
    // For now, return empty array to trigger fallback to test data
    // In a real implementation, you would:
    // 1. Use regex or DOM parsing to extract game data
    // 2. Parse team names and normalize them
    // 3. Extract dates, times, networks, locations
    // 4. Generate game IDs
    // 5. Return structured game objects
    
    console.log('HTML parsing not yet implemented - using fallback data');
    return [];
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}
