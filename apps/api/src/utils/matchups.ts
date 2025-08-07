import { stadiumCoordinates } from '../constants/stadiumLocations';

export interface PlayerMatchup {
  player_id: number;
  week: number;
  game_id: string;
  opponent_team: string;
  is_home: boolean;
  game_date: string;
  game_time: string;
  network: string;
  weather_flag?: string;
  rest_days?: number;
  opponent_position_rank?: number;
  weather_forecast?: string;
  temperature_low?: number;
  temperature_high?: number;
  precipitation_chance?: number;
  wind_speed?: string;
}

export async function generatePlayerMatchupsForWeek(db: any, week: number): Promise<void> {
  console.log(`Generating player matchups for week ${week}...`);

  // Get schedule for the week
  console.log(`Fetching schedule for week ${week}...`);
  let schedule;
  try {
    console.log(`Executing query: SELECT * FROM nfl_schedule WHERE week = ${week}`);
    const stmt = db.prepare(`
      SELECT * FROM nfl_schedule WHERE week = ?
    `);
    const result = await stmt.bind(week).all();
    schedule = result.results || result;
    console.log(`Found ${schedule.length} games for week ${week}`);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }

  // Get all players with team information
  console.log('Fetching players with team information...');
  let players;
  try {
    const playersStmt = db.prepare(`
      SELECT * FROM players WHERE team IS NOT NULL AND team != ''
    `);
    const playersResult = await playersStmt.all();
    players = playersResult.results || playersResult;
    console.log(`Found ${players.length} players with team information`);
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }

  console.log(`Found ${schedule.length} games and ${players.length} players for week ${week}`);

  // Process all games
  for (const game of schedule) {
    const homeTeam = game.home_team;
    const awayTeam = game.away_team;
    const gameId = game.game_id;

    console.log(`Processing game: ${awayTeam} @ ${homeTeam} (game_id: ${gameId})`);

    const homePlayers = players.filter((p: any) => p.team === homeTeam);
    const awayPlayers = players.filter((p: any) => p.team === awayTeam);

    console.log(`Found ${homePlayers.length} home players and ${awayPlayers.length} away players`);

    // Process all players for this game
    const allPlayers = [...homePlayers, ...awayPlayers];
    if (allPlayers.length === 0) {
      console.log('No players found for this game');
      continue;
    }

    for (const player of allPlayers) {
      const isHome = player.team === homeTeam;
      const opponentTeam = isHome ? awayTeam : homeTeam;

      // Get previous game for rest days calculation
      let restDays = null;
      try {
        const prevGameStmt = db.prepare(`
          SELECT game_date FROM player_matchups
          WHERE player_id = ? AND week < ?
          ORDER BY week DESC LIMIT 1
        `);
        const prevGameResult = await prevGameStmt.bind(player.sleeper_id, week).all();
        const prevGame = prevGameResult.results || prevGameResult;
        
        if (prevGame.length > 0 && game.game_date) {
          const prevDate = new Date(prevGame[0].game_date);
          const thisDate = new Date(game.game_date);
          restDays = Math.floor((thisDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      } catch (error) {
        console.log(`Error calculating rest days for player ${player.sleeper_id}:`, error);
      }

      // Get opponent defense strength
      let defenseRank = null;
      try {
        const defenseStmt = db.prepare(`
          SELECT ecr_rank FROM defense_strength WHERE team = ?
        `);
        const defenseResult = await defenseStmt.bind(opponentTeam).first();
        if (defenseResult) {
          defenseRank = defenseResult.ecr_rank;
        }
      } catch (error) {
        console.log(`Error getting defense rank for ${opponentTeam}:`, error);
      }

      // Insert or replace matchup with all fields
      try {
        console.log(`Inserting matchup for player ${player.sleeper_id}`);
        
        const insertStmt = db.prepare(`
          INSERT OR REPLACE INTO player_matchups (
            player_id, week, game_id, opponent_team, is_home, game_date, game_time, network,
            rest_days, opponent_position_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        await insertStmt.bind(
          player.sleeper_id,
          week,
          gameId,
          opponentTeam,
          isHome ? 1 : 0,
          game.game_date || null,
          game.kickoff_time || null,
          game.network || null,
          restDays,
          defenseRank
        ).run();
        
        console.log(`Successfully inserted matchup for player ${player.sleeper_id}`);
      } catch (error) {
        console.error(`Error inserting matchup for player ${player.sleeper_id}:`, error);
      }
    }
  }

  console.log(`Completed generating matchups for week ${week}`);
}

export async function enrichWeatherForGame(db: any, game: any): Promise<void> {
  const { lat, lon } = stadiumCoordinates[game.home_team as keyof typeof stadiumCoordinates] || {};
  if (!lat || !lon) {
    console.log(`No coordinates found for ${game.home_team}`);
    return;
  }

  try {
    // Get weather forecast from NOAA API
    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: { "User-Agent": "FantasyCommandCenter (fantasy-command-center@example.com)" }
    });

    if (!pointRes.ok) {
      console.log(`Failed to get weather points for ${game.home_team}: ${pointRes.status}`);
      return;
    }

    const pointData = await pointRes.json();
    const forecastUrl = pointData.properties?.forecast;
    
    if (!forecastUrl) {
      console.log(`No forecast URL found for ${game.home_team}`);
      return;
    }

    const forecastRes = await fetch(forecastUrl, {
      headers: { "User-Agent": "FantasyCommandCenter" }
    });

    if (!forecastRes.ok) {
      console.log(`Failed to get forecast for ${game.home_team}: ${forecastRes.status}`);
      return;
    }

    const forecastData = await forecastRes.json();
    const periods = forecastData.properties?.periods;
    
    if (!periods || periods.length === 0) {
      console.log(`No forecast periods found for ${game.home_team}`);
      return;
    }

    const gameDate = new Date(game.game_date).toDateString();
    const matchingForecast = periods.find((p: any) => 
      new Date(p.startTime).toDateString() === gameDate
    );

    if (!matchingForecast) {
      console.log(`No matching forecast found for game date ${gameDate}`);
      return;
    }

    // Parse temperature
    const temp = matchingForecast.temperature;
    const tempLow = temp < 60 ? temp : null;
    const tempHigh = temp > 60 ? temp : null;

    // Update weather data for all players in this game
    await db.prepare(`
      UPDATE player_matchups
      SET
        weather_forecast = ?,
        temperature_low = ?,
        temperature_high = ?,
        precipitation_chance = ?,
        wind_speed = ?
      WHERE game_id = ?
    `).run(
      matchingForecast.shortForecast,
      tempLow,
      tempHigh,
      matchingForecast.probabilityOfPrecipitation?.value || null,
      matchingForecast.windSpeed || null,
      game.game_id
    );

    console.log(`Updated weather for ${game.home_team} vs ${game.away_team}: ${matchingForecast.shortForecast}`);
  } catch (error) {
    console.error(`Error enriching weather for ${game.home_team}:`, error);
  }
}

export async function enrichWeatherForWeek(db: any, week: number): Promise<void> {
  console.log(`Enriching weather for week ${week}...`);

  try {
    // Get all games for the week
    const scheduleStmt = db.prepare(`
      SELECT * FROM nfl_schedule WHERE week = ?
    `);
    const scheduleResult = await scheduleStmt.bind(week).all();
    const schedule = scheduleResult.results || scheduleResult;

    console.log(`Found ${schedule.length} games to enrich with weather data`);

    // Process each game
    for (const game of schedule) {
      console.log(`Enriching weather for game: ${game.away_team} @ ${game.home_team}`);
      await enrichWeatherForGame(db, game);
      
      // Add a small delay to respect NOAA API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Completed weather enrichment for week ${week}`);
  } catch (error) {
    console.error(`Error enriching weather for week ${week}:`, error);
    throw error;
  }
}

export async function syncDefenseStrength(db: any): Promise<void> {
  console.log('Syncing defense strength from FantasyPros...');
  
  try {
    // Call FantasyPros API for defense rankings
    const apiKey = process.env.FANTASYPROS_API_KEY;
    if (!apiKey) {
      console.log('No FantasyPros API key found, using sample data');
      // Use sample data as fallback
      const sampleDefenses = [
        { team: 'SF', ecr_rank: 1, tier: 'Tier 1', pos_rank: 1 },
        { team: 'DAL', ecr_rank: 2, tier: 'Tier 1', pos_rank: 2 },
        { team: 'BAL', ecr_rank: 3, tier: 'Tier 1', pos_rank: 3 },
        { team: 'KC', ecr_rank: 4, tier: 'Tier 2', pos_rank: 4 },
        { team: 'BUF', ecr_rank: 5, tier: 'Tier 2', pos_rank: 5 },
        { team: 'NE', ecr_rank: 6, tier: 'Tier 2', pos_rank: 6 },
        { team: 'CLE', ecr_rank: 7, tier: 'Tier 2', pos_rank: 7 },
        { team: 'NYJ', ecr_rank: 8, tier: 'Tier 3', pos_rank: 8 },
        { team: 'PIT', ecr_rank: 9, tier: 'Tier 3', pos_rank: 9 },
        { team: 'CIN', ecr_rank: 10, tier: 'Tier 3', pos_rank: 10 },
        { team: 'LAR', ecr_rank: 11, tier: 'Tier 3', pos_rank: 11 },
        { team: 'PHI', ecr_rank: 12, tier: 'Tier 4', pos_rank: 12 },
        { team: 'GB', ecr_rank: 13, tier: 'Tier 4', pos_rank: 13 },
        { team: 'MIN', ecr_rank: 14, tier: 'Tier 4', pos_rank: 14 },
        { team: 'DET', ecr_rank: 15, tier: 'Tier 4', pos_rank: 15 },
        { team: 'CHI', ecr_rank: 16, tier: 'Tier 5', pos_rank: 16 },
        { team: 'ATL', ecr_rank: 17, tier: 'Tier 5', pos_rank: 17 },
        { team: 'CAR', ecr_rank: 18, tier: 'Tier 5', pos_rank: 18 },
        { team: 'NO', ecr_rank: 19, tier: 'Tier 5', pos_rank: 19 },
        { team: 'TB', ecr_rank: 20, tier: 'Tier 6', pos_rank: 20 },
        { team: 'ARI', ecr_rank: 21, tier: 'Tier 6', pos_rank: 21 },
        { team: 'SEA', ecr_rank: 22, tier: 'Tier 6', pos_rank: 22 },
        { team: 'HOU', ecr_rank: 23, tier: 'Tier 6', pos_rank: 23 },
        { team: 'IND', ecr_rank: 24, tier: 'Tier 7', pos_rank: 24 },
        { team: 'JAX', ecr_rank: 25, tier: 'Tier 7', pos_rank: 25 },
        { team: 'TEN', ecr_rank: 26, tier: 'Tier 7', pos_rank: 26 },
        { team: 'DEN', ecr_rank: 27, tier: 'Tier 7', pos_rank: 27 },
        { team: 'LV', ecr_rank: 28, tier: 'Tier 8', pos_rank: 28 },
        { team: 'LAC', ecr_rank: 29, tier: 'Tier 8', pos_rank: 29 },
        { team: 'NYG', ecr_rank: 30, tier: 'Tier 8', pos_rank: 30 },
        { team: 'WAS', ecr_rank: 31, tier: 'Tier 8', pos_rank: 31 },
        { team: 'MIA', ecr_rank: 32, tier: 'Tier 8', pos_rank: 32 }
      ];

      // Clear existing data
      await db.prepare('DELETE FROM defense_strength').run();

      // Insert sample data
      const insertStmt = db.prepare(`
        INSERT INTO defense_strength (team, ecr_rank, tier, pos_rank)
        VALUES (?, ?, ?, ?)
      `);

      for (const defense of sampleDefenses) {
        await insertStmt.bind(
          defense.team,
          defense.ecr_rank,
          defense.tier,
          defense.pos_rank
        ).run();
      }

      console.log(`Synced ${sampleDefenses.length} defense rankings (sample data)`);
      return;
    }

    // Call FantasyPros API
    const response = await fetch('https://api.fantasypros.com/public/v2/rankings/nfl/defense/consensus-cheatsheets', {
      headers: {
        'x-api-key': apiKey,
        'User-Agent': 'FantasyCommandCenter/1.0'
      }
    });

    if (!response.ok) {
      console.log(`FantasyPros API error: ${response.status}, using sample data`);
      // Fall back to sample data
      return;
    }

    const data = await response.json();
    const defenses = data.rankings || [];

    // Clear existing data
    await db.prepare('DELETE FROM defense_strength').run();

    // Insert real data
    const insertStmt = db.prepare(`
      INSERT INTO defense_strength (team, ecr_rank, tier, pos_rank)
      VALUES (?, ?, ?, ?)
    `);

    for (const defense of defenses) {
      await insertStmt.bind(
        defense.team,
        defense.ecr_rank,
        defense.tier,
        defense.pos_rank
      ).run();
    }

    console.log(`Synced ${defenses.length} defense rankings from FantasyPros`);
  } catch (error) {
    console.error('Error syncing defense strength:', error);
  }
}

export async function updateMatchupsWithDefenseStrength(db: any, week: number): Promise<void> {
  console.log(`Updating matchups with defense strength for week ${week}...`);

  try {
    // Get all matchups for the week
    const matchupsStmt = db.prepare(`
      SELECT pm.*, p.team as player_team
      FROM player_matchups pm
      JOIN players p ON pm.player_id = p.sleeper_id
      WHERE pm.week = ?
    `);
    const matchupsResult = await matchupsStmt.bind(week).all();
    const matchups = matchupsResult.results || matchupsResult;

    console.log(`Found ${matchups.length} matchups to update with defense strength`);

    // Update each matchup with opponent defense rank
    const updateStmt = db.prepare(`
      UPDATE player_matchups 
      SET opponent_position_rank = ?
      WHERE player_id = ? AND week = ?
    `);

    for (const matchup of matchups) {
      try {
        const defenseStmt = db.prepare(`
          SELECT ecr_rank FROM defense_strength WHERE team = ?
        `);
        const defenseResult = await defenseStmt.bind(matchup.opponent_team).first();
        
        if (defenseResult) {
          await updateStmt.bind(
            defenseResult.ecr_rank,
            matchup.player_id,
            week
          ).run();
        }
      } catch (error) {
        console.log(`Error updating defense strength for player ${matchup.player_id}:`, error);
      }
    }

    console.log(`Completed updating defense strength for week ${week}`);
  } catch (error) {
    console.error(`Error updating defense strength for week ${week}:`, error);
    throw error;
  }
}
