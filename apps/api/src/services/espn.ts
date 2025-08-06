import { fetchJson, espnRateLimiter } from '../utils/fetchHelpers';

export interface ESPNPlayer {
  espnId: string;
  name: string;
  position: string;
  team: string;
  status?: string;
  byeWeek?: number;
  ownership?: string;
}

export interface ESPNTeam {
  id: number;
  name: string;
  abbreviation: string;
  roster?: {
    entries: Array<{
      playerPoolEntry: {
        player: {
          id: number;
          fullName: string;
          firstName?: string;
          lastName?: string;
          defaultPositionId: number;
          proTeamId: number;
          injuryStatus?: string;
          byeWeek?: number;
        };
        ownership?: string;
      };
    }>;
  };
}

export interface ESPNLeagueData {
  teams: ESPNTeam[];
}

export class ESPNService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getLeagueData(leagueId: string, season: number = 2024): Promise<ESPNLeagueData> {
    const url = `${this.baseUrl}/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as ESPNLeagueData;
    } catch (error) {
      console.error('Error fetching ESPN league data:', error);
      throw error;
    }
  }

  getTeamName(proTeamId: number): string {
    const teamMap: { [key: number]: string } = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
      9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
      17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
      25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU'
    };
    
    return teamMap[proTeamId] || 'FA';
  }

  async getAllPlayersFromLeague(leagueId: string): Promise<ESPNPlayer[]> {
    try {
      const leagueData = await this.getLeagueData(leagueId);
      
      if (!leagueData || !leagueData.teams) {
        console.warn('No teams found in ESPN league data');
        return [];
      }

      const allPlayers: ESPNPlayer[] = [];
      
      for (const team of leagueData.teams) {
        if (team.roster && team.roster.entries) {
          for (const entry of team.roster.entries) {
            if (entry.playerPoolEntry && entry.playerPoolEntry.player) {
              const player = entry.playerPoolEntry.player;
              allPlayers.push({
                espnId: player.id.toString(),
                name: player.fullName,
                position: player.defaultPositionId.toString(),
                team: this.getTeamName(player.proTeamId),
                status: player.injuryStatus || 'ACTIVE',
                byeWeek: player.byeWeek || 0,
              });
            }
          }
        }
      }

      console.log(`Found ${allPlayers.length} players in ESPN league ${leagueId}`);
      return allPlayers;
    } catch (error) {
      console.error('Error fetching players from ESPN league:', error);
      throw error;
    }
  }

  async getTeamRoster(leagueId: string, teamId: string): Promise<{ team: any; players: ESPNPlayer[] }> {
    try {
      const leagueData = await this.getLeagueData(leagueId);
      
      if (!leagueData || !leagueData.teams) {
        throw new Error('No teams found in ESPN league data');
      }

      const team = leagueData.teams.find(t => t.id.toString() === teamId);
      if (!team) {
        throw new Error(`Team ${teamId} not found in league ${leagueId}`);
      }

      const players: ESPNPlayer[] = [];
      
      if (team.roster && team.roster.entries) {
        for (const entry of team.roster.entries) {
          if (entry.playerPoolEntry && entry.playerPoolEntry.player) {
            const player = entry.playerPoolEntry.player;
            players.push({
              espnId: player.id.toString(),
              name: player.fullName,
              position: player.defaultPositionId.toString(),
              team: this.getTeamName(player.proTeamId),
              status: player.injuryStatus || 'ACTIVE',
              byeWeek: player.byeWeek || 0,
              ownership: entry.playerPoolEntry.ownership || 'OWNED',
            });
          }
        }
      }

      console.log(`Found ${players.length} players on team ${teamId} in league ${leagueId}`);
      return {
        team: {
          id: team.id,
          name: team.name,
          abbreviation: team.abbreviation,
        },
        players
      };
    } catch (error) {
      console.error('Error fetching team roster from ESPN:', error);
      throw error;
    }
  }
} 