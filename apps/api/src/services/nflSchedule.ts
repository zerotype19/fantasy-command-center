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

export function generateGameId(gameDate: string, homeTeam: string, awayTeam: string): string {
  // Format: YYYY-MM-DD-HOME-AWAY
  return `${gameDate}-${homeTeam}-${awayTeam}`;
}

export async function scrapeNFLSchedule(): Promise<NFLGame[]> {
  try {
    console.log('Starting NFL schedule scrape...');
    
    // For now, let's create some test data for Week 1 2025
    // In a real implementation, we would scrape from the NFL website
    const testGames: NFLGame[] = [
      {
        game_id: generateGameId('2025-09-04', 'KC', 'BAL'),
        week: 1,
        game_date: '2025-09-04',
        kickoff_time: '20:20',
        home_team: 'KC',
        away_team: 'BAL',
        location: 'Arrowhead Stadium, Kansas City, MO',
        network: 'NBC',
        game_type: 'Regular'
      },
      {
        game_id: generateGameId('2025-09-07', 'CIN', 'NE'),
        week: 1,
        game_date: '2025-09-07',
        kickoff_time: '13:00',
        home_team: 'CIN',
        away_team: 'NE',
        location: 'Paycor Stadium, Cincinnati, OH',
        network: 'CBS',
        game_type: 'Regular'
      },
      {
        game_id: generateGameId('2025-09-07', 'BUF', 'ARI'),
        week: 1,
        game_date: '2025-09-07',
        kickoff_time: '13:00',
        home_team: 'BUF',
        away_team: 'ARI',
        location: 'Highmark Stadium, Orchard Park, NY',
        network: 'FOX',
        game_type: 'Regular'
      },
      {
        game_id: generateGameId('2025-09-07', 'DAL', 'CLE'),
        week: 1,
        game_date: '2025-09-07',
        kickoff_time: '16:25',
        home_team: 'DAL',
        away_team: 'CLE',
        location: 'AT&T Stadium, Arlington, TX',
        network: 'FOX',
        game_type: 'Regular'
      },
      {
        game_id: generateGameId('2025-09-07', 'SF', 'NYJ'),
        week: 1,
        game_date: '2025-09-07',
        kickoff_time: '16:25',
        home_team: 'SF',
        away_team: 'NYJ',
        location: 'Levi\'s Stadium, Santa Clara, CA',
        network: 'CBS',
        game_type: 'Regular'
      }
    ];
    
    console.log(`Scraped ${testGames.length} NFL games`);
    return testGames;
    
  } catch (error) {
    console.error('Error scraping NFL schedule:', error);
    throw new Error(`Failed to scrape NFL schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// TODO: Implement actual web scraping
export async function scrapeNFLScheduleFromWeb(): Promise<NFLGame[]> {
  // This would be the actual implementation that scrapes the NFL website
  // For now, we'll use test data
  return scrapeNFLSchedule();
}
