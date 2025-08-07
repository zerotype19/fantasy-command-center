import { DatabaseService } from '../utils/db';
import {
  fetchAllPlayers,
  filterPlayersForDevelopment,
  validatePlayer,
  transformSleeperPlayer,
  fetchTrendingPlayers,
  fetchAllPlayersComplete
} from '../services/sleeper';
import { upsertTrendingPlayers, getTrendingPlayers, getTrendingPlayersByLookback } from '../utils/db';
import { 
  fetchFantasyProsProjections, 
  fetchFantasyProsECR, 
  fetchFantasyProsAuctionValues, 
  fetchFantasyProsSOS, 
  fetchFantasyProsPlayers, 
  fetchFantasyProsNews, 
  fetchFantasyProsInjuries, 
  fetchFantasyProsRankings, 
  fetchFantasyProsConsensusRankings, 
  fetchFantasyProsExperts, 
  fetchFantasyProsPlayerPoints,
  matchFantasyProsToPlayers,
  matchFantasyProsToPlayerUpdates
} from '../services/fantasyPros';
import { scrapeNFLSchedule } from '../services/nflSchedule';
import { generatePlayerMatchupsForWeek, enrichWeatherForGame, syncDefenseStrength } from '../utils/matchups';
import { upsertFantasyProsData, getPlayersWithFantasyData, updatePlayerFantasyProsData, upsertNFLSchedule, getNFLSchedule, getNFLGamesByWeek, getNFLGamesByTeam } from '../utils/db';

interface Env {
  DB: any;
  NOAA_BASE_URL: string;
  ESPN_BASE_URL: string;
  FANTASYPROS_API_KEY: string;
}

export class PlayersHandler {
  private db: DatabaseService;
  private env: Env;

  constructor(db: DatabaseService, env: Env) {
    this.db = db;
    this.env = env;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const position = url.searchParams.get('position');
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam) : -1; // -1 means no limit
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

      // Apply limit (only if limit is specified and > 0)
      if (limit > 0) {
        players = players.slice(0, limit);
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            players: players,
            count: players.length
          }
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

