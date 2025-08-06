import { DatabaseService } from '../utils/db';
import { 
  fetchAllPlayers, 
  filterPlayersForDevelopment, 
  validatePlayer, 
  transformSleeperPlayer, 
  fetchTrendingPlayers,
  fetchAllPlayersComplete
} from '../services/sleeper';

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

      // Get players from database
      let players: any[] = await this.db.getAllPlayers();

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

  async handleSyncSleeper(request: Request): Promise<Response> {
    try {
      console.log('Starting Sleeper players sync...');

      // Fetch all players from Sleeper API
      const players = await fetchAllPlayersComplete();
      
      // Transform Sleeper data to our database format
      const playersToInsert: any[] = [];
      let skippedCount = 0;
      
      for (const player of players) {
        // Validate required fields
        const validation = validatePlayer(player);
        if (!validation.isValid) {
          console.warn(`Skipping player ${player.player_id}: missing fields: ${validation.missingFields.join(', ')}`);
          skippedCount++;
          continue;
        }

        // Transform Sleeper data to our format using the new function
        const transformedPlayer = transformSleeperPlayer(player);
        playersToInsert.push(transformedPlayer);
      }

      // Store players in database
      if (playersToInsert.length > 0) {
        await this.db.upsertSleeperPlayers(playersToInsert);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${playersToInsert.length} players from Sleeper (${skippedCount} skipped due to missing data)`,
          count: playersToInsert.length,
          skipped: skippedCount
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Sync Sleeper error:', error);
      
      let errorMessage = 'Failed to sync players from Sleeper';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleTrendingPlayers(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get('type') as 'add' | 'drop' || 'add';
      const lookbackHours = parseInt(url.searchParams.get('lookback_hours') || '24');

      console.log(`Fetching trending players (${type}) from Sleeper...`);

      // Fetch trending players from Sleeper API
      const trendingPlayers = await fetchTrendingPlayers(type, lookbackHours);

      // Get player details for trending players
      const playerDetails = await this.db.getPlayersBySleeperIds(
        trendingPlayers.map(p => p.player_id)
      );

      // Combine trending data with player details
      const enrichedTrendingPlayers = trendingPlayers.map(trending => {
        const playerDetail = playerDetails.find(p => p.sleeper_id === trending.player_id);
        return {
          ...trending,
          player: playerDetail || null
        };
      });

      return new Response(
        JSON.stringify({
          success: true,
          type,
          lookback_hours: lookbackHours,
          players: enrichedTrendingPlayers
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Trending players error:', error);
      
      let errorMessage = 'Failed to fetch trending players from Sleeper';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
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

      // This endpoint is deprecated - redirect to Sleeper sync
      return new Response(
        JSON.stringify({ 
          error: 'ESPN sync is deprecated. Please use /sync/players to sync from Sleeper API.',
          message: 'Use POST /sync/players to sync player data from Sleeper'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

      // This endpoint is deprecated - redirect to Sleeper sync
      return new Response(
        JSON.stringify({ 
          error: 'ESPN sync is deprecated. Please use /sync/players to sync from Sleeper API.',
          message: 'Use POST /sync/players to sync player data from Sleeper'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Sync players error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to sync players from ESPN' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleSyncTrendingPlayers(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'add';
      const lookbackHours = parseInt(url.searchParams.get('lookback_hours') || '24');

      console.log(`Starting trending players sync for type: ${type}, lookback: ${lookbackHours}h`);

      // Fetch trending players from Sleeper
      const trendingPlayers = await fetchTrendingPlayers(type, lookbackHours);
      
      if (!trendingPlayers || trendingPlayers.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          message: 'No trending players found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Store trending players in database
      await upsertTrendingPlayers(this.db.db, trendingPlayers, type, lookbackHours);

      console.log(`Successfully synced ${trendingPlayers.length} trending players`);

      return new Response(JSON.stringify({
        success: true,
        message: `Synced ${trendingPlayers.length} trending players`,
        data: {
          type,
          lookback_hours: lookbackHours,
          count: trendingPlayers.length,
          players: trendingPlayers
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error syncing trending players:', error);
      
      let errorMessage = 'Failed to sync trending players';
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = 'Sleeper API rate limited — please try again shortly.';
        } else {
          errorMessage = error.message;
        }
      }

      return new Response(JSON.stringify({
        success: false,
        message: errorMessage
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} 

export async function handleGetTrendingPlayers(request: Request, db: any): Promise<Response> {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'add';
    const lookbackHours = url.searchParams.get('lookback_hours');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let trendingPlayers;
    if (lookbackHours) {
      trendingPlayers = await getTrendingPlayersByLookback(db, type, parseInt(lookbackHours), limit);
    } else {
      trendingPlayers = await getTrendingPlayers(db, type, limit);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        type,
        lookback_hours: lookbackHours,
        count: trendingPlayers.length,
        players: trendingPlayers
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching trending players:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch trending players'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 