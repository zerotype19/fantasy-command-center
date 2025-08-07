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

  // Process only the first game for debugging
  const game = schedule[0];
  if (!game) {
    console.log('No games found for this week');
    return;
  }

  const homeTeam = game.home_team;
  const awayTeam = game.away_team;
  const gameId = game.game_id;

  console.log(`Processing game: ${awayTeam} @ ${homeTeam} (game_id: ${gameId})`);

  const homePlayers = players.filter((p: any) => p.team === homeTeam);
  const awayPlayers = players.filter((p: any) => p.team === awayTeam);

  console.log(`Found ${homePlayers.length} home players and ${awayPlayers.length} away players`);

  // Process only the first player for debugging
  const allPlayers = [...homePlayers, ...awayPlayers];
  if (allPlayers.length === 0) {
    console.log('No players found for this game');
    return;
  }

  const player = allPlayers[0];
  const isHome = player.team === homeTeam;
  const opponentTeam = isHome ? awayTeam : homeTeam;

  // Get previous game for rest days calculation (skip for now to debug)
  let restDays = null;

  // Get opponent defense strength (skip for now to debug)
  let defenseRank = null;

  // Insert or replace matchup
  try {
    console.log(`Inserting matchup for player ${player.sleeper_id}`);
    
    // Simplified insert for debugging
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO player_matchups (
        player_id, week, game_id, opponent_team, is_home
      ) VALUES (?, ?, ?, ?, ?)
    `);
    await insertStmt.bind(
      player.sleeper_id,
      week,
      gameId,
      opponentTeam,
      isHome ? 1 : 0
    ).run();
    
    console.log(`Successfully inserted matchup for player ${player.sleeper_id}`);
  } catch (error) {
    console.error(`Error inserting matchup for player ${player.sleeper_id}:`, error);
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

export async function syncDefenseStrength(db: any): Promise<void> {
  console.log('Syncing defense strength from FantasyPros...');
  
  try {
    // This would normally call FantasyPros API
    // For now, we'll create some sample data
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

    for (const defense of sampleDefenses) {
      await db.prepare(`
        INSERT OR REPLACE INTO defense_strength (team, ecr_rank, tier, pos_rank)
        VALUES (?, ?, ?, ?)
      `).run(defense.team, defense.ecr_rank, defense.tier, defense.pos_rank);
    }

    console.log('Defense strength synced successfully');
  } catch (error) {
    console.error('Error syncing defense strength:', error);
  }
}
