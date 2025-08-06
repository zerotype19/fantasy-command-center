import { DatabaseService } from '../utils/db';
import { fetchLeagueData, extractPlayersFromRoster } from '../services/espn';

export class PlayersHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const position = url.searchParams.get('position');
      const limit = parseInt(url.searchParams.get('limit') || '25');
      const search = url.searchParams.get('search');

      // Get players from ESPN data (no projections for now)
      let players: any[] = await this.db.getPlayersWithProjections();

      // Add projection_source field to indicate no projections available
      players = players.map(player => ({
        ...player,
        projected_points_week: null,
        projected_points_season: null,
        projection_source: 'none'
      }));

      // Apply filters
      if (position) {
        players = players.filter((p: any) => p.position.toUpperCase() === position.toUpperCase());
      }

      if (search) {
        const searchLower = search.toLowerCase();
        players = players.filter((p: any) => 
          p.name.toLowerCase().includes(searchLower) ||
          p.team.toLowerCase().includes(searchLower)
        );
      }

      // Apply limit
      if (limit > 0) {
        players = players.slice(0, limit);
      }

      return new Response(
        JSON.stringify(players),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Players GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleSyncESPN(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;
      const leagueId = body.leagueId;

      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: 'leagueId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Starting ESPN sync for league ${leagueId}...`);

      // Fetch league data from ESPN
      const leagueData = await fetchLeagueData(leagueId);
      
      // Extract players from roster data
      const players = extractPlayersFromRoster(leagueData);
      
      // Store players in database
      await this.db.upsertESPNPlayers(players);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${players.length} players from ESPN league ${leagueId}`,
          count: players.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Sync ESPN error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to sync ESPN players' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleSyncPlayers(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const leagueId = pathParts[pathParts.length - 1]; // Get leagueId from URL path

      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: 'leagueId is required in URL path' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Starting ESPN players sync for league ${leagueId}...`);

      // Fetch league data from ESPN
      const leagueData = await fetchLeagueData(leagueId);
      
      // Extract players from roster data
      const players = extractPlayersFromRoster(leagueData);
      
      // Store players in database
      await this.db.upsertESPNPlayers(players);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${players.length} players from ESPN league ${leagueId}`,
          count: players.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Sync players error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to sync players from ESPN' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 