import { DatabaseService } from './utils/db';
import { ESPNService } from './services/espn';
import { FantasyProsService } from './services/fantasypros';
import { NOAAService } from './services/noaa';
import { LeagueHandler } from './handlers/league';
import { PlayersHandler } from './handlers/players';
import { ProjectionsHandler } from './handlers/projections';
import { AlertsHandler } from './handlers/alerts';
import { TeamHandler } from './handlers/team';

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

export interface Env {
  DB: any; // D1Database type
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
    const playersHandler = new PlayersHandler(db, espnService, fantasyProsService);
    const projectionsHandler = new ProjectionsHandler(db, fantasyProsService);
    const alertsHandler = new AlertsHandler(db);
    const teamHandler = new TeamHandler(db, espnService);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      let response: Response;

      switch (path) {
        case '/league':
          if (request.method === 'POST') {
            response = await leagueHandler.handlePost(request);
          } else if (request.method === 'GET') {
            response = await leagueHandler.handleGet(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/players':
          if (request.method === 'GET') {
            response = await playersHandler.handleGet(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/espn':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncESPN(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/fantasypros':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncFantasyPros(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/projections':
          if (request.method === 'GET') {
            response = await projectionsHandler.handleGet(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/projections':
          if (request.method === 'POST') {
            response = await projectionsHandler.handleSyncProjections(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
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
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/health':
          response = new Response(
            JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
          break;

        default:
          // Handle team endpoint with path parameters
          if (path.startsWith('/team/') && request.method === 'GET') {
            response = await teamHandler.handleGet(request);
          } else {
            response = new Response('Not found', { status: 404 });
          }
          break;
      }

      // Add CORS headers to all responses
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
      console.error('Request error:', error);
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
      // Initialize services
      const db = new DatabaseService(env.DB);
      const fantasyProsService = new FantasyProsService(env.FANTASY_PROS_MCP_URL);
      const projectionsHandler = new ProjectionsHandler(db, fantasyProsService);

      // 1. Refresh player projections from FantasyPros
      console.log('Refreshing projections from FantasyPros...');
      await projectionsHandler.handleSyncProjections(new Request('http://localhost/sync/projections', { method: 'POST' }));

      // 2. Refresh injury/news from ESPN (placeholder for now)
      console.log('Refreshing injury/news from ESPN...');
      // TODO: Implement ESPN injury/news sync

      // 3. Refresh weather from NOAA for upcoming games
      console.log('Refreshing weather from NOAA...');
      // TODO: Implement NOAA weather sync

      console.log('Scheduled ingestion job completed successfully');
    } catch (error) {
      console.error('Scheduled job error:', error);
    }
  },

  getCurrentWeek(date: Date): number {
    // Simple week calculation - you might want to make this more sophisticated
    const seasonStart = new Date(2024, 8, 5); // September 5, 2024
    const diffTime = date.getTime() - seasonStart.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(1, Math.min(18, diffWeeks));
  }
}; 