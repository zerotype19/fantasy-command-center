const FANTASY_PROS_BASE_URL = 'https://api.fantasypros.com';

export interface FantasyProsProjection {
  player_id: string;
  name: string;
  position: string;
  team: string;
  week: number;
  season: number;
  projected_points: number;
  source: string;
}

export interface FantasyProsECR {
  player_id: string;
  name: string;
  position: string;
  team: string;
  ecr_rank: number;
  tier: number;
  position_rank: number;
  value_over_replacement: number;
}

export interface FantasyProsAuctionValue {
  player_id: string;
  name: string;
  position: string;
  team: string;
  auction_value: number;
  tier: number;
}

export interface FantasyProsSOS {
  player_id: string;
  name: string;
  position: string;
  team: string;
  sos_rank: number;
}

// Normalize player names for matching
export function normalizePlayerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

async function rateLimitedRequest(url: string, apiKey: string): Promise<any> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
  
  const response = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`FantasyPros API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchFantasyProsProjections(apiKey: string, week?: number, season?: number): Promise<FantasyProsProjection[]> {
  const params = new URLSearchParams();
  if (week) params.append('week', week.toString());
  if (season) params.append('season', season.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/v2/players/nfl/projections?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.map((item: any) => ({
    player_id: item.player_id,
    name: item.name,
    position: item.position,
    team: item.team,
    week: item.week,
    season: item.season,
    projected_points: item.projected_points,
    source: 'FantasyPros',
  }));
}

export async function fetchFantasyProsECR(apiKey: string, week?: number, season?: number): Promise<FantasyProsECR[]> {
  const params = new URLSearchParams();
  if (week) params.append('week', week.toString());
  if (season) params.append('season', season.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/v2/players/nfl/ecr?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.map((item: any) => ({
    player_id: item.player_id,
    name: item.name,
    position: item.position,
    team: item.team,
    ecr_rank: item.ecr_rank,
    tier: item.tier,
    position_rank: item.position_rank,
    value_over_replacement: item.value_over_replacement,
  }));
}

export async function fetchFantasyProsAuctionValues(apiKey: string, season?: number): Promise<FantasyProsAuctionValue[]> {
  const params = new URLSearchParams();
  if (season) params.append('season', season.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/v2/players/nfl/auction-values?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.map((item: any) => ({
    player_id: item.player_id,
    name: item.name,
    position: item.position,
    team: item.team,
    auction_value: item.auction_value,
    tier: item.tier,
  }));
}

export async function fetchFantasyProsSOS(apiKey: string, season?: number): Promise<FantasyProsSOS[]> {
  const params = new URLSearchParams();
  if (season) params.append('season', season.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/v2/players/nfl/schedule-strength?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.map((item: any) => ({
    player_id: item.player_id,
    name: item.name,
    position: item.position,
    team: item.team,
    sos_rank: item.sos_rank,
  }));
}

// Match FantasyPros data to players using normalized names
export function matchFantasyProsToPlayers(
  fantasyProsData: any[],
  players: any[]
): { matched: any[], unmatched: any[] } {
  const playerNameMap = new Map();
  
  // Create a map of normalized player names to sleeper_id
  players.forEach(player => {
    if (player.search_full_name) {
      const normalizedName = normalizePlayerName(player.search_full_name);
      playerNameMap.set(normalizedName, player.sleeper_id);
    }
  });
  
  const matched = [];
  const unmatched = [];
  
  fantasyProsData.forEach(item => {
    const normalizedName = normalizePlayerName(item.name);
    const sleeperId = playerNameMap.get(normalizedName);
    
    if (sleeperId) {
      matched.push({
        ...item,
        sleeper_id: sleeperId,
      });
    } else {
      unmatched.push(item);
    }
  });
  
  return { matched, unmatched };
}
