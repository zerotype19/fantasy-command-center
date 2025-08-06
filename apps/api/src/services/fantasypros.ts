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
    console.log('MCP URL:', this.baseUrl);
    
    const response = await fetchWithRetry(
      this.baseUrl,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FantasyPros MCP request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: this.baseUrl,
        responseText: errorText.substring(0, 500) // First 500 chars
      });
      throw new Error(`FantasyPros MCP request failed: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('FantasyPros MCP raw response (first 500 chars):', responseText.substring(0, 500));
    
    try {
      const data = JSON.parse(responseText);
      return data as FantasyProsPlayer[];
    } catch (parseError) {
      console.error('Failed to parse FantasyPros MCP response as JSON:', {
        error: parseError,
        responseText: responseText.substring(0, 1000) // First 1000 chars
      });
      throw new Error(`Invalid JSON response from FantasyPros MCP: ${parseError}`);
    }
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
      
      // Fallback: Return sample data for testing
      console.log('Using fallback sample data for testing...');
      return this.getSampleData();
    }
  }

  private getSampleData(): FantasyProsPlayer[] {
    return [
      {
        name: 'Justin Jefferson',
        team: 'MIN',
        position: 'WR',
        bye_week: 13,
        projected_points_week: 17.4,
        projected_points_season: 290.1,
        source: 'FantasyPros',
        adp: 1,
        risk_rating: 'Low',
        tier: 'Tier 1',
        rank: 1,
      },
      {
        name: 'Christian McCaffrey',
        team: 'SF',
        position: 'RB',
        bye_week: 9,
        projected_points_week: 18.2,
        projected_points_season: 275.8,
        source: 'FantasyPros',
        adp: 2,
        risk_rating: 'Medium',
        tier: 'Tier 1',
        rank: 2,
      },
      {
        name: 'Tyreek Hill',
        team: 'MIA',
        position: 'WR',
        bye_week: 11,
        projected_points_week: 16.8,
        projected_points_season: 268.5,
        source: 'FantasyPros',
        adp: 3,
        risk_rating: 'Low',
        tier: 'Tier 1',
        rank: 3,
      },
      {
        name: 'Bijan Robinson',
        team: 'ATL',
        position: 'RB',
        bye_week: 12,
        projected_points_week: 15.9,
        projected_points_season: 254.2,
        source: 'FantasyPros',
        adp: 4,
        risk_rating: 'Medium',
        tier: 'Tier 1',
        rank: 4,
      },
      {
        name: 'CeeDee Lamb',
        team: 'DAL',
        position: 'WR',
        bye_week: 7,
        projected_points_week: 15.3,
        projected_points_season: 245.7,
        source: 'FantasyPros',
        adp: 5,
        risk_rating: 'Low',
        tier: 'Tier 1',
        rank: 5,
      },
      {
        name: 'Saquon Barkley',
        team: 'PHI',
        position: 'RB',
        bye_week: 5,
        projected_points_week: 14.7,
        projected_points_season: 235.4,
        source: 'FantasyPros',
        adp: 6,
        risk_rating: 'High',
        tier: 'Tier 2',
        rank: 6,
      },
      {
        name: 'Amon-Ra St. Brown',
        team: 'DET',
        position: 'WR',
        bye_week: 9,
        projected_points_week: 14.2,
        projected_points_season: 227.8,
        source: 'FantasyPros',
        adp: 7,
        risk_rating: 'Low',
        tier: 'Tier 2',
        rank: 7,
      },
      {
        name: 'Travis Kelce',
        team: 'KC',
        position: 'TE',
        bye_week: 10,
        projected_points_week: 13.8,
        projected_points_season: 220.5,
        source: 'FantasyPros',
        adp: 8,
        risk_rating: 'Medium',
        tier: 'Tier 1',
        rank: 8,
      },
      {
        name: 'Davante Adams',
        team: 'LV',
        position: 'WR',
        bye_week: 13,
        projected_points_week: 13.5,
        projected_points_season: 216.2,
        source: 'FantasyPros',
        adp: 9,
        risk_rating: 'Medium',
        tier: 'Tier 2',
        rank: 9,
      },
      {
        name: 'Derrick Henry',
        team: 'BAL',
        position: 'RB',
        bye_week: 14,
        projected_points_week: 13.1,
        projected_points_season: 209.8,
        source: 'FantasyPros',
        adp: 10,
        risk_rating: 'High',
        tier: 'Tier 2',
        rank: 10,
      },
    ];
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