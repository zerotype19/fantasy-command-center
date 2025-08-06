import { DatabaseService } from '../utils/db';
import { ESPNService } from '../services/espn';

export class PlayersHandler {
  private db: DatabaseService;
  private espnService: ESPNService;

  constructor(db: DatabaseService, espnService: ESPNService) {
    this.db = db;
    this.espnService = espnService;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const position = url.searchParams.get('position');
      const team = url.searchParams.get('team');
      const status = url.searchParams.get('status');

      const playersResult = await this.db.getAllPlayers();
      let players = playersResult.results || [];

      // Apply filters if provided
      if (position) {
        players = players.filter((p: any) => p.position === position);
      }
      if (team) {
        players = players.filter((p: any) => p.team === team);
      }
      if (status) {
        players = players.filter((p: any) => p.status === status);
      }

      return new Response(
        JSON.stringify({ 
          players: players,
          count: players.length 
        }),
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
      const { leagueId, season = 2024 } = body;

      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: 'leagueId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fetch players from ESPN
      const espnPlayers = await this.espnService.getAllPlayersFromLeague(leagueId, season);
      
      if (!espnPlayers || espnPlayers.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No players found in ESPN league' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Sync players to database
      let syncedCount = 0;
      let errorCount = 0;

      for (const player of espnPlayers) {
        try {
          await this.db.upsertPlayer(
            player.id,
            player.name,
            player.position,
            player.team,
            player.status,
            player.byeWeek
          );
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing player ${player.name}:`, error);
          errorCount++;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `ESPN sync completed`,
          syncedCount,
          errorCount,
          totalPlayers: espnPlayers.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('ESPN sync error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'ESPN sync failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 