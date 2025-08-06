// Sleeper API service for fetching player data
// Documentation: https://docs.sleeper.com

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string | null;
  status: string;
  active: boolean;
  espn_id: number | null;
  
  // Player details
  age: number | null;
  years_exp: number | null;
  college: string | null;
  weight: string | null;
  height: string | null;
  number: number | null;
  birth_date: string | null;
  
  // Fantasy data
  fantasy_positions: string[] | null;
  fantasy_data_id: number | null;
  search_rank: number | null;
  
  // Injury/Status data
  injury_status: string | null;
  injury_start_date: string | null;
  injury_notes: string | null;
  injury_body_part: string | null;
  practice_participation: string | null;
  practice_description: string | null;
  
  // Team/Depth Chart
  depth_chart_position: string | null;
  depth_chart_order: number | null;
  
  // External IDs
  yahoo_id: number | null;
  rotowire_id: number | null;
  rotoworld_id: number | null;
  sportradar_id: string | null;
  stats_id: number | null;
  
  // Additional metadata
  hashtag: string | null;
  search_full_name: string | null;
  search_first_name: string | null;
  search_last_name: string | null;
  news_updated: number | null;
  
  [key: string]: any; // Allow other fields
}

export interface SleeperPlayersResponse {
  [playerId: string]: SleeperPlayer;
}

export interface TrendingPlayer {
  player_id: string;
  count: number;
}

// Fetch all NFL players from Sleeper API
export async function fetchAllPlayers(): Promise<SleeperPlayersResponse> {
  const url = `${SLEEPER_BASE_URL}/players/nfl`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
      throw new Error('Sleeper API rate limited — please try again shortly.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Sleeper player data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch player data from Sleeper');
  }
}

// Fetch trending players (adds or drops)
export async function fetchTrendingPlayers(
  type: 'add' | 'drop' = 'add',
  lookbackHours: number = 24,
  limit: number = 25
): Promise<TrendingPlayer[]> {
  const url = `${SLEEPER_BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
      throw new Error('Sleeper API rate limited — please try again shortly.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending players: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch trending players from Sleeper');
  }
}

// Filter and limit players for development
export function filterPlayersForDevelopment(players: SleeperPlayersResponse): SleeperPlayer[] {
  const validPositions = ['QB', 'RB', 'WR', 'TE'];
  const filteredPlayers: SleeperPlayer[] = [];
  
  for (const [playerId, player] of Object.entries(players)) {
    // Only include active players
    if (!player.active) continue;
    
    // Only include valid positions
    if (!validPositions.includes(player.position)) continue;
    
    // Limit to ~200 players for development
    if (filteredPlayers.length >= 200) break;
    
    filteredPlayers.push(player);
  }
  
  return filteredPlayers;
}

// Validate required fields for a player
export function validatePlayer(player: SleeperPlayer): { isValid: boolean; missingFields: string[] } {
  const requiredFields = ['full_name', 'position', 'player_id'];
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!player[field]) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// Transform Sleeper player data to our database format
export function transformSleeperPlayer(player: SleeperPlayer): any {
  return {
    sleeper_id: player.player_id,
    espn_id: player.espn_id ? player.espn_id.toString() : `SLEEPER_${player.player_id}`,
    name: player.full_name,
    position: player.position,
    team: player.team || 'FA',
    status: player.status || 'Active',
    bye_week: null, // Sleeper API doesn't provide bye week data
    
    // Player details
    age: player.age,
    years_exp: player.years_exp,
    college: player.college,
    weight: player.weight,
    height: player.height,
    jersey_number: player.number,
    
    // Fantasy data
    fantasy_positions: player.fantasy_positions ? JSON.stringify(player.fantasy_positions) : null,
    fantasy_data_id: player.fantasy_data_id,
    search_rank: player.search_rank,
    
    // Injury/Status data
    injury_status: player.injury_status,
    injury_start_date: player.injury_start_date,
    injury_notes: player.injury_notes,
    practice_participation: player.practice_participation,
    
    // Team/Depth Chart
    depth_chart_position: player.depth_chart_position,
    depth_chart_order: player.depth_chart_order,
    
    // External IDs
    yahoo_id: player.yahoo_id,
    rotowire_id: player.rotowire_id,
    rotoworld_id: player.rotoworld_id,
    sportradar_id: player.sportradar_id
  };
} 