const FANTASY_PROS_BASE_URL = 'https://api.fantasypros.com/public/v2/json';

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

export interface FantasyProsPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  filename: string;
  headshot_url?: string;
  injury_status?: string;
  injury_type?: string;
  injury_update_date?: string;
  espn_id?: string;
  yahoo_id?: string;
  rotowire_id?: string;
  rotoworld_id?: string;
  gsis_id?: string;
}

export interface FantasyProsNews {
  id: string;
  player_id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

export interface FantasyProsInjury {
  player_id: string;
  name: string;
  position: string;
  team: string;
  injury_status: string;
  injury_type: string;
  injury_update_date: string;
  practice_report_injury_type?: string;
}

export interface FantasyProsRanking {
  player_id: string;
  name: string;
  position: string;
  team: string;
  rank: number;
  tier: number;
  position_rank: number;
  ranking_type: string;
}

export interface FantasyProsExpert {
  id: string;
  name: string;
  organization: string;
  accuracy_score?: number;
}

export interface FantasyProsPlayerPoints {
  player_id: string;
  name: string;
  position: string;
  team: string;
  week: number;
  season: number;
  points: number;
  points_ppr: number;
  points_half: number;
}

// Normalize player names for matching
export function normalizePlayerName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second
let dailyRequestCount = 0;
const MAX_DAILY_REQUESTS = 100;

// Manual reset function for daily count
export function resetFantasyProsDailyCount() {
  dailyRequestCount = 0;
  console.log('Daily FantasyPros API request count manually reset to 0');
}

async function rateLimitedRequest(url: string, apiKey: string): Promise<any> {
  // Check daily limit
  if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
    throw new Error('Daily FantasyPros API request limit exceeded (100 requests/day)');
  }
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
  dailyRequestCount++;
  
