import { fetchJson, espnRateLimiter } from '../utils/fetchHelpers';

export interface ESPNLeagueData {
  id: string;
  name: string;
  teams: ESPNTeam[];
  settings: any;
}

export interface ESPNTeam {
  id: string;
  name: string;
  players: ESPNPlayer[];
}

export interface ESPNPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  status?: string;
  byeWeek?: number;
}

export class ESPNService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getLeagueData(
    leagueId: string,
    season: number,
    teamId?: number
  ): Promise<ESPNLeagueData> {
    if (!espnRateLimiter()) {
      throw new Error('ESPN API rate limit exceeded. Please try again later.');
    }

    const url = `${this.baseUrl}/seasons/${season}/segments/0/leagues/${leagueId}?view=mRoster`;
    
    try {
      const data = await fetchJson<any>(url);
      
      if (!data || !data.teams) {
        throw new Error('Invalid league data received from ESPN');
      }

      return {
        id: data.id || leagueId,
        name: data.settings?.name || 'Unknown League',
        teams: data.teams.map((team: any) => ({
          id: team.id,
          name: team.name || `Team ${team.id}`,
          players: this.extractPlayersFromTeam(team)
        })),
        settings: data.settings
      };
    } catch (error) {
      console.error('ESPN API error:', error);
      throw new Error(`Failed to fetch league data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractPlayersFromTeam(team: any): ESPNPlayer[] {
    const players: ESPNPlayer[] = [];
    
    if (!team.roster || !Array.isArray(team.roster.entries)) {
      return players;
    }

    for (const entry of team.roster.entries) {
      if (entry.playerPoolEntry && entry.playerPoolEntry.player) {
        const player = entry.playerPoolEntry.player;
        
        players.push({
          id: player.id.toString(),
          name: player.fullName || `${player.firstName} ${player.lastName}`,
          position: player.defaultPositionId || 'UNKNOWN',
          team: player.proTeamId ? this.getTeamName(player.proTeamId) : 'FA',
          status: player.injuryStatus || undefined,
          byeWeek: player.byeWeek || undefined
        });
      }
    }

    return players;
  }

  private getTeamName(teamId: number): string {
    const teamMap: { [key: number]: string } = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE',
      6: 'DAL', 7: 'DEN', 8: 'DET', 9: 'GB', 10: 'TEN',
      11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA',
      16: 'MIN', 17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ',
      21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC', 25: 'SF',
      26: 'SEA', 27: 'TB', 28: 'WAS', 29: 'CAR', 30: 'JAX',
      33: 'BAL', 34: 'HOU'
    };
    
    return teamMap[teamId] || 'UNKNOWN';
  }

  async getAllPlayersFromLeague(leagueId: string, season: number): Promise<ESPNPlayer[]> {
    const leagueData = await this.getLeagueData(leagueId, season);
    const allPlayers: ESPNPlayer[] = [];
    
    for (const team of leagueData.teams) {
      allPlayers.push(...team.players);
    }
    
    // Remove duplicates based on player ID
    const uniquePlayers = new Map<string, ESPNPlayer>();
    for (const player of allPlayers) {
      uniquePlayers.set(player.id, player);
    }
    
    return Array.from(uniquePlayers.values());
  }
} 