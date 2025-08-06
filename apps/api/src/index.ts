import { DatabaseService, DatabaseEnv } from './utils/db';
import { ESPNService } from './services/espn';
import { FantasyProsService } from './services/fantasypros';
import { NOAAService } from './services/noaa';
import { LeagueHandler } from './handlers/league';
import { PlayersHandler } from './handlers/players';
import { ProjectionsHandler } from './handlers/projections';
import { AlertsHandler } from './handlers/alerts';

// Cloudflare Workers types
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
  type: string;
}

export interface Env extends DatabaseEnv {
  FANTASY_PROS_MCP_URL: string;
  NOAA_BASE_URL: string;
  ESPN_BASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize services
    const db = new DatabaseService(env.DB);
    const espnService = new ESPNService(env.ESPN_BASE_URL);
    const fantasyProsService = new FantasyProsService(env.FANTASY_PROS_MCP_URL);
    const noaaService = new NOAAService(env.NOAA_BASE_URL);

    // Initialize handlers
    const leagueHandler = new LeagueHandler(db);
    const playersHandler = new PlayersHandler(db, espnService);
    const projectionsHandler = new ProjectionsHandler(db, fantasyProsService);
    const alertsHandler = new AlertsHandler(db);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response: Response;

      // Route requests
      switch (path) {
        case '/league':
          if (request.method === 'POST') {
            response = await leagueHandler.handlePost(request);
          } else if (request.method === 'GET') {
            response = await leagueHandler.handleGet(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/players':
          if (request.method === 'GET') {
            response = await playersHandler.handleGet(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/sync/espn':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncESPN(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/projections':
          if (request.method === 'GET') {
            response = await projectionsHandler.handleGet(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/sync/projections':
          if (request.method === 'POST') {
            response = await projectionsHandler.handleSyncProjections(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/alerts':
          if (request.method === 'GET') {
            response = await alertsHandler.handleGet(request);
          } else if (request.method === 'POST') {
            response = await alertsHandler.handlePost(request);
          } else if (request.method === 'PATCH') {
            response = await alertsHandler.handlePatch(request);
          } else {
            response = new Response(
              JSON.stringify({ error: 'Method not allowed' }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
          break;

        case '/health':
          response = new Response(
            JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
          break;

        default:
          response = new Response(
            JSON.stringify({ 
              error: 'Not found',
              availableEndpoints: [
                'POST /league - Store league settings',
                'GET /league - Get league settings',
                'GET /players - Get all players',
                'POST /sync/espn - Sync players from ESPN',
                'GET /projections - Get projections',
                'POST /sync/projections - Sync projections from FantasyPros',
                'GET /alerts - Get alerts for user',
                'POST /alerts - Create alert',
                'PATCH /alerts - Mark alert as read',
                'GET /health - Health check'
              ]
            }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
      }

      // Add CORS headers to response
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Running scheduled ingestion job...');

    try {
      const db = new DatabaseService(env.DB);
      const fantasyProsService = new FantasyProsService(env.FANTASY_PROS_MCP_URL);
      const espnService = new ESPNService(env.ESPN_BASE_URL);
      const noaaService = new NOAAService(env.NOAA_BASE_URL);

      const currentDate = new Date();
      const currentWeek = this.getCurrentWeek(currentDate);
      const currentSeason = currentDate.getFullYear();

      // 1. Refresh player projections
      console.log('Refreshing player projections...');
      try {
        const projections = await fantasyProsService.getProjections(currentWeek, currentSeason);
        let syncedCount = 0;
        
        for (const projection of projections) {
          try {
            const player = await db.getPlayerByEspnId(projection.playerId);
            if (player) {
                          await db.upsertProjection(
              (player as any).id,
              projection.week,
              projection.season,
              projection.projectedPoints,
              projection.source
            );
              syncedCount++;
            }
          } catch (error) {
            console.error(`Error syncing projection for ${projection.playerName}:`, error);
          }
        }
        console.log(`Synced ${syncedCount} projections`);
      } catch (error) {
        console.error('Error refreshing projections:', error);
      }

      // 2. Refresh injury/news from ESPN (placeholder for now)
      console.log('Refreshing injury/news from ESPN...');
      // TODO: Implement ESPN injury/news sync when we have the specific endpoints

      // 3. Refresh weather from NOAA for upcoming games
      console.log('Refreshing weather data...');
      // TODO: Implement weather sync when we have game schedules

      console.log('Scheduled ingestion job completed successfully');

    } catch (error) {
      console.error('Scheduled job error:', error);
    }
  },

  getCurrentWeek(date: Date): number {
    // Simple week calculation - NFL season typically starts in September
    // This is a placeholder - we'll need to implement proper NFL week calculation
    const seasonStart = new Date(date.getFullYear(), 8, 1); // September 1st
    const weekDiff = Math.floor((date.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(18, weekDiff + 1)); // NFL has 18 weeks
  }
}; 