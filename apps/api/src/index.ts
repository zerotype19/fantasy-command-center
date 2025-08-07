import { DatabaseService } from './utils/db';
import { NOAAService } from './services/noaa';
import { LeagueHandler } from './handlers/league';
import { PlayersHandler } from './handlers/players';
import { AlertsHandler } from './handlers/alerts';
import { TeamHandler } from './handlers/team';
import { 
  fetchAllPlayers, 
  filterPlayersForDevelopment, 
  validatePlayer, 
  transformSleeperPlayer, 
  fetchTrendingPlayers,
  fetchAllPlayersComplete
} from './services/sleeper';
import { 
  upsertTrendingPlayers 
} from './utils/db';

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
  NOAA_BASE_URL: string;
  ESPN_BASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize services
    const db = new DatabaseService(env.DB);
    const noaaService = new NOAAService(env.NOAA_BASE_URL);

    // Initialize handlers
    const leagueHandler = new LeagueHandler(db);
    const playersHandler = new PlayersHandler(db, env);
    const alertsHandler = new AlertsHandler(db);
    const teamHandler = new TeamHandler(db);

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

        case '/sync/players':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncSleeper(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/trending/players':
          if (request.method === 'GET') {
            response = await playersHandler.handleTrendingPlayers(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/trending':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncTrendingPlayers(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/fantasy-pros':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncFantasyPros(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/players/with-fantasy-data':
          if (request.method === 'GET') {
            response = await playersHandler.handleGetPlayersWithFantasyData(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/test/fantasy-pros-key':
          if (request.method === 'GET') {
            response = await playersHandler.handleTestFantasyProsKey(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/nfl/schedule':
          if (request.method === 'GET') {
            response = await playersHandler.handleGetNFLSchedule(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/nfl-schedule':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncNFLSchedule(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/matchups':
          if (request.method === 'GET') {
            response = await playersHandler.handleGetMatchups(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/matchups':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncMatchups(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/weather':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncWeather(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/defense-strength':
          if (request.method === 'POST') {
            response = await playersHandler.handleSyncDefenseStrength(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/sync/matchups-defense':
          if (request.method === 'POST') {
            response = await playersHandler.handleUpdateMatchupsWithDefense(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/test/database':
          if (request.method === 'GET') {
            response = await playersHandler.handleTestDatabase(request);
          } else {
            response = new Response('Method not allowed', { status: 405 });
          }
          break;

        case '/test/matchups-db':
          if (request.method === 'GET') {
            response = await playersHandler.handleTestMatchupsDB(request);
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
          // Handle path-based endpoints
          if (path.startsWith('/team/') && request.method === 'GET') {
            response = await teamHandler.handleGet(request);
          } else if (path.startsWith('/sync/players/') && request.method === 'POST') {
            response = await playersHandler.handleSyncPlayers(request);
          } else if (path.startsWith('/league/') && path.endsWith('/settings') && request.method === 'GET') {
            response = await leagueHandler.handleGetLeagueSettings(request);
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
    console.log(`Running scheduled job with cron: ${event.cron}`);
    
    // Check which cron job this is
    if (event.cron === "0 6 * * *") {
      // Daily Sleeper API sync job
      console.log('Running daily Sleeper API sync job...');
      
      try {
        // Initialize services
        const db = new DatabaseService(env.DB);

        // 1. Sync all players from Sleeper API
        console.log('Syncing all players from Sleeper API...');
        const players = await fetchAllPlayersComplete();
        
        const validPlayers = [];
        let skippedCount = 0;
        
        for (const player of players) {
          const validation = validatePlayer(player);
          if (validation.isValid) {
            const transformedPlayer = transformSleeperPlayer(player);
            validPlayers.push(transformedPlayer);
          } else {
            skippedCount++;
          }
        }
        
        if (validPlayers.length > 0) {
          await db.upsertSleeperPlayers(validPlayers);
        }
        console.log(`Successfully synced ${validPlayers.length} players from Sleeper API (${skippedCount} skipped)`);

        // 2. Sync trending players (both add and drop)
        console.log('Syncing trending players from Sleeper API...');
        const trendingTypes = ['add', 'drop'];
        const lookbackHours = 24;
        
        for (const type of trendingTypes) {
          try {
            console.log(`Fetching trending ${type} players with ${lookbackHours}h lookback...`);
            const trendingPlayers = await fetchTrendingPlayers(type, lookbackHours);
            
            if (trendingPlayers && trendingPlayers.length > 0) {
              await upsertTrendingPlayers(env.DB, trendingPlayers, type, lookbackHours);
              console.log(`Successfully synced ${trendingPlayers.length} trending ${type} players`);
            } else {
              console.log(`No trending ${type} players found for ${lookbackHours}h lookback`);
            }
          } catch (error) {
            console.error(`Error syncing trending ${type} players:`, error);
            // Continue with other types even if one fails
          }
        }



        console.log('Daily Sleeper API sync job completed successfully');
      } catch (error) {
        console.error('Scheduled job error:', error);
      }
    } else if (event.cron === "0 * * * *") {
      // Hourly FantasyPros API sync job
      console.log('Running hourly FantasyPros API sync job...');
      
      try {
        // Initialize services
        const db = new DatabaseService(env.DB);
        const playersHandler = new PlayersHandler(db, env);
        
        // Create a mock request for the FantasyPros sync
        const mockRequest = new Request('https://fantasy-command-center-api.kevin-mcgovern.workers.dev/sync/fantasy-pros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await playersHandler.handleSyncFantasyPros(mockRequest);
        const result = await response.json();
        
        if (result.success) {
          console.log('Hourly FantasyPros API sync job completed successfully:', result.message);
        } else {
          console.error('FantasyPros sync failed:', result.error);
        }
      } catch (error) {
        console.error('FantasyPros scheduled job error:', error);
      }
    } else {
      console.log(`Unknown cron pattern: ${event.cron}`);
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