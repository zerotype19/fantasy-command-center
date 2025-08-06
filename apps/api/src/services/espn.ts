import { fetchWithRetry } from '../utils/fetchHelpers';

// ESPN position ID mapping
export const POSITIONS = {
  1: "QB", 
  2: "RB", 
  3: "WR", 
  4: "TE", 
  5: "K", 
  16: "DEF"
};

// ESPN API base URL
const ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";

// Pull full league data (settings, teams, rosters)
export async function fetchLeagueData(leagueId: string): Promise<any> {
  const url = `${ESPN_BASE_URL}/seasons/2024/segments/0/leagues/${leagueId}?view=mSettings&view=mRoster&view=mTeam`;
  
  console.log(`Fetching ESPN league data for league ${leagueId}`);
  
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  }, 1); // Retry once if failed

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ESPN league data for league ${leagueId}:`, {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500)
    });
    
    if (response.status === 401) {
      throw new Error(`League ${leagueId} is private or requires authentication. Please ensure you have access to this league.`);
    } else if (response.status === 404) {
      throw new Error(`League ${leagueId} not found. Please check the league ID.`);
    } else {
      throw new Error(`Failed to fetch ESPN league data: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log(`Successfully fetched ESPN league data for league ${leagueId}`);
  return data;
}

// Pull only one team's roster by teamId
export async function fetchTeamRoster(leagueId: string, teamId: number): Promise<any> {
  const url = `${ESPN_BASE_URL}/seasons/2024/segments/0/leagues/${leagueId}?view=mRoster&rosterForTeamId=${teamId}`;
  
  console.log(`Fetching ESPN team roster for league ${leagueId}, team ${teamId}`);
  
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  }, 1); // Retry once if failed

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ESPN team roster for league ${leagueId}, team ${teamId}:`, {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500)
    });
    
    if (response.status === 401) {
      throw new Error(`League ${leagueId} is private or requires authentication. Please ensure you have access to this league.`);
    } else if (response.status === 404) {
      throw new Error(`League ${leagueId} or team ${teamId} not found. Please check the IDs.`);
    } else {
      throw new Error(`Failed to fetch ESPN team roster: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log(`Successfully fetched ESPN team roster for league ${leagueId}, team ${teamId}`);
  return data;
}

// Extract players from ESPN roster data
export function extractPlayersFromRoster(rosterData: any): any[] {
  const players: any[] = [];
  
  if (!rosterData || !rosterData.teams || !Array.isArray(rosterData.teams)) {
    console.error('Missing expected ESPN roster structure:', rosterData);
    throw new Error('Missing expected ESPN roster structure');
  }

  for (const team of rosterData.teams) {
    if (!team.roster || !Array.isArray(team.roster.entries)) {
      console.warn(`Team ${team.id} has no roster entries`);
      continue;
    }

    for (const entry of team.roster.entries) {
      if (!entry.playerPoolEntry || !entry.playerPoolEntry.player) {
        console.warn('Invalid roster entry:', entry);
        continue;
      }

      const player = entry.playerPoolEntry.player;
      const positionId = player.defaultPositionId;
      
      players.push({
        espn_id: player.id.toString(),
        name: player.fullName || player.firstName + ' ' + player.lastName,
        position: POSITIONS[positionId as keyof typeof POSITIONS] || 'UNK',
        team: player.proTeamId ? getTeamAbbreviation(player.proTeamId) : 'FA',
        status: player.injuryStatus || 'healthy',
        bye_week: null, // TODO: Populate via schedule scraping or NFL calendar API
        roster_status: entry.status || 'active'
      });
    }
  }

  console.log(`Extracted ${players.length} players from ESPN roster data`);
  return players;
}

// Extract league settings from ESPN data
export function extractLeagueSettings(leagueData: any): any {
  if (!leagueData || !leagueData.settings) {
    console.error('Missing expected ESPN league settings structure:', leagueData);
    throw new Error('Missing expected ESPN league settings structure');
  }

  const settings = leagueData.settings;
  
  return {
    scoring_json: JSON.stringify(settings.scoringSettings || {}),
    roster_json: JSON.stringify(settings.rosterSettings || {}),
    keeper_rules_json: JSON.stringify(settings.keeperSettings || {}),
    auction_budget: settings.auctionBudget || 0,
    waiver_budget: settings.waiverBudget || 0
  };
}

// Get team abbreviation from ESPN team ID
function getTeamAbbreviation(teamId: number): string {
  const TEAM_MAP: { [key: number]: string } = {
    1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
    9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
    17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
    25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU'
  };
  
  return TEAM_MAP[teamId] || 'FA';
} 