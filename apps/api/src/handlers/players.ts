import { DatabaseService } from '../utils/db';
import { ESPNService } from '../services/espn';
import { FantasyProsService } from '../services/fantasypros';

export class PlayersHandler {
  private db: DatabaseService;
  private espnService: ESPNService;
  private fantasyProsService: FantasyProsService;

  constructor(db: DatabaseService, espnService: ESPNService, fantasyProsService: FantasyProsService) {
    this.db = db;
    this.espnService = espnService;
    this.fantasyProsService = fantasyProsService;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const position = url.searchParams.get('position');
      const limit = parseInt(url.searchParams.get('limit') || '25');
      const search = url.searchParams.get('search');

      // Get players with projections from FantasyPros
      let players: any[] = await this.db.getPlayersWithProjections();

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

      const players = await this.espnService.getAllPlayersFromLeague(leagueId);
      
      // Store players in database
      for (const player of players) {
        await this.db.upsertPlayer(
          player.espnId,
          player.name,
          player.position,
          player.team,
          player.status,
          player.byeWeek
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${players.length} players from ESPN`,
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

  async handleSyncFantasyPros(request: Request): Promise<Response> {
    try {
      console.log('Starting FantasyPros sync...');
      
      const players = await this.fantasyProsService.getProjections();
      
      // Store players in database
      let storedCount = 0;
      for (const player of players) {
        try {
          await this.db.upsertFantasyProsPlayer(
            player.name,
            player.position,
            player.team,
            player.bye_week,
            player.projected_points_week,
            player.projected_points_season,
            player.source,
            player.adp,
            player.risk_rating,
            player.tier,
            player.rank
          );
          storedCount++;
        } catch (error) {
          console.error(`Failed to store player ${player.name}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${storedCount} players from FantasyPros`,
          count: storedCount,
          total: players.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Sync FantasyPros error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to sync FantasyPros players' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 