  console.log(`Making FantasyPros API request #${dailyRequestCount}/100 to: ${url}`);
  console.log(`API Key (first 8 chars): ${apiKey.substring(0, 8)}...`);
  
  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'Fantasy-Command-Center/1.0',
    },
  });
  
  console.log(`FantasyPros API response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`FantasyPros API error response: ${errorText}`);
    throw new Error(`FantasyPros API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

export async function fetchFantasyProsProjections(apiKey: string, week?: number, season?: number): Promise<FantasyProsProjection[]> {
  // Focus on the most important positions to minimize API calls
  const positions = ['QB', 'RB', 'WR', 'TE']; // Removed K, DST to save API calls
  let allProjections: FantasyProsProjection[] = [];
  
  for (const position of positions) {
    try {
      let url = `${FANTASY_PROS_BASE_URL}/nfl/${season || 2024}/projections?position=${position}`;
      if (week !== undefined) {
        url += `&week=${week}`;
      } else {
        // Use week=0 for preseason projections if no week specified
        url += `&week=0`;
      }
      console.log(`Making projections request to: ${url}`);
      const data = await rateLimitedRequest(url, apiKey);
      
      // Transform the response to match our interface
      console.log(`Raw ${position} projections response:`, JSON.stringify(data, null, 2));
      const projections = data.players?.map((item: any) => {
        // Look for fantasy points in the stats array
        const stats = Array.isArray(item.stats) ? item.stats : [];
        const fpts = stats.find((stat: any) => stat.label === 'FPTS' || stat.label === 'Fantasy Points');
        
        console.log(`Processing ${item.name}: stats=`, stats, 'fpts=', fpts);
        
        return {
          player_id: item.fpid?.toString(),
          name: item.name,
          position: item.position_id,
          team: item.team_id,
          week: week !== undefined ? week : 0,
          season: season || 2024,
          projected_points: fpts?.value || 0,
          source: 'FantasyPros',
        };
      }) || [];
      
      allProjections = allProjections.concat(projections);
      console.log(`Fetched ${projections.length} ${position} projections`);
    } catch (error) {
      console.log(`Failed to fetch ${position} projections: ${error}`);
      continue;
    }
  }
  
  return allProjections;
}

export async function fetchFantasyProsECR(apiKey: string, week?: number, season?: number): Promise<FantasyProsECR[]> {
  // Focus on the most important positions to minimize API calls
  const positions = ['QB', 'RB', 'WR', 'TE']; // Removed K, DST to save API calls
  let allECR: FantasyProsECR[] = [];
  
  for (const position of positions) {
    try {
      const params = new URLSearchParams();
      params.append('position', position);
      if (week !== undefined) {
        params.append('week', week.toString());
      }
      
      const url = `${FANTASY_PROS_BASE_URL}/nfl/${season || 2024}/consensus-rankings?${params}`;
      console.log(`Making ECR request to: ${url}`);
      const data = await rateLimitedRequest(url, apiKey);
      
      console.log(`Raw ECR response for ${position}:`, JSON.stringify(data, null, 2));
      
      // Transform the response to match our interface
      const ecrData = data.rankings?.map((item: any) => {
        console.log(`Processing ECR ${item.name}: rank=${item.rank}, tier=${item.tier}`);
        return {
          player_id: item.fpid?.toString(),
          name: item.name,
          position: item.position_id,
          team: item.team_id,
          ecr_rank: item.rank,
          tier: item.tier,
          position_rank: item.pos_rank,
          value_over_replacement: item.vor,
        };
      }) || [];
      
      allECR = allECR.concat(ecrData);
      console.log(`Fetched ${ecrData.length} ${position} ECR rankings`);
    } catch (error) {
      console.log(`Failed to fetch ${position} ECR: ${error}`);
      continue;
    }
  }
  
  return allECR;
}

export async function fetchFantasyProsAuctionValues(apiKey: string, season?: number): Promise<FantasyProsAuctionValue[]> {
  // Auction values not available in public API, return empty array
  console.log('Auction values not available in public FantasyPros API');
  return [];
}

export async function fetchFantasyProsSOS(apiKey: string, season?: number): Promise<FantasyProsSOS[]> {
  // Schedule strength not available in public API, return empty array
  console.log('Schedule strength not available in public FantasyPros API');
  return [];
}

export async function fetchFantasyProsPlayers(apiKey: string, sport: string = 'nfl'): Promise<FantasyProsPlayer[]> {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/players?external_ids=espn:yahoo:rotowire:rotoworld:nfl`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.players?.map((item: any) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    filename: item.filename,
    headshot_url: item.headshot_url,
    injury_status: item.injury_status,
    injury_type: item.injury_type,
    injury_update_date: item.injury_update_date,
    espn_id: item.espn_id,
    yahoo_id: item.yahoo_id,
    rotowire_id: item.rotowire_id,
    rotoworld_id: item.rotoworld_id,
    gsis_id: item.nfl_id,
  })) || [];
}

export async function fetchFantasyProsNews(apiKey: string, sport: string = 'nfl', limit: number = 50): Promise<FantasyProsNews[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/news?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.news?.map((item: any) => ({
    id: item.id?.toString(),
    player_id: item.player_id?.toString(),
    title: item.title,
    content: item.content,
    date: item.date,
    type: item.type,
  })) || [];
}

export async function fetchFantasyProsInjuries(apiKey: string, sport: string = 'nfl'): Promise<FantasyProsInjury[]> {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/injuries`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.injuries?.map((item: any) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    injury_status: item.injury_status,
    injury_type: item.injury_type,
    injury_update_date: item.injury_update_date,
    practice_report_injury_type: item.practice_report_injury_type,
  })) || [];
}

export async function fetchFantasyProsRankings(apiKey: string, season: number = 2024, sport: string = 'nfl'): Promise<FantasyProsRanking[]> {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/${season}/rankings`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.rankings?.map((item: any) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    rank: item.rank,
    tier: item.tier,
    position_rank: item.pos_rank,
    ranking_type: item.ranking_type,
  })) || [];
}

export async function fetchFantasyProsConsensusRankings(apiKey: string, season: number = 2024, sport: string = 'nfl'): Promise<FantasyProsRanking[]> {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/${season}/consensus-rankings`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.rankings?.map((item: any) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    rank: item.rank,
    tier: item.tier,
    position_rank: item.pos_rank,
    ranking_type: 'consensus',
  })) || [];
}

