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
import { upsertFantasyProsData, getPlayersWithFantasyData, updatePlayerFantasyProsData, upsertNFLSchedule, getNFLSchedule, getNFLGamesByWeek, getNFLGamesByTeam, clearFantasyProsCache, getCachedFantasyProsResponse } from '../utils/db';
import { parseFantasyProsCSV, matchCSVToPlayers } from '../utils/csvParser';
import { updatePlayersWithFantasyProsCSV } from '../utils/db';

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
      const season = url.searchParams.get('season') ? parseInt(url.searchParams.get('season')!) : 2025; // Default to current season
      
      console.log(`Starting FantasyPros sync for week: ${week}, season: ${season}`);
      
      if (!this.env.FANTASYPROS_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'FantasyPros API key is not configured. Please set the FANTASYPROS_API_KEY environment variable.',
          data: {
            week,
            season,
            updated_count: 0,
            unmatched_count: 0
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Get all players for matching
      const allPlayers = await this.db.getAllPlayers();
      
      // Fetch FantasyPros data - enable ECR for rankings data
      const [projections, players, ecr] = await Promise.all([
        fetchFantasyProsProjections(this.env.FANTASYPROS_API_KEY, week, season, this.db.db),
        fetchFantasyProsPlayers(this.env.FANTASYPROS_API_KEY, 'nfl', this.db.db),
        fetchFantasyProsECR(this.env.FANTASYPROS_API_KEY, week, season, this.db.db),
      ]);
      
      console.log(`FantasyPros data fetched - Projections: ${projections.length}, Players: ${players.length}, ECR: ${ecr.length}`);
      console.log(`Sample projection:`, projections[0]);
      console.log(`Sample ECR:`, ecr[0]);
      
      // Log raw cached data for debugging
      console.log('=== CACHED DATA DEBUG ===');
      console.log('Projections sample:', JSON.stringify(projections.slice(0, 2), null, 2));
      console.log('ECR sample:', JSON.stringify(ecr.slice(0, 2), null, 2));
      console.log('Players sample:', JSON.stringify(players.slice(0, 2), null, 2));
      console.log('=== END CACHED DATA DEBUG ===');
      
      // Skip other data types for now to conserve API calls
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
      const keyAvailable = !!apiKey;
      const keyPreview = keyAvailable ? `${apiKey.substring(0, 8)}...` : 'NOT_FOUND';
      const keyLength = keyAvailable ? apiKey.length : 0;
      
      // Test a single API call
      let apiTest = { status: 0, statusText: '', error: '' };
      if (keyAvailable) {
        try {
          console.log('Testing single FantasyPros API call...');
          const response = await fetch('https://api.fantasypros.com/public/v2/json/nfl/2024/projections?position=QB&week=0', {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
              'User-Agent': 'Fantasy-Command-Center/1.0',
            },
          });
          
          apiTest.status = response.status;
          apiTest.statusText = response.statusText;
          
          if (!response.ok) {
            const errorText = await response.text();
            apiTest.error = errorText;
          } else {
            const data = await response.json();
            console.log('Raw FantasyPros API response:', JSON.stringify(data, null, 2));
            apiTest.error = 'Success - check logs for response data';
          }
        } catch (error) {
          apiTest.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'FantasyPros API key status',
        data: {
          key_available: keyAvailable,
          key_preview: keyPreview,
          key_length: keyLength,
          api_test: apiTest
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
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
        const testQuery = await this.env.DB.prepare('SELECT 1 as test').first();
        console.log('Database connection test successful:', testQuery);
        
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

      // Generate matchups for the week
      console.log('Calling generatePlayerMatchupsForWeek...');
      
      // Test the exact same database binding as the utility function
      console.log('Testing utility function database binding...');
      const testStmt = this.env.DB.prepare(`
        SELECT * FROM nfl_schedule WHERE week = ?
      `);
      const testResult = await testStmt.bind(weekNum).all();
      const testSchedule = testResult.results || testResult;
      console.log(`Test query found ${testSchedule.length} games for week ${weekNum}`);
      
      // Test the exact same insert as the utility function
      console.log('Testing utility function insert...');
      const testPlayer = await this.env.DB.prepare(`
        SELECT * FROM players WHERE team IS NOT NULL AND team != '' LIMIT 1
      `).first();
      
      if (testPlayer) {
        const insertStmt = this.env.DB.prepare(`
          INSERT OR REPLACE INTO player_matchups (
            player_id, week, game_id, opponent_team, is_home
          ) VALUES (?, ?, ?, ?, ?)
        `);
        await insertStmt.bind(
          testPlayer.sleeper_id,
          weekNum,
          'test-game-utility',
          'TEST',
          1
        ).run();
        console.log('Utility function insert test successful');
      }
      
      // Generate matchups directly in handler (bypass utility function)
      console.log('Generating matchups directly in handler...');
      
      // Get schedule for the week
      console.log(`Fetching schedule for week ${weekNum}...`);
      const stmt = this.env.DB.prepare(`
        SELECT * FROM nfl_schedule WHERE week = ?
      `);
      const result = await stmt.bind(weekNum).all();
      const schedule = result.results || result;
      console.log(`Found ${schedule.length} games for week ${weekNum}`);

      // Get all players with team information
      console.log('Fetching players with team information...');
      const playersStmt = this.env.DB.prepare(`
        SELECT * FROM players WHERE team IS NOT NULL AND team != ''
      `);
      const playersResult = await playersStmt.all();
      const players = playersResult.results || playersResult;
      console.log(`Found ${players.length} players with team information`);

      // Process first 2 games for testing
      const gamesToProcess = schedule.slice(0, 2);
      console.log(`Processing ${gamesToProcess.length} games out of ${schedule.length} total games`);
      
      for (const game of gamesToProcess) {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;
        const gameId = game.game_id;

        console.log(`Processing game: ${awayTeam} @ ${homeTeam} (game_id: ${gameId})`);

        const homePlayers = players.filter((p: any) => p.team === homeTeam);
        const awayPlayers = players.filter((p: any) => p.team === awayTeam);

        console.log(`Found ${homePlayers.length} home players and ${awayPlayers.length} away players`);

        // Process first 5 players per team
        const allPlayers = [...homePlayers.slice(0, 5), ...awayPlayers.slice(0, 5)];
        if (allPlayers.length === 0) {
          console.log('No players found for this game');
          continue;
        }

        for (const player of allPlayers) {
          const isHome = player.team === homeTeam;
          const opponentTeam = isHome ? awayTeam : homeTeam;

          // Insert or replace matchup
          try {
            console.log(`Inserting matchup for player ${player.sleeper_id}`);
            
            // Try a simpler approach without parameter binding
            const insertQuery = `
              INSERT OR REPLACE INTO player_matchups (
                player_id, week, game_id, opponent_team, is_home
              ) VALUES (${player.sleeper_id}, ${weekNum}, '${gameId}', '${opponentTeam}', ${isHome ? 1 : 0})
            `;
            
            console.log('Insert query:', insertQuery);
            
            await this.env.DB.prepare(insertQuery).run();
            
            console.log(`Successfully inserted matchup for player ${player.sleeper_id}`);
          } catch (error) {
            console.error(`Error inserting matchup for player ${player.sleeper_id}:`, error);
          }
        }
      }
      
      console.log('Matchup generation completed');

      // Sync defense strength first
      console.log('Syncing defense strength...');
      await syncDefenseStrength(this.env.DB);



      // Enrich with weather data if requested
      if (enrichWeather) {
        console.log('Enriching weather data...');
        const games = await this.env.DB.prepare(`
          SELECT * FROM nfl_schedule WHERE week = ?
        `).bind(weekNum).all();
        const gamesResult = games.results || games;

        for (const game of gamesResult) {
          await enrichWeatherForGame(this.env.DB, game);
        }
      }

      // Get matchup count
      const matchupCount = await this.env.DB.prepare(`
        SELECT COUNT(*) as count FROM player_matchups WHERE week = ?
      `).bind(weekNum).first();

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
      // Test basic database connectivity
      const testStmt = this.db.db.prepare('SELECT 1 as test');
      const testResult = await testStmt.first();
      
      // Test schedule table
      const scheduleStmt = this.db.db.prepare('SELECT COUNT(*) as count FROM nfl_schedule');
      const scheduleResult = await scheduleStmt.first();
      
      // Test players table
      const playersStmt = this.db.db.prepare('SELECT COUNT(*) as count FROM players');
      const playersResult = await playersStmt.first();
      
      // Test parameterized query
      const paramStmt = this.db.db.prepare('SELECT COUNT(*) as count FROM players WHERE position = ?');
      const paramResult = await paramStmt.bind('QB').first();
      
      // Test utility functions
      const utilitySchedule = await getNFLSchedule(this.db.db);
      const utilityPlayers = await this.db.getAllPlayers();
      
      // Test cache table
      let cacheTableExists = false;
      let cacheCount = 0;
      try {
        const cacheStmt = this.db.db.prepare('SELECT COUNT(*) as count FROM fantasy_pros_cache');
        const cacheResult = await cacheStmt.first();
        cacheTableExists = true;
        cacheCount = cacheResult.count;
      } catch (error) {
        console.log('Cache table does not exist or error:', error);
      }
      
      // Test FantasyPros data in players table
      let fantasyProsStats = {
        players_with_fantasy_pros_data: 0,
        players_with_tier: 0,
        players_with_projected_points: 0,
        players_with_position_rank: 0,
        sample_player: null
      };
      
      try {
        const fantasyProsStmt = this.db.db.prepare(`
          SELECT COUNT(*) as count FROM players 
          WHERE fantasy_pros_updated_at IS NOT NULL
        `);
        const fantasyProsResult = await fantasyProsStmt.first();
        fantasyProsStats.players_with_fantasy_pros_data = fantasyProsResult.count;
        
        const tierStmt = this.db.db.prepare(`
          SELECT COUNT(*) as count FROM players 
          WHERE tier IS NOT NULL AND tier != 0
        `);
        const tierResult = await tierStmt.first();
        fantasyProsStats.players_with_tier = tierResult.count;
        
        const projectedStmt = this.db.db.prepare(`
          SELECT COUNT(*) as count FROM players 
          WHERE projected_points IS NOT NULL AND projected_points != 0
        `);
        const projectedResult = await projectedStmt.first();
        fantasyProsStats.players_with_projected_points = projectedResult.count;
        
        const rankStmt = this.db.db.prepare(`
          SELECT COUNT(*) as count FROM players 
          WHERE position_rank IS NOT NULL AND position_rank != 0
        `);
        const rankResult = await rankStmt.first();
        fantasyProsStats.players_with_position_rank = rankResult.count;
        
        // Get a sample player with FantasyPros data
        const sampleStmt = this.db.db.prepare(`
          SELECT sleeper_id, search_full_name, position, team, 
                 tier, position_rank, projected_points, value_over_replacement,
                 fantasy_pros_updated_at
          FROM players 
          WHERE fantasy_pros_updated_at IS NOT NULL
          ORDER BY fantasy_pros_updated_at DESC 
          LIMIT 1
        `);
        const sampleResult = await sampleStmt.first();
        fantasyProsStats.sample_player = sampleResult;
      } catch (error) {
        console.log('FantasyPros data analysis error:', error);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Database tests passed',
        data: {
          test: testResult,
          schedule_count: scheduleResult,
          players_count: playersResult,
          param_query: paramResult,
          utility_schedule_count: utilitySchedule.length,
          utility_players_count: utilityPlayers.length,
          cache_table_exists: cacheTableExists,
          cache_count: cacheCount,
          fantasy_pros_stats: fantasyProsStats
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Database test error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestMatchupsDB(request: Request): Promise<Response> {
    try {
      console.log('Testing matchups database connection...');
      
      // Test 1: Simple query
      const testQuery = await this.env.DB.prepare('SELECT 1 as test').first();
      console.log('Test 1 successful:', testQuery);
      
      // Test 2: Count query
      const countQuery = await this.env.DB.prepare('SELECT COUNT(*) as count FROM nfl_schedule').first();
      console.log('Test 2 successful:', countQuery);
      
      console.log('All matchups database tests passed!');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Matchups database tests passed',
        data: {
          test: testQuery,
          count: countQuery
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Matchups database test failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Matchups database test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
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

      const matchupsResult = await this.env.DB.prepare(query).bind(...params).all();
      const matchups = matchupsResult.results || matchupsResult;

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

  async handleSyncWeather(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      
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

      console.log(`Starting weather sync for week ${weekNum}...`);

      // Import the weather enrichment function
      const { enrichWeatherForWeek } = await import('../utils/matchups');
      
      // Enrich weather for the week
      await enrichWeatherForWeek(this.env.DB, weekNum);

      return new Response(JSON.stringify({
        success: true,
        message: `Weather data synced for week ${weekNum}`,
        data: {
          week: weekNum,
          synced_at: new Date().toISOString()
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Weather sync error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleSyncDefenseStrength(request: Request): Promise<Response> {
    try {
      console.log('Starting defense strength sync...');

      // Import the defense strength sync function
      const { syncDefenseStrength } = await import('../utils/matchups');
      
      // Sync defense strength
      await syncDefenseStrength(this.env.DB);

      return new Response(JSON.stringify({
        success: true,
        message: 'Defense strength data synced',
        data: {
          synced_at: new Date().toISOString()
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Defense strength sync error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleUpdateMatchupsWithDefense(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      
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

      console.log(`Updating matchups with defense strength for week ${weekNum}...`);

      // Import the update function
      const { updateMatchupsWithDefenseStrength } = await import('../utils/matchups');
      
      // Update matchups with defense strength
      await updateMatchupsWithDefenseStrength(this.env.DB, weekNum);

      return new Response(JSON.stringify({
        success: true,
        message: `Matchups updated with defense strength for week ${weekNum}`,
        data: {
          week: weekNum,
          updated_at: new Date().toISOString()
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Update matchups with defense error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleClearFantasyProsCache(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const dataType = url.searchParams.get('data_type'); // Optional: clear specific data type
      
      await clearFantasyProsCache(this.db.db, dataType || undefined);
      
      return new Response(JSON.stringify({
        success: true,
        message: dataType ? `Cleared FantasyPros cache for ${dataType}` : 'Cleared all FantasyPros cache',
        data: { cleared_type: dataType || 'all' }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Clear FantasyPros cache error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestFantasyProsCache(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const dataType = url.searchParams.get('data_type') || 'projections_QB';
      const week = url.searchParams.get('week') ? parseInt(url.searchParams.get('week')!) : undefined;
      const season = url.searchParams.get('season') ? parseInt(url.searchParams.get('season')!) : 2024;
      
      const cached = await getCachedFantasyProsResponse(this.db.db, dataType, week, season);
      
      if (cached) {
        return new Response(JSON.stringify({
          success: true,
          message: `Cached FantasyPros response for ${dataType}`,
          data: {
            data_type: dataType,
            week,
            season,
            cached_data: cached,
            sample_player: cached.players?.[0] || null,
            player_count: cached.players?.length || 0
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: `No cached data found for ${dataType}`,
          data: { data_type: dataType, week, season }
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Test FantasyPros cache error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleListFantasyProsCache(request: Request): Promise<Response> {
    try {
      const stmt = this.db.db.prepare(`
        SELECT data_type, week, season, cached_at, 
               LENGTH(response_data) as data_size
        FROM fantasy_pros_cache 
        ORDER BY cached_at DESC
      `);
      
      const result = await stmt.all();
      const cacheEntries = result.results || [];
      
      return new Response(JSON.stringify({
        success: true,
        message: `Found ${cacheEntries.length} cached FantasyPros entries`,
        data: {
          cache_entries: cacheEntries,
          total_entries: cacheEntries.length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('List FantasyPros cache error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleCreateCacheTable(request: Request): Promise<Response> {
    try {
      // Create the cache table if it doesn't exist
      const createTableStmt = this.db.db.prepare(`
        CREATE TABLE IF NOT EXISTS fantasy_pros_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_type TEXT NOT NULL,
          week INTEGER DEFAULT NULL,
          season INTEGER NOT NULL DEFAULT 2024,
          response_data TEXT NOT NULL,
          cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await createTableStmt.run();
      
      // Create indexes
      const createIndex1Stmt = this.db.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_fantasy_pros_cache_type_week_season 
        ON fantasy_pros_cache(data_type, week, season)
      `);
      
      const createIndex2Stmt = this.db.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_fantasy_pros_cache_cached_at 
        ON fantasy_pros_cache(cached_at)
      `);
      
      await createIndex1Stmt.run();
      await createIndex2Stmt.run();
      
      // Test the table
      const testStmt = this.db.db.prepare('SELECT COUNT(*) as count FROM fantasy_pros_cache');
      const testResult = await testStmt.first();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Cache table created successfully',
        data: {
          table_created: true,
          cache_count: testResult.count
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Create cache table error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestRawFantasyPros(request: Request): Promise<Response> {
    try {
      if (!this.env.FANTASYPROS_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'FantasyPros API key not configured'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Test a single API call to see the raw response
      const url = 'https://api.fantasypros.com/public/v2/json/nfl/2025/projections?position=QB&week=0';
      console.log('Testing raw FantasyPros API call to:', url);
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': this.env.FANTASYPROS_API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'Fantasy-Command-Center/1.0',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({
          success: false,
          error: `API Error: ${response.status} ${response.statusText}`,
          details: errorText
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const data = await response.json();
      
      // Extract sample player data
      const samplePlayer = data.players?.[0] || null;
      const playerCount = data.players?.length || 0;
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Raw FantasyPros API response',
        data: {
          api_url: url,
          response_status: response.status,
          player_count: playerCount,
          sample_player: samplePlayer,
          sample_player_stats: samplePlayer?.stats || [],
          response_keys: Object.keys(data),
          full_response: data
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Test raw FantasyPros error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestStoredFantasyPros(request: Request): Promise<Response> {
    try {
      // Get a sample of players with FantasyPros data
      const stmt = this.db.db.prepare(`
        SELECT sleeper_id, search_full_name, position, team, 
               tier, position_rank, projected_points, value_over_replacement,
               fantasy_pros_updated_at
        FROM players 
        WHERE fantasy_pros_updated_at IS NOT NULL
        ORDER BY fantasy_pros_updated_at DESC 
        LIMIT 10
      `);
      
      const result = await stmt.all();
      const players = result.results || [];
      
      // Count players with non-null FantasyPros data
      const nonNullTier = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM players 
        WHERE tier IS NOT NULL AND tier != 0
      `).first();
      
      const nonNullProjected = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM players 
        WHERE projected_points IS NOT NULL AND projected_points != 0
      `).first();
      
      const nonNullRank = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM players 
        WHERE position_rank IS NOT NULL AND position_rank != 0
      `).first();
      
      const [tierCount, projectedCount, rankCount] = await Promise.all([
        nonNullTier,
        nonNullProjected,
        nonNullRank
      ]);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Stored FantasyPros data analysis',
        data: {
          sample_players: players,
          players_with_tier: tierCount.count,
          players_with_projected_points: projectedCount.count,
          players_with_position_rank: rankCount.count,
          total_players_updated: players.length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Test stored FantasyPros error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleUploadFantasyProsCSV(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No file uploaded'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!file.name.toLowerCase().includes('.csv')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'File must be a CSV'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const csvContent = await file.text();
      console.log(`Processing CSV file: ${file.name} (${csvContent.length} characters)`);
      
      // Parse CSV data
      const csvRows = parseFantasyProsCSV(csvContent);
      console.log(`Parsed ${csvRows.length} rows from CSV`);
      
      // Get all players for matching
      const allPlayers = await this.db.getAllPlayers();
      console.log(`Found ${allPlayers.length} players in database`);
      
      // Match CSV data to players
      const { matched, unmatched } = matchCSVToPlayers(csvRows, allPlayers);
      console.log(`Matched ${matched.length} players, ${unmatched.length} unmatched`);
      
      // Update players with CSV data
      if (matched.length > 0) {
        await updatePlayersWithFantasyProsCSV(this.db.db, matched);
        console.log(`Successfully updated ${matched.length} players with FantasyPros CSV data`);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Successfully imported FantasyPros CSV data`,
          data: {
            file_name: file.name,
            csv_rows: csvRows.length,
            matched_count: matched.length,
            unmatched_count: unmatched.length,
            unmatched_sample: unmatched.slice(0, 10),
            matched_sample: matched.slice(0, 5)
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: 'No players matched from CSV data',
          data: {
            file_name: file.name,
            csv_rows: csvRows.length,
            unmatched_count: unmatched.length,
            unmatched_sample: unmatched.slice(0, 10)
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Upload FantasyPros CSV error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestCSVUpload(request: Request): Promise<Response> {
    try {
      return new Response(JSON.stringify({
        success: true,
        message: 'CSV upload endpoint is working',
        data: {
          endpoint: '/upload/fantasy-pros-csv',
          method: 'POST',
          content_type: 'multipart/form-data'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Test CSV upload error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleTestFantasyProsEndpoints(request: Request): Promise<Response> {
    try {
      if (!this.env.FANTASYPROS_API_KEY) {
        return new Response(JSON.stringify({
          success: false,
          error: 'FantasyPros API key not configured'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const apiKey = this.env.FANTASYPROS_API_KEY;
      const results = [];

      // Test different endpoints
      const endpoints = [
        {
          name: '2025 Week 1 Projections',
          url: 'https://api.fantasypros.com/public/v2/json/nfl/2025/projections?position=RB&week=1'
        },
        {
          name: '2025 Week 1 Rankings',
          url: 'https://api.fantasypros.com/public/v2/json/nfl/2025/consensus-rankings?position=RB&week=1'
        },
        {
          name: '2025 Preseason Projections',
          url: 'https://api.fantasypros.com/public/v2/json/nfl/2025/projections?position=RB&week=0'
        },
        {
          name: '2024 Week 1 Projections (for comparison)',
          url: 'https://api.fantasypros.com/public/v2/json/nfl/2024/projections?position=RB&week=1'
        }
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint.name}`);
          
          const response = await fetch(endpoint.url, {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
              'User-Agent': 'Fantasy-Command-Center/1.0',
            },
          });
          
          const result = {
            name: endpoint.name,
            url: endpoint.url,
            status: response.status,
            statusText: response.statusText,
            success: response.ok
          };
          
          if (response.ok) {
            const data = await response.json();
            result.data = {
              has_players: !!data.players,
              player_count: data.players?.length || 0,
              sample_player: data.players?.[0] || null,
              response_keys: Object.keys(data)
            };
          } else {
            const errorText = await response.text();
            result.error = errorText;
          }
          
          results.push(result);
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          results.push({
            name: endpoint.name,
            url: endpoint.url,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          });
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'FantasyPros API endpoint test results',
        data: {
          api_key_configured: true,
          results: results
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Test FantasyPros endpoints error:', error);
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