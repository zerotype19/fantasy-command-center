import { fetchWithRetry, fetchJson, createRateLimiter } from '../utils/fetchHelpers';

// Rate limiter for FantasyPros MCP
const fantasyProsRateLimiter = createRateLimiter(10, 60000); // 10 requests per minute

export interface FantasyProsPlayer {
  name: string;
  team: string;
  position: string;
  bye_week: number;
  projected_points_week: number;
  projected_points_season: number;
  source: string;
  // Additional fields that may be available
  adp?: number;
  risk_rating?: string;
  tier?: string;
  rank?: number;
}

export class FantasyProsService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchRawMCP(): Promise<FantasyProsPlayer[]> {
    console.log('Fetching FantasyPros MCP data...');
    
    const response = await fetchWithRetry(
      this.baseUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FantasyPros MCP request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('FantasyPros MCP raw response:', JSON.stringify(data, null, 2));
    
    return data as FantasyProsPlayer[];
  }

  async getProjections(): Promise<FantasyProsPlayer[]> {
    try {
      const rawData = await this.fetchRawMCP();
      
      // Normalize the data to our expected format
      const normalizedData = rawData.map((player, index) => ({
        name: player.name || 'Unknown Player',
        team: player.team || 'FA',
        position: player.position || 'UNK',
        bye_week: player.bye_week || 0,
        projected_points_week: player.projected_points_week || 0,
        projected_points_season: player.projected_points_season || 0,
        source: 'FantasyPros',
        adp: player.adp,
        risk_rating: player.risk_rating,
        tier: player.tier,
        rank: player.rank || index + 1,
      }));

      console.log(`Normalized ${normalizedData.length} players from FantasyPros MCP`);
      return normalizedData;
    } catch (error) {
      console.error('Error fetching FantasyPros projections:', error);
      throw error;
    }
  }

  async getProjectionsForPlayer(playerName: string): Promise<FantasyProsPlayer | null> {
    const projections = await this.getProjections();
    return projections.find(p => p.name.toLowerCase() === playerName.toLowerCase()) || null;
  }

  async getProjectionsForPosition(position: string): Promise<FantasyProsPlayer[]> {
    const projections = await this.getProjections();
    return projections.filter(p => p.position.toUpperCase() === position.toUpperCase());
  }

  async getTopProjections(limit: number = 25): Promise<FantasyProsPlayer[]> {
    const projections = await this.getProjections();
    return projections
      .sort((a, b) => b.projected_points_season - a.projected_points_season)
      .slice(0, limit);
  }
} 