export async function fetchFantasyProsExperts(apiKey: string, season: number = 2024, sport: string = 'nfl'): Promise<FantasyProsExpert[]> {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/${season}/rankings/experts`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.experts?.map((item: any) => ({
    id: item.id?.toString(),
    name: item.name,
    organization: item.organization,
    accuracy_score: item.accuracy_score,
  })) || [];
}

export async function fetchFantasyProsPlayerPoints(apiKey: string, season: number = 2024, week?: number): Promise<FantasyProsPlayerPoints[]> {
  const params = new URLSearchParams();
  if (week) params.append('week', week.toString());
  
  const url = `${FANTASY_PROS_BASE_URL}/nfl/${season}/player-points?${params}`;
  const data = await rateLimitedRequest(url, apiKey);
  
  return data.players?.map((item: any) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    week: week || 0,
    season: season,
    points: item.points,
    points_ppr: item.points_ppr,
    points_half: item.points_half,
  })) || [];
}

// Match FantasyPros data to players using normalized names
export function matchFantasyProsToPlayers(
  fantasyProsData: any[],
  players: any[]
): { matched: any[], unmatched: any[] } {
  // Create maps for all available ID types
  const gsisIdMap = new Map();
  const espnIdMap = new Map();
  const yahooIdMap = new Map();
  const rotowireIdMap = new Map();
  const rotoworldIdMap = new Map();
  const playerNameMap = new Map();
  
  // Create maps of IDs to sleeper_id
  players.forEach(player => {
    if (player.gsis_id) {
      gsisIdMap.set(player.gsis_id.toString(), player.sleeper_id);
    }
    if (player.espn_id) {
      espnIdMap.set(player.espn_id.toString(), player.sleeper_id);
    }
    if (player.yahoo_id) {
      yahooIdMap.set(player.yahoo_id.toString(), player.sleeper_id);
    }
    if (player.rotowire_id) {
      rotowireIdMap.set(player.rotowire_id.toString(), player.sleeper_id);
    }
    if (player.rotoworld_id) {
      rotoworldIdMap.set(player.rotoworld_id.toString(), player.sleeper_id);
    }
    if (player.search_full_name) {
      const normalizedName = normalizePlayerName(player.search_full_name);
      if (normalizedName) {
        playerNameMap.set(normalizedName, player.sleeper_id);
      }
    }
  });
  
  console.log(`Created ID maps - GSIS: ${gsisIdMap.size}, ESPN: ${espnIdMap.size}, Yahoo: ${yahooIdMap.size}, Rotowire: ${rotowireIdMap.size}, Rotoworld: ${rotoworldIdMap.size}, Names: ${playerNameMap.size}`);
  console.log(`Processing ${fantasyProsData.length} FantasyPros records`);
  
  const matched = [];
  const unmatched = [];
  
  fantasyProsData.forEach((item, index) => {
    let sleeperId = null;
    let matchMethod = '';
    
    // Try ID matching first (more reliable) - in order of preference
    if (item.gsis_id && gsisIdMap.has(item.gsis_id.toString())) {
      sleeperId = gsisIdMap.get(item.gsis_id.toString());
      matchMethod = 'gsis_id';
    } else if (item.espn_id && espnIdMap.has(item.espn_id.toString())) {
      sleeperId = espnIdMap.get(item.espn_id.toString());
      matchMethod = 'espn_id';
    } else if (item.yahoo_id && yahooIdMap.has(item.yahoo_id.toString())) {
      sleeperId = yahooIdMap.get(item.yahoo_id.toString());
      matchMethod = 'yahoo_id';
    } else if (item.rotowire_id && rotowireIdMap.has(item.rotowire_id.toString())) {
      sleeperId = rotowireIdMap.get(item.rotowire_id.toString());
      matchMethod = 'rotowire_id';
    } else if (item.rotoworld_id && rotoworldIdMap.has(item.rotoworld_id.toString())) {
      sleeperId = rotoworldIdMap.get(item.rotoworld_id.toString());
      matchMethod = 'rotoworld_id';
    } else if (item.name) {
      // Fallback to name matching
      const normalizedName = normalizePlayerName(item.name);
      if (normalizedName && playerNameMap.has(normalizedName)) {
        sleeperId = playerNameMap.get(normalizedName);
        matchMethod = 'name';
      }
    }
    
    if (sleeperId) {
      matched.push({
        ...item,
        sleeper_id: sleeperId,
        match_method: matchMethod,
      });
    } else {
      unmatched.push(item);
      // Log first few unmatched items for debugging
      if (index < 5) {
        console.log(`Unmatched: "${item.name}" (GSIS: ${item.gsis_id}, ESPN: ${item.espn_id}, Yahoo: ${item.yahoo_id}, Rotowire: ${item.rotowire_id}, Rotoworld: ${item.rotoworld_id})`);
      }
    }
  });
  
  console.log(`Matched: ${matched.length}, Unmatched: ${unmatched.length}`);
  return { matched, unmatched };
}
