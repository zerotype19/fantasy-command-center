// Sleeper API service for fetching player data
// Documentation: https://docs.sleeper.com

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  status: string;
  bye: number;
  active: boolean;
  [key: string]: any; // Allow other fields
}

export interface SleeperPlayersResponse {
  [playerId: string]: SleeperPlayer;
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
    espn_id: `SLEEPER_${player.player_id}`, // Provide a default ESPN ID for Sleeper players
    name: player.full_name,
    position: player.position,
    team: player.team || 'FA', // Use 'FA' (Free Agent) if no team
    status: player.status || 'Active',
    bye_week: player.bye || null
  };
} 