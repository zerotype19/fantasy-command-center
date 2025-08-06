import { DatabaseService } from '../utils/db';
import { fetchTeamRoster } from '../services/espn';

export interface TeamPlayer {
  espn_id: string;
  name: string;
  position: string;
  team: string;
  status: string;
  bye_week: number | null;
  projected_points_week: number | null;
  projected_points_season: number | null;
  projection_source: string;
}

export class TeamHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      
      // Extract leagueId and teamId from path: /team/:leagueId/:teamId
      const leagueIdIndex = pathParts.indexOf('team') + 1;
      const leagueId = pathParts[leagueIdIndex];
      const teamId = pathParts[leagueIdIndex + 1];

      if (!leagueId || !teamId) {
        return new Response(
          JSON.stringify({ error: 'leagueId and teamId are required in URL path' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching team roster for league ${leagueId}, team ${teamId}...`);

      // Fetch team roster from ESPN
      const rosterData = await fetchTeamRoster(leagueId, parseInt(teamId));
      
      if (!rosterData || !rosterData.teams || !rosterData.teams[0]) {
        return new Response(
          JSON.stringify({ error: 'No team data found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const team = rosterData.teams[0];
      const teamPlayers: TeamPlayer[] = [];

      // Process each player in the roster
      if (team.roster && team.roster.entries) {
        for (const entry of team.roster.entries) {
          if (!entry.playerPoolEntry || !entry.playerPoolEntry.player) {
            continue;
          }

          const player = entry.playerPoolEntry.player;
          const espnId = player.id.toString();

          // Get player from database to get additional info
          const dbPlayer = await this.db.getPlayerByEspnId(espnId);
          
          // Get projection if available
          const projection = dbPlayer ? await this.db.getProjectionByPlayerId(dbPlayer.id) : null;

          teamPlayers.push({
            espn_id: espnId,
            name: player.fullName || `${player.firstName} ${player.lastName}`,
            position: dbPlayer?.position || 'UNK',
            team: dbPlayer?.team || 'FA',
            status: player.injuryStatus || 'healthy',
            bye_week: dbPlayer?.bye_week || null,
            projected_points_week: projection?.projected_points || null,
            projected_points_season: null, // ESPN doesn't provide season projections
            projection_source: projection?.source || 'none'
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          team: {
            id: team.id,
            name: team.name,
            abbreviation: team.abbreviation
          },
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