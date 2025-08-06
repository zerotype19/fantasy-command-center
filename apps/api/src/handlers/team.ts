import { DatabaseService } from '../utils/db';
import { ESPNService } from '../services/espn';

export interface TeamPlayer {
  player_id: number;
  name: string;
  position: string;
  team: string;
  bye_week: number;
  projected_points_week: number;
  projected_points_season: number;
  espn_id?: string;
  espn_status?: string;
  espn_ownership?: string;
}

export class TeamHandler {
  private db: DatabaseService;
  private espnService: ESPNService;

  constructor(db: DatabaseService, espnService: ESPNService) {
    this.db = db;
    this.espnService = espnService;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      
      // Extract leagueId and teamId from path: /team/:leagueId/:teamId
      if (pathParts.length !== 4) {
        return new Response(
          JSON.stringify({ error: 'Invalid path. Expected /team/:leagueId/:teamId' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const leagueId = pathParts[2];
      const teamId = pathParts[3];

      if (!leagueId || !teamId) {
        return new Response(
          JSON.stringify({ error: 'leagueId and teamId are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching team roster for league ${leagueId}, team ${teamId}`);

      // Fetch team roster from ESPN
      const espnTeamData = await this.espnService.getTeamRoster(leagueId, teamId);
      
      if (!espnTeamData || !espnTeamData.players || espnTeamData.players.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No team roster found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Match ESPN players with our database players and merge data
      const teamPlayers: TeamPlayer[] = [];
      
      for (const espnPlayer of espnTeamData.players) {
        // Try to find matching player in our database
        const dbPlayer = await this.db.getPlayerByEspnId(espnPlayer.espnId);
        
        if (dbPlayer) {
          // Get projection data for this player
          const projection = await this.db.getProjectionByPlayerId((dbPlayer as any).id, 1, 2024);
          
          teamPlayers.push({
            player_id: (dbPlayer as any).id,
            name: (dbPlayer as any).name,
            position: (dbPlayer as any).position,
            team: (dbPlayer as any).team,
            bye_week: (dbPlayer as any).bye_week || 0,
            projected_points_week: (projection as any)?.projected_points || 0,
            projected_points_season: (projection as any)?.projected_points || 0, // Using weekly for now
            espn_id: espnPlayer.espnId,
            espn_status: espnPlayer.status,
            espn_ownership: espnPlayer.ownership,
          });
        } else {
          // Player not in our database, create basic entry
          teamPlayers.push({
            player_id: 0,
            name: espnPlayer.name,
            position: espnPlayer.position,
            team: espnPlayer.team,
            bye_week: espnPlayer.byeWeek || 0,
            projected_points_week: 0,
            projected_points_season: 0,
            espn_id: espnPlayer.espnId,
            espn_status: espnPlayer.status,
            espn_ownership: espnPlayer.ownership,
          });
        }
      }

      return new Response(
        JSON.stringify({
          team: espnTeamData.team,
          players: teamPlayers,
          count: teamPlayers.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Team GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch team roster' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 