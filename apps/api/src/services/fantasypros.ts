import { fetchJson, fantasyProsRateLimiter } from '../utils/fetchHelpers';

export interface FantasyProsProjection {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  week: number;
  season: number;
  projectedPoints: number;
  source: string;
}

export interface FantasyProsResponse {
  projections?: FantasyProsProjection[];
  error?: string;
}

export class FantasyProsService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getProjections(week: number, season: number): Promise<FantasyProsProjection[]> {
    if (!fantasyProsRateLimiter()) {
      throw new Error('FantasyPros API rate limit exceeded. Please try again later.');
    }

    try {
      // Initial implementation - we'll refine this based on the actual API response structure
      const response = await fetchJson<FantasyProsResponse>(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.error) {
        throw new Error(`FantasyPros API error: ${response.error}`);
      }

      if (!response.projections || !Array.isArray(response.projections)) {
        console.warn('FantasyPros API returned unexpected response format');
        return [];
      }

      // Filter projections for the requested week and season
      return response.projections.filter(projection => 
        projection.week === week && projection.season === season
      );

    } catch (error) {
      console.error('FantasyPros API error:', error);
      
      // Return empty array for now - we'll implement proper error handling once we see the actual API structure
      return [];
    }
  }

  async getProjectionsForPlayer(
    playerId: string,
    week: number,
    season: number
  ): Promise<FantasyProsProjection | null> {
    const projections = await this.getProjections(week, season);
    return projections.find(p => p.playerId === playerId) || null;
  }

  async getProjectionsForPosition(
    position: string,
    week: number,
    season: number
  ): Promise<FantasyProsProjection[]> {
    const projections = await this.getProjections(week, season);
    return projections.filter(p => p.position === position);
  }

  async getTopProjections(
    position: string,
    week: number,
    season: number,
    limit: number = 20
  ): Promise<FantasyProsProjection[]> {
    const projections = await this.getProjectionsForPosition(position, week, season);
    
    // Sort by projected points descending and take top N
    return projections
      .sort((a, b) => b.projectedPoints - a.projectedPoints)
      .slice(0, limit);
  }
} 