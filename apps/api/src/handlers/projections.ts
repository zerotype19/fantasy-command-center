import { DatabaseService } from '../utils/db';
import { FantasyProsService } from '../services/fantasypros';

export class ProjectionsHandler {
  private db: DatabaseService;
  private fantasyProsService: FantasyProsService;

  constructor(db: DatabaseService, fantasyProsService: FantasyProsService) {
    this.db = db;
    this.fantasyProsService = fantasyProsService;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      const season = url.searchParams.get('season');
      const position = url.searchParams.get('position');
      const limit = url.searchParams.get('limit');

      if (!week || !season) {
        return new Response(
          JSON.stringify({ error: 'week and season query parameters are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const weekNum = parseInt(week, 10);
      const seasonNum = parseInt(season, 10);
      const limitNum = limit ? parseInt(limit, 10) : 50;

      if (isNaN(weekNum) || isNaN(seasonNum)) {
        return new Response(
          JSON.stringify({ error: 'week and season must be valid numbers' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const projectionsResult = await this.db.getProjectionsByWeek(weekNum, seasonNum);
      let projections = projectionsResult.results || [];

      // Apply position filter if provided
      if (position) {
        projections = projections.filter((p: any) => p.position === position);
      }

      // Apply limit
      if (limitNum > 0) {
        projections = projections.slice(0, limitNum);
      }

      return new Response(
        JSON.stringify({
          projections: projections,
          count: projections.length,
          week: weekNum,
          season: seasonNum
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Projections GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleSyncProjections(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;
      const { week, season = 2024 } = body;

      if (!week) {
        return new Response(
          JSON.stringify({ error: 'week is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const weekNum = parseInt(week, 10);
      const seasonNum = parseInt(season, 10);

      if (isNaN(weekNum) || isNaN(seasonNum)) {
        return new Response(
          JSON.stringify({ error: 'week and season must be valid numbers' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fetch projections from FantasyPros
      const fantasyProsProjections = await this.fantasyProsService.getProjections(weekNum, seasonNum);
      
      if (!fantasyProsProjections || fantasyProsProjections.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'No projections available from FantasyPros',
            syncedCount: 0,
            errorCount: 0
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Sync projections to database
      let syncedCount = 0;
      let errorCount = 0;

      for (const projection of fantasyProsProjections) {
        try {
          // Get player by ESPN ID (assuming FantasyPros uses ESPN IDs)
          const player = await this.db.getPlayerByEspnId(projection.playerId);
          
          if (!player) {
            console.warn(`Player not found for ESPN ID: ${projection.playerId}`);
            errorCount++;
            continue;
          }

          await this.db.upsertProjection(
            (player as any).id,
            projection.week,
            projection.season,
            projection.projectedPoints,
            projection.source
          );
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing projection for ${projection.playerName}:`, error);
          errorCount++;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `FantasyPros projections sync completed`,
          syncedCount,
          errorCount,
          totalProjections: fantasyProsProjections.length,
          week: weekNum,
          season: seasonNum
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('FantasyPros sync error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'FantasyPros sync failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 