  async handleSyncFantasyPros(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week') ? parseInt(url.searchParams.get('week')!) : undefined;
      const season = url.searchParams.get('season') ? parseInt(url.searchParams.get('season')!) : 2024;
      
      console.log(`Starting FantasyPros sync for week: ${week}, season: ${season}`);
      
      // Get all players for matching
      const allPlayers = await this.db.getAllPlayers();
      
      // Fetch minimal FantasyPros data to test API limits
      const [projections, players] = await Promise.all([
        fetchFantasyProsProjections(this.env.FANTASYPROS_API_KEY!, week, season),
        fetchFantasyProsPlayers(this.env.FANTASYPROS_API_KEY!, 'nfl'),
      ]);
      
      // Skip other data types for now to conserve API calls
      const ecr: any[] = [];
      const auctionValues: any[] = [];
      const sos: any[] = [];
      const news: any[] = [];
      const injuries: any[] = [];
      const rankings: any[] = [];
      const consensusRankings: any[] = [];
      const experts: any[] = [];
      const playerPoints: any[] = [];
      
      // Combine all FantasyPros data
      const allFantasyProsData = [
        ...projections.map(p => ({ ...p, data_type: 'projection' })),
        ...ecr.map(e => ({ ...e, data_type: 'ecr' })),
        ...auctionValues.map(a => ({ ...a, data_type: 'auction' })),
        ...sos.map(s => ({ ...s, data_type: 'sos' })),
        ...players.map(p => ({ ...p, data_type: 'player' })),
        ...news.map(n => ({ ...n, data_type: 'news' })),
        ...injuries.map(i => ({ ...i, data_type: 'injury' })),
        ...rankings.map(r => ({ ...r, data_type: 'ranking' })),
        ...consensusRankings.map(cr => ({ ...cr, data_type: 'consensus_ranking' })),
        ...playerPoints.map(pp => ({ ...pp, data_type: 'player_points' }))
      ];
      
      // Match FantasyPros data to players for direct updates
      const { matched: playerUpdates, unmatched } = matchFantasyProsToPlayerUpdates(allFantasyProsData, allPlayers);
      
      if (playerUpdates.length > 0) {
        await updatePlayerFantasyProsData(this.db.db, playerUpdates);
        console.log(`Successfully updated ${playerUpdates.length} players with FantasyPros data (${unmatched.length} unmatched)`);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Updated ${playerUpdates.length} players with FantasyPros data`,
          data: {
            week,
            season,
            updated_count: playerUpdates.length,
            unmatched_count: unmatched.length,
            unmatched_sample: unmatched.slice(0, 10) // Return sample of unmatched for debugging
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          message: 'No FantasyPros data matched to players',
          data: { week, season, updated_count: 0, unmatched_count: allFantasyProsData.length }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Sync FantasyPros error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleGetPlayersWithFantasyData(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week') ? parseInt(url.searchParams.get('week')!) : undefined;
      const season = url.searchParams.get('season') ? parseInt(url.searchParams.get('season')!) : undefined;
      
      const players = await getPlayersWithFantasyData(this.db.db, week, season);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          week,
          season,
          count: players.length,
          players
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Get players with fantasy data error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestFantasyProsKey(request: Request): Promise<Response> {
    try {
      const apiKey = this.env.FANTASYPROS_API_KEY;
      const keyPreview = apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_FOUND';
      
      // Test a single API call to check rate limiting
      try {
        const testUrl = 'https://api.fantasypros.com/public/v2/json/nfl/2024/projections?position=QB&week=0';
        console.log('Testing single FantasyPros API call...');
        
        const response = await fetch(testUrl, {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`Test API response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Test API error: ${errorText}`);
          
          return new Response(JSON.stringify({
            success: true,
            message: 'FantasyPros API key status',
            data: {
              key_available: !!apiKey,
              key_preview: keyPreview,
              key_length: apiKey ? apiKey.length : 0,
              api_test: {
                status: response.status,
                statusText: response.statusText,
                error: errorText
              }
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const data = await response.json();
        console.log('Test API call successful, got data:', Object.keys(data));
        
        return new Response(JSON.stringify({
          success: true,
          message: 'FantasyPros API key status',
          data: {
            key_available: !!apiKey,
            key_preview: keyPreview,
            key_length: apiKey ? apiKey.length : 0,
            api_test: {
              status: response.status,
              statusText: response.statusText,
              success: true,
              data_keys: Object.keys(data)
            }
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (apiError) {
        console.error('Test API call failed:', apiError);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'FantasyPros API key status',
          data: {
            key_available: !!apiKey,
            key_preview: keyPreview,
            key_length: apiKey ? apiKey.length : 0,
            api_test: {
              error: apiError instanceof Error ? apiError.message : 'Unknown API error'
            }
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Test FantasyPros key error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleSyncNFLSchedule(request: Request): Promise<Response> {
    try {
      console.log('Starting NFL schedule sync...');
      
      // Scrape NFL schedule
      const games = await scrapeNFLSchedule();
      
      if (games.length > 0) {
        await upsertNFLSchedule(this.db.db, games);
        console.log(`Successfully synced ${games.length} NFL schedule games`);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Synced ${games.length} NFL schedule games`,
          data: {
            games_count: games.length,
            games: games
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          message: 'No NFL schedule games found',
          data: { games_count: 0 }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Sync NFL schedule error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleGetNFLSchedule(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week') ? parseInt(url.searchParams.get('week')!) : undefined;
      
      const games = await getNFLSchedule(this.db.db, week);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          week,
          count: games.length,
          games
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Get NFL schedule error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleSyncMatchups(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      const enrichWeather = url.searchParams.get('weather') === 'true';
      
      if (!week) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Week parameter is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Week must be between 1 and 18'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Test database connection first
      try {
        console.log('Testing database connection...');
        const testQuery = await this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule').first();
        console.log('Database connection test successful:', testQuery);
        
        console.log('Testing players query...');
        const playersQuery = await this.db.db.prepare('SELECT COUNT(*) as count FROM players WHERE team IS NOT NULL AND team != \'\'').first();
        console.log('Players query test successful:', playersQuery);
        
        console.log('Testing schedule query without parameter...');
        const scheduleQueryNoParam = await this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule').first();
        console.log('Schedule query without parameter test successful:', scheduleQueryNoParam);
        
        console.log('Testing schedule query with hardcoded parameter...');
        const scheduleQueryHardcoded = await this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule WHERE week = 1').first();
        console.log('Schedule query with hardcoded parameter test successful:', scheduleQueryHardcoded);
        
        console.log('All database tests passed!');
        

        
      } catch (error) {
        console.error('Database connection test failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Database connection failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Sync defense strength first (skip for now to debug)
      // await syncDefenseStrength(this.db.db);

      // Generate matchups for the week
      console.log('Calling generatePlayerMatchupsForWeek...');
      await generatePlayerMatchupsForWeek(this.db.db, weekNum);
      console.log('generatePlayerMatchupsForWeek completed');

      // Enrich with weather data if requested
      if (enrichWeather) {
        const games = await this.db.db.prepare(`
          SELECT * FROM nfl_schedule WHERE week = ?
        `).all(weekNum);

        for (const game of games) {
          await enrichWeatherForGame(this.db.db, game);
        }
      }

      // Get matchup count
      const matchupCount = await this.db.db.prepare(`
        SELECT COUNT(*) as count FROM player_matchups WHERE week = ?
      `).first(weekNum);

      return new Response(JSON.stringify({
        success: true,
        message: `Synced matchups for week ${weekNum}`,
        data: {
          week: weekNum,
          matchups_count: matchupCount.count,
          weather_enriched: enrichWeather
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Sync matchups error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestDatabase(request: Request): Promise<Response> {
    try {
      console.log('Testing database connection...');
      const testQuery = await this.db.db.prepare('SELECT 1 as test').first();
      console.log('Database connection test successful:', testQuery);
      
      console.log('Testing nfl_schedule table...');
      const scheduleQuery = await this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule').first();
      console.log('Schedule query test successful:', scheduleQuery);
      
      console.log('Testing players table...');
      const playersQuery = await this.db.db.prepare('SELECT COUNT(*) as count FROM players').first();
      console.log('Players query test successful:', playersQuery);
      
      console.log('Testing parameter binding...');
      const paramQuery = await this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule WHERE week = ?').bind(1).first();
      console.log('Parameter query test successful:', paramQuery);
      
      console.log('Testing insert...');
      const insertStmt = this.db.db.prepare('INSERT OR REPLACE INTO player_matchups (player_id, week, game_id, opponent_team, is_home) VALUES (?, ?, ?, ?, ?)');
      await insertStmt.bind(999999, 1, 'test-game', 'TEST', 1).run();
      console.log('Insert test successful');
      
      console.log('Testing exact utility function queries...');
      const week = 1;
      
      // Test the exact same queries as the utility function
      const stmt = this.db.db.prepare(`
        SELECT * FROM nfl_schedule WHERE week = ?
      `);
      const result = await stmt.bind(week).all();
      const schedule = result.results || result;
      console.log(`Found ${schedule.length} games for week ${week}`);
      
      const playersStmt = this.db.db.prepare(`
        SELECT * FROM players WHERE team IS NOT NULL AND team != ''
      `);
      const playersResult = await playersStmt.all();
      const players = playersResult.results || playersResult;
      console.log(`Found ${players.length} players with team information`);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Database tests passed',
        data: {
          test: testQuery,
          schedule_count: scheduleQuery,
          players_count: playersQuery,
          param_query: paramQuery,
          utility_schedule_count: schedule.length,
          utility_players_count: players.length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Database test failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleGetMatchups(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      const playerId = url.searchParams.get('player_id');
      const team = url.searchParams.get('team');

      let query = `
        SELECT pm.*, p.name, p.team, p.position
        FROM player_matchups pm
        JOIN players p ON pm.player_id = p.sleeper_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (week) {
        query += ' AND pm.week = ?';
        params.push(parseInt(week));
      }

      if (playerId) {
        query += ' AND pm.player_id = ?';
        params.push(parseInt(playerId));
      }

      if (team) {
        query += ' AND p.team = ?';
        params.push(team);
      }

      query += ' ORDER BY pm.week, p.name';

      const matchups = await this.db.db.prepare(query).all(...params);

      return new Response(JSON.stringify({
        success: true,
        data: {
          matchups: matchups,
          count: matchups.length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Get matchups error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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