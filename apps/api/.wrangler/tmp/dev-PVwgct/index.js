var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-41kHW4/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-41kHW4/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// .wrangler/tmp/bundle-41kHW4/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-41kHW4/strip-cf-connecting-ip-header.js"() {
    "use strict";
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// ../../node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/constants/stadiumLocations.ts
var stadiumCoordinates;
var init_stadiumLocations = __esm({
  "src/constants/stadiumLocations.ts"() {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    stadiumCoordinates = {
      // AFC Teams
      BUF: { lat: 42.7737, lon: -78.7869 },
      // Highmark Stadium
      MIA: { lat: 25.9583, lon: -80.2389 },
      // Hard Rock Stadium
      NE: { lat: 42.0909, lon: -71.2643 },
      // Gillette Stadium
      NYJ: { lat: 40.8136, lon: -74.0744 },
      // MetLife Stadium
      BAL: { lat: 39.2783, lon: -76.6227 },
      // M&T Bank Stadium
      CIN: { lat: 39.0955, lon: -84.516 },
      // Paycor Stadium
      CLE: { lat: 41.5061, lon: -81.6995 },
      // FirstEnergy Stadium
      PIT: { lat: 40.4468, lon: -80.0158 },
      // Acrisure Stadium
      HOU: { lat: 29.6847, lon: -95.4107 },
      // NRG Stadium
      IND: { lat: 39.7601, lon: -86.1639 },
      // Lucas Oil Stadium
      JAX: { lat: 30.3239, lon: -81.6372 },
      // TIAA Bank Field
      TEN: { lat: 36.1663, lon: -86.7714 },
      // Nissan Stadium
      DEN: { lat: 39.7439, lon: -105.0201 },
      // Empower Field at Mile High
      KC: { lat: 39.049, lon: -94.4839 },
      // Arrowhead Stadium
      LV: { lat: 36.0908, lon: -115.1836 },
      // Allegiant Stadium
      LAC: { lat: 33.9533, lon: -118.3389 },
      // SoFi Stadium
      // NFC Teams
      DAL: { lat: 32.7473, lon: -97.0945 },
      // AT&T Stadium
      NYG: { lat: 40.8136, lon: -74.0744 },
      // MetLife Stadium
      PHI: { lat: 39.9008, lon: -75.1674 },
      // Lincoln Financial Field
      WAS: { lat: 38.9076, lon: -76.8644 },
      // FedExField
      CHI: { lat: 41.8623, lon: -87.6166 },
      // Soldier Field
      DET: { lat: 42.34, lon: -83.0456 },
      // Ford Field
      GB: { lat: 44.5013, lon: -88.0622 },
      // Lambeau Field
      MIN: { lat: 44.974, lon: -93.2583 },
      // U.S. Bank Stadium
      ATL: { lat: 33.7553, lon: -84.4006 },
      // Mercedes-Benz Stadium
      CAR: { lat: 35.2253, lon: -80.8431 },
      // Bank of America Stadium
      NO: { lat: 29.9511, lon: -90.0815 },
      // Caesars Superdome
      TB: { lat: 27.9761, lon: -82.5033 },
      // Raymond James Stadium
      ARI: { lat: 33.5276, lon: -112.2626 },
      // State Farm Stadium
      LAR: { lat: 33.9533, lon: -118.3389 },
      // SoFi Stadium
      SF: { lat: 37.403, lon: -121.97 },
      // Levi's Stadium
      SEA: { lat: 47.5952, lon: -122.3316 }
      // Lumen Field
    };
  }
});

// src/utils/matchups.ts
var matchups_exports = {};
__export(matchups_exports, {
  enrichWeatherForGame: () => enrichWeatherForGame,
  enrichWeatherForWeek: () => enrichWeatherForWeek,
  generatePlayerMatchupsForWeek: () => generatePlayerMatchupsForWeek,
  syncDefenseStrength: () => syncDefenseStrength,
  updateMatchupsWithDefenseStrength: () => updateMatchupsWithDefenseStrength
});
async function generatePlayerMatchupsForWeek(db, week) {
  console.log(`Generating player matchups for week ${week}...`);
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
    console.error("Error fetching schedule:", error);
    throw error;
  }
  console.log("Fetching players with team information...");
  let players;
  try {
    const playersStmt = db.prepare(`
      SELECT * FROM players WHERE team IS NOT NULL AND team != ''
    `);
    const playersResult = await playersStmt.all();
    players = playersResult.results || playersResult;
    console.log(`Found ${players.length} players with team information`);
  } catch (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
  console.log(`Found ${schedule.length} games and ${players.length} players for week ${week}`);
  for (const game of schedule) {
    const homeTeam = game.home_team;
    const awayTeam = game.away_team;
    const gameId = game.game_id;
    console.log(`Processing game: ${awayTeam} @ ${homeTeam} (game_id: ${gameId})`);
    const homePlayers = players.filter((p) => p.team === homeTeam);
    const awayPlayers = players.filter((p) => p.team === awayTeam);
    console.log(`Found ${homePlayers.length} home players and ${awayPlayers.length} away players`);
    const allPlayers = [...homePlayers, ...awayPlayers];
    if (allPlayers.length === 0) {
      console.log("No players found for this game");
      continue;
    }
    for (const player of allPlayers) {
      const isHome = player.team === homeTeam;
      const opponentTeam = isHome ? awayTeam : homeTeam;
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
          restDays = Math.floor((thisDate.getTime() - prevDate.getTime()) / (1e3 * 60 * 60 * 24));
        }
      } catch (error) {
        console.log(`Error calculating rest days for player ${player.sleeper_id}:`, error);
      }
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
async function enrichWeatherForGame(db, game) {
  const { lat, lon } = stadiumCoordinates[game.home_team] || {};
  if (!lat || !lon) {
    console.log(`No coordinates found for ${game.home_team}`);
    return;
  }
  try {
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
    const matchingForecast = periods.find(
      (p) => new Date(p.startTime).toDateString() === gameDate
    );
    if (!matchingForecast) {
      console.log(`No matching forecast found for game date ${gameDate}`);
      return;
    }
    const temp = matchingForecast.temperature;
    const tempLow = temp < 60 ? temp : null;
    const tempHigh = temp > 60 ? temp : null;
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
async function enrichWeatherForWeek(db, week) {
  console.log(`Enriching weather for week ${week}...`);
  try {
    const scheduleStmt = db.prepare(`
      SELECT * FROM nfl_schedule WHERE week = ?
    `);
    const scheduleResult = await scheduleStmt.bind(week).all();
    const schedule = scheduleResult.results || scheduleResult;
    console.log(`Found ${schedule.length} games to enrich with weather data`);
    for (const game of schedule) {
      console.log(`Enriching weather for game: ${game.away_team} @ ${game.home_team}`);
      await enrichWeatherForGame(db, game);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log(`Completed weather enrichment for week ${week}`);
  } catch (error) {
    console.error(`Error enriching weather for week ${week}:`, error);
    throw error;
  }
}
async function syncDefenseStrength(db) {
  console.log("Syncing defense strength from FantasyPros...");
  try {
    const apiKey = process.env.FANTASYPROS_API_KEY;
    if (!apiKey) {
      console.log("No FantasyPros API key found, using sample data");
      const sampleDefenses = [
        { team: "SF", ecr_rank: 1, tier: "Tier 1", pos_rank: 1 },
        { team: "DAL", ecr_rank: 2, tier: "Tier 1", pos_rank: 2 },
        { team: "BAL", ecr_rank: 3, tier: "Tier 1", pos_rank: 3 },
        { team: "KC", ecr_rank: 4, tier: "Tier 2", pos_rank: 4 },
        { team: "BUF", ecr_rank: 5, tier: "Tier 2", pos_rank: 5 },
        { team: "NE", ecr_rank: 6, tier: "Tier 2", pos_rank: 6 },
        { team: "CLE", ecr_rank: 7, tier: "Tier 2", pos_rank: 7 },
        { team: "NYJ", ecr_rank: 8, tier: "Tier 3", pos_rank: 8 },
        { team: "PIT", ecr_rank: 9, tier: "Tier 3", pos_rank: 9 },
        { team: "CIN", ecr_rank: 10, tier: "Tier 3", pos_rank: 10 },
        { team: "LAR", ecr_rank: 11, tier: "Tier 3", pos_rank: 11 },
        { team: "PHI", ecr_rank: 12, tier: "Tier 4", pos_rank: 12 },
        { team: "GB", ecr_rank: 13, tier: "Tier 4", pos_rank: 13 },
        { team: "MIN", ecr_rank: 14, tier: "Tier 4", pos_rank: 14 },
        { team: "DET", ecr_rank: 15, tier: "Tier 4", pos_rank: 15 },
        { team: "CHI", ecr_rank: 16, tier: "Tier 5", pos_rank: 16 },
        { team: "ATL", ecr_rank: 17, tier: "Tier 5", pos_rank: 17 },
        { team: "CAR", ecr_rank: 18, tier: "Tier 5", pos_rank: 18 },
        { team: "NO", ecr_rank: 19, tier: "Tier 5", pos_rank: 19 },
        { team: "TB", ecr_rank: 20, tier: "Tier 6", pos_rank: 20 },
        { team: "ARI", ecr_rank: 21, tier: "Tier 6", pos_rank: 21 },
        { team: "SEA", ecr_rank: 22, tier: "Tier 6", pos_rank: 22 },
        { team: "HOU", ecr_rank: 23, tier: "Tier 6", pos_rank: 23 },
        { team: "IND", ecr_rank: 24, tier: "Tier 7", pos_rank: 24 },
        { team: "JAX", ecr_rank: 25, tier: "Tier 7", pos_rank: 25 },
        { team: "TEN", ecr_rank: 26, tier: "Tier 7", pos_rank: 26 },
        { team: "DEN", ecr_rank: 27, tier: "Tier 7", pos_rank: 27 },
        { team: "LV", ecr_rank: 28, tier: "Tier 8", pos_rank: 28 },
        { team: "LAC", ecr_rank: 29, tier: "Tier 8", pos_rank: 29 },
        { team: "NYG", ecr_rank: 30, tier: "Tier 8", pos_rank: 30 },
        { team: "WAS", ecr_rank: 31, tier: "Tier 8", pos_rank: 31 },
        { team: "MIA", ecr_rank: 32, tier: "Tier 8", pos_rank: 32 }
      ];
      await db.prepare("DELETE FROM defense_strength").run();
      const insertStmt2 = db.prepare(`
        INSERT INTO defense_strength (team, ecr_rank, tier, pos_rank)
        VALUES (?, ?, ?, ?)
      `);
      for (const defense of sampleDefenses) {
        await insertStmt2.bind(
          defense.team,
          defense.ecr_rank,
          defense.tier,
          defense.pos_rank
        ).run();
      }
      console.log(`Synced ${sampleDefenses.length} defense rankings (sample data)`);
      return;
    }
    const response = await fetch("https://api.fantasypros.com/public/v2/rankings/nfl/defense/consensus-cheatsheets", {
      headers: {
        "x-api-key": apiKey,
        "User-Agent": "FantasyCommandCenter/1.0"
      }
    });
    if (!response.ok) {
      console.log(`FantasyPros API error: ${response.status}, using sample data`);
      return;
    }
    const data = await response.json();
    const defenses = data.rankings || [];
    await db.prepare("DELETE FROM defense_strength").run();
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
    console.error("Error syncing defense strength:", error);
  }
}
async function updateMatchupsWithDefenseStrength(db, week) {
  console.log(`Updating matchups with defense strength for week ${week}...`);
  try {
    const matchupsStmt = db.prepare(`
      SELECT pm.*, p.team as player_team
      FROM player_matchups pm
      JOIN players p ON pm.player_id = p.sleeper_id
      WHERE pm.week = ?
    `);
    const matchupsResult = await matchupsStmt.bind(week).all();
    const matchups = matchupsResult.results || matchupsResult;
    console.log(`Found ${matchups.length} matchups to update with defense strength`);
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
var init_matchups = __esm({
  "src/utils/matchups.ts"() {
    "use strict";
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    init_stadiumLocations();
    __name(generatePlayerMatchupsForWeek, "generatePlayerMatchupsForWeek");
    __name(enrichWeatherForGame, "enrichWeatherForGame");
    __name(enrichWeatherForWeek, "enrichWeatherForWeek");
    __name(syncDefenseStrength, "syncDefenseStrength");
    __name(updateMatchupsWithDefenseStrength, "updateMatchupsWithDefenseStrength");
  }
});

// .wrangler/tmp/bundle-41kHW4/middleware-loader.entry.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-41kHW4/middleware-insertion-facade.js
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/utils/db.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var DatabaseService = class {
  db;
  constructor(db) {
    this.db = db;
  }
  // Player management
  async getAllPlayers() {
    const result = await this.db.prepare(
      "SELECT * FROM players ORDER BY name"
    ).all();
    return result.results || [];
  }
  async getPlayerByEspnId(espnId) {
    const result = await this.db.prepare(
      "SELECT * FROM players WHERE espn_id = ?"
    ).bind(espnId).first();
    return result;
  }
  async getPlayerBySleeperId(sleeperId) {
    const result = await this.db.prepare(
      "SELECT * FROM players WHERE sleeper_id = ?"
    ).bind(sleeperId).first();
    return result;
  }
  async getPlayersBySleeperIds(sleeperIds) {
    if (sleeperIds.length === 0)
      return [];
    const placeholders = sleeperIds.map(() => "?").join(",");
    const result = await this.db.prepare(
      `SELECT * FROM players WHERE sleeper_id IN (${placeholders})`
    ).bind(...sleeperIds).all();
    return result.results || [];
  }
  async upsertSleeperPlayers(players) {
    if (players.length === 0)
      return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO players (
        sleeper_id, espn_id, name, position, team, status, bye_week,
        age, years_exp, college, weight, height, jersey_number, fantasy_positions,
        fantasy_data_id, search_rank, injury_status, injury_start_date, injury_notes,
        practice_participation, depth_chart_position, depth_chart_order, yahoo_id,
        rotowire_id, rotoworld_id, sportradar_id, first_name, last_name, birth_date,
        birth_city, birth_state, birth_country, high_school, hashtag, team_abbr,
        team_changed_at, gsis_id, swish_id, stats_id, oddsjam_id, opta_id,
        pandascore_id, sport, news_updated, practice_description, injury_body_part,
        search_first_name, search_last_name, search_full_name, metadata, competitions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const batch = players.map(
      (player) => stmt.bind(
        player.sleeper_id,
        player.espn_id || null,
        player.name,
        player.position,
        player.team,
        player.status,
        player.bye_week,
        player.age || null,
        player.years_exp || null,
        player.college || null,
        player.weight || null,
        player.height || null,
        player.jersey_number || null,
        player.fantasy_positions ? JSON.stringify(player.fantasy_positions) : null,
        player.fantasy_data_id || null,
        player.search_rank || null,
        player.injury_status || null,
        player.injury_start_date || null,
        player.injury_notes || null,
        player.practice_participation || null,
        player.depth_chart_position || null,
        player.depth_chart_order || null,
        player.yahoo_id || null,
        player.rotowire_id || null,
        player.rotoworld_id || null,
        player.sportradar_id || null,
        player.first_name || null,
        player.last_name || null,
        player.birth_date || null,
        player.birth_city || null,
        player.birth_state || null,
        player.birth_country || null,
        player.high_school || null,
        player.hashtag || null,
        player.team_abbr || null,
        player.team_changed_at || null,
        player.gsis_id || null,
        player.swish_id || null,
        player.stats_id || null,
        player.oddsjam_id || null,
        player.opta_id || null,
        player.pandascore_id || null,
        player.sport || null,
        player.news_updated || null,
        player.practice_description || null,
        player.injury_body_part || null,
        player.search_first_name || null,
        player.search_last_name || null,
        player.search_full_name || null,
        player.metadata ? JSON.stringify(player.metadata) : null,
        player.competitions ? JSON.stringify(player.competitions) : null
      )
    );
    await this.db.batch(batch);
  }
  // Projection management
  async getProjectionByPlayerId(playerId) {
    const result = await this.db.prepare(
      "SELECT * FROM projections WHERE player_id = ? ORDER BY week DESC LIMIT 1"
    ).bind(playerId).first();
    return result;
  }
  // Trending players management
  async getTrendingPlayers(type, limit = 10) {
    const result = await this.db.prepare(`
      SELECT tp.*, p.name, p.position, p.team, p.status
      FROM trending_players tp
      LEFT JOIN players p ON tp.sleeper_id = p.sleeper_id
      WHERE tp.type = ?
      ORDER BY tp.count DESC, tp.created_at DESC
      LIMIT ?
    `).bind(type, limit).all();
    return result.results || [];
  }
  async getTrendingPlayersByLookback(type, lookbackHours, limit = 10) {
    const result = await this.db.prepare(`
      SELECT tp.*, p.name, p.position, p.team, p.status
      FROM trending_players tp
      LEFT JOIN players p ON tp.sleeper_id = p.sleeper_id
      WHERE tp.type = ? AND tp.lookback_hours = ? AND tp.created_at >= datetime('now', '-${lookbackHours} hours')
      ORDER BY tp.count DESC, tp.created_at DESC
      LIMIT ?
    `).bind(type, lookbackHours, limit).all();
    return result.results || [];
  }
};
__name(DatabaseService, "DatabaseService");
async function upsertTrendingPlayers(db, trendingPlayers, type, lookbackHours) {
  if (trendingPlayers.length === 0)
    return;
  const stmt = db.prepare(`
    INSERT INTO trending_players (player_id, sleeper_id, type, count, lookback_hours)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(player_id, type, lookback_hours) DO UPDATE SET
      count = excluded.count,
      updated_at = CURRENT_TIMESTAMP
  `);
  const batch = trendingPlayers.map(
    (player) => stmt.bind(
      player.player_id,
      player.player_id,
      // sleeper_id is the same as player_id for trending players
      type,
      player.count,
      lookbackHours
    )
  );
  await db.batch(batch);
}
__name(upsertTrendingPlayers, "upsertTrendingPlayers");
async function updatePlayerFantasyProsData(db, playerUpdates) {
  if (playerUpdates.length === 0)
    return;
  const stmt = db.prepare(`
    UPDATE players SET 
      search_rank = ?,
      tier = ?,
      position_rank = ?,
      value_over_replacement = ?,
      auction_value = ?,
      projected_points = ?,
      sos_rank = ?,
      fantasy_pros_updated_at = CURRENT_TIMESTAMP
    WHERE sleeper_id = ?
  `);
  const batch = playerUpdates.map(
    (update) => stmt.bind(
      update.search_rank || null,
      update.tier || null,
      update.position_rank || null,
      update.value_over_replacement || null,
      update.auction_value || null,
      update.projected_points || null,
      update.sos_rank || null,
      update.sleeper_id
    )
  );
  await db.batch(batch);
  console.log(`Updated ${playerUpdates.length} players with FantasyPros data`);
}
__name(updatePlayerFantasyProsData, "updatePlayerFantasyProsData");
async function getPlayersWithFantasyData(db, week, season) {
  let query = `
    SELECT p.*, 
           MAX(fp.ecr_rank) as ecr_rank, 
           MAX(fp.projected_points) as projected_points, 
           MAX(fp.auction_value) as auction_value, 
           MAX(fp.sos_rank) as sos_rank, 
           MAX(fp.tier) as tier, 
           MAX(fp.position_rank) as position_rank, 
           MAX(fp.value_over_replacement) as value_over_replacement, 
           MAX(fp.source) as source
    FROM players p
    LEFT JOIN fantasy_pros_data fp ON p.sleeper_id = fp.sleeper_id
  `;
  const params = [];
  if (week || season) {
    query += " WHERE ";
    const conditions = [];
    if (week) {
      conditions.push("fp.week = ?");
      params.push(week);
    }
    if (season) {
      conditions.push("fp.season = ?");
      params.push(season);
    }
    query += conditions.join(" AND ");
  }
  query += " GROUP BY p.sleeper_id ORDER BY p.name";
  const result = await db.prepare(query).bind(...params).all();
  return result.results || [];
}
__name(getPlayersWithFantasyData, "getPlayersWithFantasyData");
async function upsertNFLSchedule(db, games) {
  if (games.length === 0)
    return;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO nfl_schedule (
      game_id, week, game_date, kickoff_time, home_team, away_team, 
      location, network, game_type, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const batch = games.map(
    (game) => stmt.bind(
      game.game_id,
      game.week,
      game.game_date,
      game.kickoff_time || null,
      game.home_team,
      game.away_team,
      game.location || null,
      game.network || null,
      game.game_type
    )
  );
  await db.batch(batch);
  console.log(`Upserted ${games.length} NFL schedule games`);
}
__name(upsertNFLSchedule, "upsertNFLSchedule");
async function getNFLSchedule(db, week) {
  let query = "SELECT * FROM nfl_schedule";
  const params = [];
  if (week) {
    query += " WHERE week = ?";
    params.push(week);
  }
  query += " ORDER BY game_date, kickoff_time";
  const result = await db.prepare(query).bind(...params).all();
  return result.results || [];
}
__name(getNFLSchedule, "getNFLSchedule");

// src/services/noaa.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/utils/fetchHelpers.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var FetchError = class extends Error {
  constructor(message, status, url, response) {
    super(message);
    this.status = status;
    this.url = url;
    this.response = response;
    this.name = "FetchError";
  }
};
__name(FetchError, "FetchError");
async function fetchWithRetry(url, options = {}) {
  const {
    retries = 3,
    retryDelay = 1e3,
    timeout = 1e4,
    ...fetchOptions
  } = options;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url,
          response
        );
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}
__name(fetchWithRetry, "fetchWithRetry");
async function fetchJson(url, options = {}) {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  return response.json();
}
__name(fetchJson, "fetchJson");
function createRateLimiter(maxRequests, timeWindow) {
  const requests = [];
  return /* @__PURE__ */ __name(function checkRateLimit() {
    const now = Date.now();
    const windowStart = now - timeWindow;
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    if (requests.length >= maxRequests) {
      return false;
    }
    requests.push(now);
    return true;
  }, "checkRateLimit");
}
__name(createRateLimiter, "createRateLimiter");
var espnRateLimiter = createRateLimiter(1, 6e4);
var fantasyProsRateLimiter = createRateLimiter(10, 6e4);
var noaaRateLimiter = createRateLimiter(5, 6e4);

// src/services/noaa.ts
var NOAAService = class {
  baseUrl;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async getGameWeather(lat, lon, date) {
    if (!noaaRateLimiter()) {
      throw new Error("NOAA API rate limit exceeded. Please try again later.");
    }
    try {
      const gridResponse = await fetchJson(`${this.baseUrl}/points/${lat},${lon}`);
      if (!gridResponse.properties?.gridId || !gridResponse.properties?.gridX || !gridResponse.properties?.gridY) {
        throw new Error("Invalid grid data received from NOAA");
      }
      const { gridId, gridX, gridY } = gridResponse.properties;
      const forecastUrl = `${this.baseUrl}/grids/${gridId}/${gridX},${gridY}/forecast`;
      const forecastResponse = await fetchJson(forecastUrl);
      if (forecastResponse.error) {
        throw new Error(`NOAA API error: ${forecastResponse.error}`);
      }
      const weatherData = this.parseForecastForDate(forecastResponse, date);
      return {
        latitude: lat,
        longitude: lon,
        date,
        ...weatherData
      };
    } catch (error) {
      console.error("NOAA API error:", error);
      throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  parseForecastForDate(response, targetDate) {
    if (!response.properties?.periods || !Array.isArray(response.properties.periods)) {
      return {};
    }
    const targetPeriod = response.properties.periods.find((period) => {
      return period.shortForecast && period.shortForecast.toLowerCase().includes(targetDate.toLowerCase());
    });
    if (!targetPeriod) {
      return {};
    }
    return {
      temperature: targetPeriod.temperature,
      conditions: targetPeriod.shortForecast,
      windSpeed: this.parseWindSpeed(targetPeriod.windSpeed),
      windDirection: targetPeriod.windDirection,
      humidity: targetPeriod.relativeHumidity?.value,
      precipitation: targetPeriod.probabilityOfPrecipitation?.value
    };
  }
  parseWindSpeed(windSpeedStr) {
    const match = windSpeedStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : void 0;
  }
  async getWeatherForStadium(stadiumName, date) {
    const stadiumCoords = {
      "Lambeau Field": { lat: 44.5013, lon: -88.0622 },
      "Soldier Field": { lat: 41.8623, lon: -87.6166 },
      "Ford Field": { lat: 42.34, lon: -83.0456 },
      "MetLife Stadium": { lat: 40.8135, lon: -74.0741 }
      // Add more stadiums as needed
    };
    const coords = stadiumCoords[stadiumName];
    if (!coords) {
      console.warn(`No coordinates found for stadium: ${stadiumName}`);
      return null;
    }
    return this.getGameWeather(coords.lat, coords.lon, date);
  }
  async getWeatherForTeam(teamAbbreviation, date) {
    const teamStadiums = {
      "GB": "Lambeau Field",
      "CHI": "Soldier Field",
      "DET": "Ford Field",
      "NYG": "MetLife Stadium",
      "NYJ": "MetLife Stadium"
      // Add more teams as needed
    };
    const stadiumName = teamStadiums[teamAbbreviation];
    if (!stadiumName) {
      console.warn(`No stadium found for team: ${teamAbbreviation}`);
      return null;
    }
    return this.getWeatherForStadium(stadiumName, date);
  }
};
__name(NOAAService, "NOAAService");

// src/handlers/league.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/services/espn.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";
async function fetchLeagueData(leagueId) {
  const url = `${ESPN_BASE_URL}/seasons/2024/segments/0/leagues/${leagueId}?view=mSettings&view=mRoster&view=mTeam`;
  console.log(`Fetching ESPN league data for league ${leagueId}`);
  const response = await fetchWithRetry(url, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  }, 1);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ESPN league data for league ${leagueId}:`, {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500)
    });
    if (response.status === 401) {
      throw new Error(`League ${leagueId} is private or requires authentication. Please ensure you have access to this league.`);
    } else if (response.status === 404) {
      throw new Error(`League ${leagueId} not found. Please check the league ID.`);
    } else {
      throw new Error(`Failed to fetch ESPN league data: ${response.status} ${response.statusText}`);
    }
  }
  const data = await response.json();
  console.log(`Successfully fetched ESPN league data for league ${leagueId}`);
  return data;
}
__name(fetchLeagueData, "fetchLeagueData");
async function fetchTeamRoster(leagueId, teamId) {
  const url = `${ESPN_BASE_URL}/seasons/2024/segments/0/leagues/${leagueId}?view=mRoster&rosterForTeamId=${teamId}`;
  console.log(`Fetching ESPN team roster for league ${leagueId}, team ${teamId}`);
  const response = await fetchWithRetry(url, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  }, 1);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ESPN team roster for league ${leagueId}, team ${teamId}:`, {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500)
    });
    if (response.status === 401) {
      throw new Error(`League ${leagueId} is private or requires authentication. Please ensure you have access to this league.`);
    } else if (response.status === 404) {
      throw new Error(`League ${leagueId} or team ${teamId} not found. Please check the IDs.`);
    } else {
      throw new Error(`Failed to fetch ESPN team roster: ${response.status} ${response.statusText}`);
    }
  }
  const data = await response.json();
  console.log(`Successfully fetched ESPN team roster for league ${leagueId}, team ${teamId}`);
  return data;
}
__name(fetchTeamRoster, "fetchTeamRoster");
function extractLeagueSettings(leagueData) {
  if (!leagueData || !leagueData.settings) {
    console.error("Missing expected ESPN league settings structure:", leagueData);
    throw new Error("Missing expected ESPN league settings structure");
  }
  const settings = leagueData.settings;
  return {
    scoring_json: JSON.stringify(settings.scoringSettings || {}),
    roster_json: JSON.stringify(settings.rosterSettings || {}),
    keeper_rules_json: JSON.stringify(settings.keeperSettings || {}),
    auction_budget: settings.auctionBudget || 0,
    waiver_budget: settings.waiverBudget || 0
  };
}
__name(extractLeagueSettings, "extractLeagueSettings");

// src/handlers/league.ts
var LeagueHandler = class {
  db;
  constructor(db) {
    this.db = db;
  }
  async handlePost(request) {
    try {
      const body = await request.json();
      const { userId, leagueId, scoringJson, rosterJson, keeperRulesJson, auctionBudget, waiverBudget } = body;
      if (!userId || !leagueId) {
        return new Response(
          JSON.stringify({ error: "userId and leagueId are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      await this.db.upsertLeagueSettings(
        userId,
        leagueId,
        scoringJson || "{}",
        rosterJson || "{}",
        keeperRulesJson || "{}",
        auctionBudget || 0,
        waiverBudget || 0
      );
      return new Response(
        JSON.stringify({ success: true, message: "League settings saved" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("League POST error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save league settings" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleGet(request) {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const leagueId = url.searchParams.get("leagueId");
      if (!userId || !leagueId) {
        return new Response(
          JSON.stringify({ error: "userId and leagueId are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const settings = await this.db.getLeagueSettings(userId, leagueId);
      if (!settings) {
        return new Response(
          JSON.stringify({ error: "League settings not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify(settings),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("League GET error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get league settings" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleGetLeagueSettings(request) {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      const leagueIdIndex = pathParts.indexOf("league") + 1;
      const leagueId = pathParts[leagueIdIndex];
      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: "leagueId is required in URL path" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      console.log(`Fetching league settings for league ${leagueId}...`);
      const leagueData = await fetchLeagueData(leagueId);
      const settings = extractLeagueSettings(leagueData);
      return new Response(
        JSON.stringify({
          success: true,
          league_id: leagueId,
          settings
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("League settings GET error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch league settings" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
__name(LeagueHandler, "LeagueHandler");

// src/handlers/players.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/services/sleeper.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var SLEEPER_BASE_URL = "https://api.sleeper.app/v1";
async function fetchAllPlayers() {
  const url = `${SLEEPER_BASE_URL}/players/nfl`;
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      throw new Error("Sleeper API rate limited \u2014 please try again shortly.");
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch Sleeper player data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch player data from Sleeper");
  }
}
__name(fetchAllPlayers, "fetchAllPlayers");
async function fetchTrendingPlayers(type = "add", lookbackHours = 24) {
  const url = `${SLEEPER_BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookbackHours}`;
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      throw new Error("Sleeper API rate limited \u2014 please try again shortly.");
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch trending players: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch trending players from Sleeper");
  }
}
__name(fetchTrendingPlayers, "fetchTrendingPlayers");
async function fetchAllPlayersComplete() {
  const players = await fetchAllPlayers();
  const allPlayers = [];
  for (const [playerId, player] of Object.entries(players)) {
    if (!player.active)
      continue;
    allPlayers.push(player);
  }
  return allPlayers;
}
__name(fetchAllPlayersComplete, "fetchAllPlayersComplete");
function validatePlayer(player) {
  const requiredFields = ["full_name", "position", "player_id"];
  const missingFields = [];
  for (const field of requiredFields) {
    if (!player[field]) {
      missingFields.push(field);
    }
  }
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
__name(validatePlayer, "validatePlayer");
function transformSleeperPlayer(player) {
  return {
    sleeper_id: player.player_id,
    espn_id: player.espn_id ? player.espn_id.toString() : `SLEEPER_${player.player_id}`,
    // Use real ESPN ID if available
    name: player.full_name,
    position: player.position,
    team: player.team || "FA",
    // Use 'FA' (Free Agent) if no team
    status: player.status || "Active",
    bye_week: null,
    // Sleeper API doesn't provide bye week data
    // Player details
    age: player.age,
    years_exp: player.years_exp,
    college: player.college,
    weight: player.weight,
    height: player.height,
    jersey_number: player.number,
    // Fantasy data
    fantasy_positions: player.fantasy_positions ? JSON.stringify(player.fantasy_positions) : null,
    fantasy_data_id: player.fantasy_data_id,
    search_rank: player.search_rank,
    // Injury/Status data
    injury_status: player.injury_status,
    injury_start_date: player.injury_start_date,
    injury_notes: player.injury_notes,
    practice_participation: player.practice_participation,
    injury_body_part: player.injury_body_part,
    practice_description: player.practice_description,
    // Team/Depth Chart
    depth_chart_position: player.depth_chart_position,
    depth_chart_order: player.depth_chart_order,
    // External IDs
    yahoo_id: player.yahoo_id,
    rotowire_id: player.rotowire_id,
    rotoworld_id: player.rotoworld_id,
    sportradar_id: player.sportradar_id,
    // Additional Sleeper fields
    first_name: player.first_name,
    last_name: player.last_name,
    birth_date: player.birth_date,
    birth_city: player.birth_city,
    birth_state: player.birth_state,
    birth_country: player.birth_country,
    high_school: player.high_school,
    hashtag: player.hashtag,
    team_abbr: player.team_abbr,
    team_changed_at: player.team_changed_at,
    gsis_id: player.gsis_id,
    swish_id: player.swish_id,
    stats_id: player.stats_id,
    oddsjam_id: player.oddsjam_id,
    opta_id: player.opta_id,
    pandascore_id: player.pandascore_id,
    sport: player.sport,
    news_updated: player.news_updated,
    search_first_name: player.search_first_name,
    search_last_name: player.search_last_name,
    search_full_name: player.search_full_name,
    metadata: player.metadata ? JSON.stringify(player.metadata) : null,
    competitions: player.competitions ? JSON.stringify(player.competitions) : null
  };
}
__name(transformSleeperPlayer, "transformSleeperPlayer");

// src/services/fantasyPros.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var FANTASY_PROS_BASE_URL = "https://api.fantasypros.com/public/v2/json";
function normalizePlayerName(name) {
  if (!name)
    return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
__name(normalizePlayerName, "normalizePlayerName");
var lastRequestTime = 0;
var MIN_REQUEST_INTERVAL = 1e3;
var dailyRequestCount = 0;
var MAX_DAILY_REQUESTS = 100;
async function rateLimitedRequest(url, apiKey) {
  if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
    throw new Error("Daily FantasyPros API request limit exceeded (100 requests/day)");
  }
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms before next request`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
  dailyRequestCount++;
  console.log(`Making FantasyPros API request #${dailyRequestCount}/100 to: ${url}`);
  console.log(`API Key (first 8 chars): ${apiKey.substring(0, 8)}...`);
  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "Fantasy-Command-Center/1.0"
    }
  });
  console.log(`FantasyPros API response status: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`FantasyPros API error response: ${errorText}`);
    throw new Error(`FantasyPros API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}
__name(rateLimitedRequest, "rateLimitedRequest");
async function fetchFantasyProsProjections(apiKey, week, season) {
  const positions = ["QB", "RB", "WR", "TE"];
  let allProjections = [];
  for (const position of positions) {
    try {
      let url = `${FANTASY_PROS_BASE_URL}/nfl/${season || 2024}/projections?position=${position}`;
      if (week !== void 0) {
        url += `&week=${week}`;
      } else {
        url += `&week=0`;
      }
      console.log(`Making projections request to: ${url}`);
      const data = await rateLimitedRequest(url, apiKey);
      console.log(`Raw ${position} projections response:`, JSON.stringify(data, null, 2));
      const projections = data.players?.map((item) => {
        const stats = Array.isArray(item.stats) ? item.stats : [];
        const fpts = stats.find((stat) => stat.label === "FPTS" || stat.label === "Fantasy Points");
        console.log(`Processing ${item.name}: stats=`, stats, "fpts=", fpts);
        return {
          player_id: item.fpid?.toString(),
          name: item.name,
          position: item.position_id,
          team: item.team_id,
          week: week !== void 0 ? week : 0,
          season: season || 2024,
          projected_points: fpts?.value || 0,
          source: "FantasyPros"
        };
      }) || [];
      allProjections = allProjections.concat(projections);
      console.log(`Fetched ${projections.length} ${position} projections`);
    } catch (error) {
      console.log(`Failed to fetch ${position} projections: ${error}`);
      continue;
    }
  }
  return allProjections;
}
__name(fetchFantasyProsProjections, "fetchFantasyProsProjections");
async function fetchFantasyProsPlayers(apiKey, sport = "nfl") {
  const url = `${FANTASY_PROS_BASE_URL}/${sport}/players?external_ids=espn:yahoo:rotowire:rotoworld:nfl`;
  const data = await rateLimitedRequest(url, apiKey);
  return data.players?.map((item) => ({
    player_id: item.fpid?.toString(),
    name: item.name,
    position: item.position_id,
    team: item.team_id,
    filename: item.filename,
    headshot_url: item.headshot_url,
    injury_status: item.injury_status,
    injury_type: item.injury_type,
    injury_update_date: item.injury_update_date,
    espn_id: item.espn_id,
    yahoo_id: item.yahoo_id,
    rotowire_id: item.rotowire_id,
    rotoworld_id: item.rotoworld_id,
    gsis_id: item.nfl_id
  })) || [];
}
__name(fetchFantasyProsPlayers, "fetchFantasyProsPlayers");
function matchFantasyProsToPlayerUpdates(fantasyProsData, players) {
  const gsisIdMap = /* @__PURE__ */ new Map();
  const espnIdMap = /* @__PURE__ */ new Map();
  const yahooIdMap = /* @__PURE__ */ new Map();
  const rotowireIdMap = /* @__PURE__ */ new Map();
  const rotoworldIdMap = /* @__PURE__ */ new Map();
  const playerNameMap = /* @__PURE__ */ new Map();
  players.forEach((player) => {
    if (player.gsis_id) {
      gsisIdMap.set(player.gsis_id.toString(), player.sleeper_id);
    }
    if (player.espn_id) {
      espnIdMap.set(player.espn_id.toString(), player.sleeper_id);
    }
    if (player.yahoo_id) {
      yahooIdMap.set(player.yahoo_id.toString(), player.sleeper_id);
    }
    if (player.rotowire_id) {
      rotowireIdMap.set(player.rotowire_id.toString(), player.sleeper_id);
    }
    if (player.rotoworld_id) {
      rotoworldIdMap.set(player.rotoworld_id.toString(), player.sleeper_id);
    }
    if (player.search_full_name) {
      const normalizedName = normalizePlayerName(player.search_full_name);
      if (normalizedName) {
        playerNameMap.set(normalizedName, player.sleeper_id);
      }
    }
  });
  console.log(`Created ID maps for player updates - GSIS: ${gsisIdMap.size}, ESPN: ${espnIdMap.size}, Yahoo: ${yahooIdMap.size}, Rotowire: ${rotowireIdMap.size}, Rotoworld: ${rotoworldIdMap.size}, Names: ${playerNameMap.size}`);
  console.log(`Processing ${fantasyProsData.length} FantasyPros records for player updates`);
  const matched = [];
  const unmatched = [];
  fantasyProsData.forEach((item, index) => {
    let sleeperId = null;
    let matchMethod = "";
    if (item.gsis_id && gsisIdMap.has(item.gsis_id.toString())) {
      sleeperId = gsisIdMap.get(item.gsis_id.toString());
      matchMethod = "gsis_id";
    } else if (item.espn_id && espnIdMap.has(item.espn_id.toString())) {
      sleeperId = espnIdMap.get(item.espn_id.toString());
      matchMethod = "espn_id";
    } else if (item.yahoo_id && yahooIdMap.has(item.yahoo_id.toString())) {
      sleeperId = yahooIdMap.get(item.yahoo_id.toString());
      matchMethod = "yahoo_id";
    } else if (item.rotowire_id && rotowireIdMap.has(item.rotowire_id.toString())) {
      sleeperId = rotowireIdMap.get(item.rotowire_id.toString());
      matchMethod = "rotowire_id";
    } else if (item.rotoworld_id && rotoworldIdMap.has(item.rotoworld_id.toString())) {
      sleeperId = rotoworldIdMap.get(item.rotoworld_id.toString());
      matchMethod = "rotoworld_id";
    } else if (item.name) {
      const normalizedName = normalizePlayerName(item.name);
      if (normalizedName && playerNameMap.has(normalizedName)) {
        sleeperId = playerNameMap.get(normalizedName);
        matchMethod = "name";
      }
    }
    if (sleeperId) {
      const playerUpdate = {
        sleeper_id: sleeperId,
        search_rank: item.ecr_rank || null,
        tier: item.tier || null,
        position_rank: item.position_rank || null,
        value_over_replacement: item.value_over_replacement || null,
        auction_value: item.auction_value || null,
        projected_points: item.projected_points || null,
        sos_rank: item.sos_rank || null,
        match_method: matchMethod
      };
      matched.push(playerUpdate);
    } else {
      unmatched.push(item);
      if (index < 5) {
        console.log(`Unmatched for player update: "${item.name}" (GSIS: ${item.gsis_id}, ESPN: ${item.espn_id}, Yahoo: ${item.yahoo_id}, Rotowire: ${item.rotowire_id}, Rotoworld: ${item.rotoworld_id})`);
      }
    }
  });
  console.log(`Player updates - Matched: ${matched.length}, Unmatched: ${unmatched.length}`);
  return { matched, unmatched };
}
__name(matchFantasyProsToPlayerUpdates, "matchFantasyProsToPlayerUpdates");

// src/services/nflSchedule.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function generateGameId(gameDate, homeTeam, awayTeam, week) {
  if (week) {
    return `${gameDate}-${homeTeam}-${awayTeam}-W${week}`;
  }
  return `${gameDate}-${homeTeam}-${awayTeam}`;
}
__name(generateGameId, "generateGameId");
async function scrapeNFLSchedule() {
  try {
    console.log("Starting NFL schedule scrape...");
    try {
      return await scrapeNFLScheduleFromWeb();
    } catch (webError) {
      console.warn("Web scraping failed, falling back to test data:", webError);
      return getTestScheduleData();
    }
  } catch (error) {
    console.error("Error scraping NFL schedule:", error);
    throw new Error(`Failed to scrape NFL schedule: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
__name(scrapeNFLSchedule, "scrapeNFLSchedule");
function getTestScheduleData() {
  const testGames = [];
  const teams = [
    "ARI",
    "ATL",
    "BAL",
    "BUF",
    "CAR",
    "CHI",
    "CIN",
    "CLE",
    "DAL",
    "DEN",
    "DET",
    "GB",
    "HOU",
    "IND",
    "JAX",
    "KC",
    "LAC",
    "LAR",
    "LV",
    "MIA",
    "MIN",
    "NE",
    "NO",
    "NYG",
    "NYJ",
    "PHI",
    "PIT",
    "SF",
    "SEA",
    "TB",
    "TEN",
    "WAS"
  ];
  const stadiums = {
    "ARI": "State Farm Stadium, Glendale, AZ",
    "ATL": "Mercedes-Benz Stadium, Atlanta, GA",
    "BAL": "M&T Bank Stadium, Baltimore, MD",
    "BUF": "Highmark Stadium, Orchard Park, NY",
    "CAR": "Bank of America Stadium, Charlotte, NC",
    "CHI": "Soldier Field, Chicago, IL",
    "CIN": "Paycor Stadium, Cincinnati, OH",
    "CLE": "FirstEnergy Stadium, Cleveland, OH",
    "DAL": "AT&T Stadium, Arlington, TX",
    "DEN": "Empower Field at Mile High, Denver, CO",
    "DET": "Ford Field, Detroit, MI",
    "GB": "Lambeau Field, Green Bay, WI",
    "HOU": "NRG Stadium, Houston, TX",
    "IND": "Lucas Oil Stadium, Indianapolis, IN",
    "JAX": "TIAA Bank Field, Jacksonville, FL",
    "KC": "Arrowhead Stadium, Kansas City, MO",
    "LAC": "SoFi Stadium, Inglewood, CA",
    "LAR": "SoFi Stadium, Inglewood, CA",
    "LV": "Allegiant Stadium, Las Vegas, NV",
    "MIA": "Hard Rock Stadium, Miami Gardens, FL",
    "MIN": "U.S. Bank Stadium, Minneapolis, MN",
    "NE": "Gillette Stadium, Foxborough, MA",
    "NO": "Caesars Superdome, New Orleans, LA",
    "NYG": "MetLife Stadium, East Rutherford, NJ",
    "NYJ": "MetLife Stadium, East Rutherford, NJ",
    "PHI": "Lincoln Financial Field, Philadelphia, PA",
    "PIT": "Acrisure Stadium, Pittsburgh, PA",
    "SF": "Levi's Stadium, Santa Clara, CA",
    "SEA": "Lumen Field, Seattle, WA",
    "TB": "Raymond James Stadium, Tampa, FL",
    "TEN": "Nissan Stadium, Nashville, TN",
    "WAS": "FedExField, Landover, MD"
  };
  for (let week = 1; week <= 18; week++) {
    const weekGames = generateWeekGames(week, teams, stadiums);
    testGames.push(...weekGames);
  }
  console.log(`Generated ${testGames.length} complete NFL season games across 18 weeks`);
  return testGames;
}
__name(getTestScheduleData, "getTestScheduleData");
function generateWeekGames(week, teams, stadiums) {
  const games = [];
  const baseDate = /* @__PURE__ */ new Date("2025-09-04");
  const weekStartDate = new Date(baseDate);
  weekStartDate.setDate(baseDate.getDate() + (week - 1) * 7);
  const teamsCopy = [...teams];
  for (let i = 0; i < 16; i++) {
    const awayIndex = (i + week) % 32;
    const homeIndex = (i + week + 16) % 32;
    const awayTeam = teamsCopy[awayIndex];
    const homeTeam = teamsCopy[homeIndex];
    if (!awayTeam || !homeTeam) {
      console.error(`Could not find teams for game ${i} in week ${week}`);
      continue;
    }
    const gameDate = new Date(weekStartDate);
    if (i === 0 && week === 1) {
      gameDate.setDate(weekStartDate.getDate() - 1);
    } else if (i === 15) {
      gameDate.setDate(weekStartDate.getDate() + 3);
    } else {
      gameDate.setDate(weekStartDate.getDate() + 2);
    }
    let kickoffTime;
    let network;
    if (i === 0 && week === 1) {
      kickoffTime = "20:20";
      network = "NBC";
    } else if (i === 0) {
      kickoffTime = "20:15";
      network = "Prime Video";
    } else if (i === 15) {
      kickoffTime = "20:20";
      network = "ESPN";
    } else if (i === 14) {
      kickoffTime = "20:20";
      network = "NBC";
    } else if (i < 8) {
      kickoffTime = "13:00";
      network = i % 2 === 0 ? "CBS" : "FOX";
    } else {
      kickoffTime = i < 12 ? "16:05" : "16:25";
      network = i % 2 === 0 ? "CBS" : "FOX";
    }
    const gameDateStr = gameDate.toISOString().split("T")[0];
    games.push({
      game_id: generateGameId(gameDateStr, homeTeam, awayTeam, week),
      week,
      game_date: gameDateStr,
      kickoff_time: kickoffTime,
      home_team: homeTeam,
      away_team: awayTeam,
      location: stadiums[homeTeam],
      network,
      game_type: "Regular"
    });
  }
  return games;
}
__name(generateWeekGames, "generateWeekGames");
async function scrapeNFLScheduleFromWeb() {
  try {
    console.log("Attempting to scrape NFL schedule from web...");
    const url = "https://operations.nfl.com/gameday/nfl-schedule/2025-nfl-schedule/";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Fantasy-Command-Center/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();
    console.log(`Successfully fetched NFL schedule page (${html.length} characters)`);
    const games = parseNFLScheduleHTML(html);
    if (games.length === 0) {
      throw new Error("No games found in the scraped HTML");
    }
    console.log(`Successfully parsed ${games.length} games from NFL website`);
    return games;
  } catch (error) {
    console.error("Web scraping failed:", error);
    throw new Error(`Failed to scrape NFL website: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
__name(scrapeNFLScheduleFromWeb, "scrapeNFLScheduleFromWeb");
function parseNFLScheduleHTML(html) {
  const games = [];
  try {
    console.log("Parsing HTML for game data...");
    console.log("HTML parsing not yet implemented - using fallback data");
    return [];
  } catch (error) {
    console.error("Error parsing HTML:", error);
    return [];
  }
}
__name(parseNFLScheduleHTML, "parseNFLScheduleHTML");

// src/handlers/players.ts
init_matchups();
var PlayersHandler = class {
  db;
  env;
  constructor(db, env) {
    this.db = db;
    this.env = env;
  }
  async handleGet(request) {
    try {
      const url = new URL(request.url);
      const position = url.searchParams.get("position");
      const limitParam = url.searchParams.get("limit");
      const limit = limitParam ? parseInt(limitParam) : -1;
      const search = url.searchParams.get("search");
      let players = await this.db.getAllPlayers();
      players = players.map((player) => ({
        ...player,
        projected_points_week: null,
        projected_points_season: null,
        projection_source: "none"
      }));
      if (position) {
        players = players.filter((p) => p.position.toUpperCase() === position.toUpperCase());
      }
      if (search) {
        const searchLower = search.toLowerCase();
        players = players.filter(
          (p) => p.name.toLowerCase().includes(searchLower) || p.team.toLowerCase().includes(searchLower)
        );
      }
      if (limit > 0) {
        players = players.slice(0, limit);
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            players,
            count: players.length
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Players GET error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleSyncSleeper(request) {
    try {
      console.log("Starting Sleeper players sync...");
      const players = await fetchAllPlayersComplete();
      const playersToInsert = [];
      let skippedCount = 0;
      for (const player of players) {
        const validation = validatePlayer(player);
        if (!validation.isValid) {
          console.warn(`Skipping player ${player.player_id}: missing fields: ${validation.missingFields.join(", ")}`);
          skippedCount++;
          continue;
        }
        const transformedPlayer = transformSleeperPlayer(player);
        playersToInsert.push(transformedPlayer);
      }
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
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Sync Sleeper error:", error);
      let errorMessage = "Failed to sync players from Sleeper";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleTrendingPlayers(request) {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get("type") || "add";
      const lookbackHours = parseInt(url.searchParams.get("lookback_hours") || "24");
      console.log(`Fetching trending players (${type}) from Sleeper...`);
      const trendingPlayers = await fetchTrendingPlayers(type, lookbackHours);
      const playerDetails = await this.db.getPlayersBySleeperIds(
        trendingPlayers.map((p) => p.player_id)
      );
      const enrichedTrendingPlayers = trendingPlayers.map((trending) => {
        const playerDetail = playerDetails.find((p) => p.sleeper_id === trending.player_id);
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
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Trending players error:", error);
      let errorMessage = "Failed to fetch trending players from Sleeper";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleSyncESPN(request) {
    try {
      const body = await request.json();
      const leagueId = body.leagueId;
      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: "leagueId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      console.log(`Starting ESPN sync for league ${leagueId}...`);
      return new Response(
        JSON.stringify({
          error: "ESPN sync is deprecated. Please use /sync/players to sync from Sleeper API.",
          message: "Use POST /sync/players to sync player data from Sleeper"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Sync ESPN error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to sync ESPN players" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleSyncPlayers(request) {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      const leagueId = pathParts[pathParts.length - 1];
      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: "leagueId is required in URL path" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      console.log(`Starting ESPN players sync for league ${leagueId}...`);
      return new Response(
        JSON.stringify({
          error: "ESPN sync is deprecated. Please use /sync/players to sync from Sleeper API.",
          message: "Use POST /sync/players to sync player data from Sleeper"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Sync players error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to sync players from ESPN" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handleSyncTrendingPlayers(request) {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get("type") || "add";
      const lookbackHours = parseInt(url.searchParams.get("lookback_hours") || "24");
      console.log(`Starting trending players sync for type: ${type}, lookback: ${lookbackHours}h`);
      const trendingPlayers = await fetchTrendingPlayers(type, lookbackHours);
      if (!trendingPlayers || trendingPlayers.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          message: "No trending players found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
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
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error syncing trending players:", error);
      let errorMessage = "Failed to sync trending players";
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorMessage = "Sleeper API rate limited \u2014 please try again shortly.";
        } else {
          errorMessage = error.message;
        }
      }
      return new Response(JSON.stringify({
        success: false,
        message: errorMessage
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleSyncFantasyPros(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week") ? parseInt(url.searchParams.get("week")) : void 0;
      const season = url.searchParams.get("season") ? parseInt(url.searchParams.get("season")) : 2024;
      console.log(`Starting FantasyPros sync for week: ${week}, season: ${season}`);
      const allPlayers = await this.db.getAllPlayers();
      const [projections, players] = await Promise.all([
        fetchFantasyProsProjections(this.env.FANTASYPROS_API_KEY, week, season),
        fetchFantasyProsPlayers(this.env.FANTASYPROS_API_KEY, "nfl")
      ]);
      const ecr = [];
      const auctionValues = [];
      const sos = [];
      const news = [];
      const injuries = [];
      const rankings = [];
      const consensusRankings = [];
      const experts = [];
      const playerPoints = [];
      const allFantasyProsData = [
        ...projections.map((p) => ({ ...p, data_type: "projection" })),
        ...ecr.map((e) => ({ ...e, data_type: "ecr" })),
        ...auctionValues.map((a) => ({ ...a, data_type: "auction" })),
        ...sos.map((s) => ({ ...s, data_type: "sos" })),
        ...players.map((p) => ({ ...p, data_type: "player" })),
        ...news.map((n) => ({ ...n, data_type: "news" })),
        ...injuries.map((i) => ({ ...i, data_type: "injury" })),
        ...rankings.map((r) => ({ ...r, data_type: "ranking" })),
        ...consensusRankings.map((cr) => ({ ...cr, data_type: "consensus_ranking" })),
        ...playerPoints.map((pp) => ({ ...pp, data_type: "player_points" }))
      ];
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
            unmatched_sample: unmatched.slice(0, 10)
            // Return sample of unmatched for debugging
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          message: "No FantasyPros data matched to players",
          data: { week, season, updated_count: 0, unmatched_count: allFantasyProsData.length }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Sync FantasyPros error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleGetPlayersWithFantasyData(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week") ? parseInt(url.searchParams.get("week")) : void 0;
      const season = url.searchParams.get("season") ? parseInt(url.searchParams.get("season")) : void 0;
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
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Get players with fantasy data error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleTestFantasyProsKey(request) {
    try {
      const apiKey = this.env.FANTASYPROS_API_KEY;
      const keyPreview = apiKey ? `${apiKey.substring(0, 8)}...` : "NOT_FOUND";
      try {
        const testUrl = "https://api.fantasypros.com/public/v2/json/nfl/2024/projections?position=QB&week=0";
        console.log("Testing single FantasyPros API call...");
        const response = await fetch(testUrl, {
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
          }
        });
        console.log(`Test API response status: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Test API error: ${errorText}`);
          return new Response(JSON.stringify({
            success: true,
            message: "FantasyPros API key status",
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
            headers: { "Content-Type": "application/json" }
          });
        }
        const data = await response.json();
        console.log("Test API call successful, got data:", Object.keys(data));
        return new Response(JSON.stringify({
          success: true,
          message: "FantasyPros API key status",
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
          headers: { "Content-Type": "application/json" }
        });
      } catch (apiError) {
        console.error("Test API call failed:", apiError);
        return new Response(JSON.stringify({
          success: true,
          message: "FantasyPros API key status",
          data: {
            key_available: !!apiKey,
            key_preview: keyPreview,
            key_length: apiKey ? apiKey.length : 0,
            api_test: {
              error: apiError instanceof Error ? apiError.message : "Unknown API error"
            }
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Test FantasyPros key error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleSyncNFLSchedule(request) {
    try {
      console.log("Starting NFL schedule sync...");
      const games = await scrapeNFLSchedule();
      if (games.length > 0) {
        await upsertNFLSchedule(this.db.db, games);
        console.log(`Successfully synced ${games.length} NFL schedule games`);
        return new Response(JSON.stringify({
          success: true,
          message: `Synced ${games.length} NFL schedule games`,
          data: {
            games_count: games.length,
            games
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          message: "No NFL schedule games found",
          data: { games_count: 0 }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Sync NFL schedule error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleGetNFLSchedule(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week") ? parseInt(url.searchParams.get("week")) : void 0;
      const games = await getNFLSchedule(this.db.db, week);
      return new Response(JSON.stringify({
        success: true,
        data: {
          week,
          count: games.length,
          games
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Get NFL schedule error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleSyncMatchups(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week");
      const enrichWeather = url.searchParams.get("weather") === "true";
      if (!week) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week parameter is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week must be between 1 and 18"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        console.log("Testing database connection...");
        const testQuery = await this.env.DB.prepare("SELECT 1 as test").first();
        console.log("Database connection test successful:", testQuery);
        console.log("All database tests passed!");
      } catch (error) {
        console.error("Database connection test failed:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Database connection failed: " + (error instanceof Error ? error.message : "Unknown error")
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log("Calling generatePlayerMatchupsForWeek...");
      console.log("Testing utility function database binding...");
      const testStmt = this.env.DB.prepare(`
        SELECT * FROM nfl_schedule WHERE week = ?
      `);
      const testResult = await testStmt.bind(weekNum).all();
      const testSchedule = testResult.results || testResult;
      console.log(`Test query found ${testSchedule.length} games for week ${weekNum}`);
      console.log("Testing utility function insert...");
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
          "test-game-utility",
          "TEST",
          1
        ).run();
        console.log("Utility function insert test successful");
      }
      console.log("Generating matchups directly in handler...");
      console.log(`Fetching schedule for week ${weekNum}...`);
      const stmt = this.env.DB.prepare(`
        SELECT * FROM nfl_schedule WHERE week = ?
      `);
      const result = await stmt.bind(weekNum).all();
      const schedule = result.results || result;
      console.log(`Found ${schedule.length} games for week ${weekNum}`);
      console.log("Fetching players with team information...");
      const playersStmt = this.env.DB.prepare(`
        SELECT * FROM players WHERE team IS NOT NULL AND team != ''
      `);
      const playersResult = await playersStmt.all();
      const players = playersResult.results || playersResult;
      console.log(`Found ${players.length} players with team information`);
      const gamesToProcess = schedule.slice(0, 2);
      console.log(`Processing ${gamesToProcess.length} games out of ${schedule.length} total games`);
      for (const game of gamesToProcess) {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;
        const gameId = game.game_id;
        console.log(`Processing game: ${awayTeam} @ ${homeTeam} (game_id: ${gameId})`);
        const homePlayers = players.filter((p) => p.team === homeTeam);
        const awayPlayers = players.filter((p) => p.team === awayTeam);
        console.log(`Found ${homePlayers.length} home players and ${awayPlayers.length} away players`);
        const allPlayers = [...homePlayers.slice(0, 5), ...awayPlayers.slice(0, 5)];
        if (allPlayers.length === 0) {
          console.log("No players found for this game");
          continue;
        }
        for (const player of allPlayers) {
          const isHome = player.team === homeTeam;
          const opponentTeam = isHome ? awayTeam : homeTeam;
          try {
            console.log(`Inserting matchup for player ${player.sleeper_id}`);
            const insertQuery = `
              INSERT OR REPLACE INTO player_matchups (
                player_id, week, game_id, opponent_team, is_home
              ) VALUES (${player.sleeper_id}, ${weekNum}, '${gameId}', '${opponentTeam}', ${isHome ? 1 : 0})
            `;
            console.log("Insert query:", insertQuery);
            await this.env.DB.prepare(insertQuery).run();
            console.log(`Successfully inserted matchup for player ${player.sleeper_id}`);
          } catch (error) {
            console.error(`Error inserting matchup for player ${player.sleeper_id}:`, error);
          }
        }
      }
      console.log("Matchup generation completed");
      console.log("Syncing defense strength...");
      await syncDefenseStrength(this.env.DB);
      if (enrichWeather) {
        console.log("Enriching weather data...");
        const games = await this.env.DB.prepare(`
          SELECT * FROM nfl_schedule WHERE week = ?
        `).bind(weekNum).all();
        const gamesResult = games.results || games;
        for (const game of gamesResult) {
          await enrichWeatherForGame(this.env.DB, game);
        }
      }
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
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Sync matchups error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleTestDatabase(request) {
    try {
      console.log("Testing database connection...");
      const testQuery = await this.db.db.prepare("SELECT 1 as test").first();
      console.log("Database connection test successful:", testQuery);
      console.log("Testing nfl_schedule table...");
      const scheduleQuery = await this.db.db.prepare("SELECT COUNT(*) as count FROM nfl_schedule").first();
      console.log("Schedule query test successful:", scheduleQuery);
      console.log("Testing players table...");
      const playersQuery = await this.db.db.prepare("SELECT COUNT(*) as count FROM players").first();
      console.log("Players query test successful:", playersQuery);
      console.log("Testing parameter binding...");
      const paramQuery = await this.db.db.prepare("SELECT COUNT(*) as count FROM nfl_schedule WHERE week = ?").bind(1).first();
      console.log("Parameter query test successful:", paramQuery);
      console.log("Testing insert...");
      const insertStmt = this.db.db.prepare("INSERT OR REPLACE INTO player_matchups (player_id, week, game_id, opponent_team, is_home) VALUES (?, ?, ?, ?, ?)");
      await insertStmt.bind(999999, 1, "test-game", "TEST", 1).run();
      console.log("Insert test successful");
      console.log("Testing exact utility function queries...");
      const week = 1;
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
      console.log("Testing utility function insert...");
      const testPlayer = players[0];
      if (testPlayer) {
        const insertStmt2 = this.db.db.prepare(`
          INSERT OR REPLACE INTO player_matchups (
            player_id, week, game_id, opponent_team, is_home
          ) VALUES (?, ?, ?, ?, ?)
        `);
        await insertStmt2.bind(
          testPlayer.sleeper_id,
          week,
          "test-game-2",
          "TEST2",
          1
        ).run();
        console.log("Utility function insert test successful");
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Database tests passed",
        data: {
          test: testQuery,
          schedule_count: scheduleQuery,
          players_count: playersQuery,
          param_query: paramQuery,
          utility_schedule_count: schedule.length,
          utility_players_count: players.length
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Database test failed:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Database test failed: " + (error instanceof Error ? error.message : "Unknown error")
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleTestMatchupsDB(request) {
    try {
      console.log("Testing matchups database connection...");
      const testQuery = await this.env.DB.prepare("SELECT 1 as test").first();
      console.log("Test 1 successful:", testQuery);
      const countQuery = await this.env.DB.prepare("SELECT COUNT(*) as count FROM nfl_schedule").first();
      console.log("Test 2 successful:", countQuery);
      console.log("All matchups database tests passed!");
      return new Response(JSON.stringify({
        success: true,
        message: "Matchups database tests passed",
        data: {
          test: testQuery,
          count: countQuery
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Matchups database test failed:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Matchups database test failed: " + (error instanceof Error ? error.message : "Unknown error")
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleGetMatchups(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week");
      const playerId = url.searchParams.get("player_id");
      const team = url.searchParams.get("team");
      let query = `
        SELECT pm.*, p.name, p.team, p.position
        FROM player_matchups pm
        JOIN players p ON pm.player_id = p.sleeper_id
        WHERE 1=1
      `;
      const params = [];
      if (week) {
        query += " AND pm.week = ?";
        params.push(parseInt(week));
      }
      if (playerId) {
        query += " AND pm.player_id = ?";
        params.push(parseInt(playerId));
      }
      if (team) {
        query += " AND p.team = ?";
        params.push(team);
      }
      query += " ORDER BY pm.week, p.name";
      const matchupsResult = await this.env.DB.prepare(query).bind(...params).all();
      const matchups = matchupsResult.results || matchupsResult;
      return new Response(JSON.stringify({
        success: true,
        data: {
          matchups,
          count: matchups.length
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Get matchups error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleSyncWeather(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week");
      if (!week) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week parameter is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week must be between 1 and 18"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log(`Starting weather sync for week ${weekNum}...`);
      const { enrichWeatherForWeek: enrichWeatherForWeek2 } = await Promise.resolve().then(() => (init_matchups(), matchups_exports));
      await enrichWeatherForWeek2(this.env.DB, weekNum);
      return new Response(JSON.stringify({
        success: true,
        message: `Weather data synced for week ${weekNum}`,
        data: {
          week: weekNum,
          synced_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Weather sync error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleSyncDefenseStrength(request) {
    try {
      console.log("Starting defense strength sync...");
      const { syncDefenseStrength: syncDefenseStrength2 } = await Promise.resolve().then(() => (init_matchups(), matchups_exports));
      await syncDefenseStrength2(this.env.DB);
      return new Response(JSON.stringify({
        success: true,
        message: "Defense strength data synced",
        data: {
          synced_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Defense strength sync error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleUpdateMatchupsWithDefense(request) {
    try {
      const url = new URL(request.url);
      const week = url.searchParams.get("week");
      if (!week) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week parameter is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
        return new Response(JSON.stringify({
          success: false,
          error: "Week must be between 1 and 18"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log(`Updating matchups with defense strength for week ${weekNum}...`);
      const { updateMatchupsWithDefenseStrength: updateMatchupsWithDefenseStrength2 } = await Promise.resolve().then(() => (init_matchups(), matchups_exports));
      await updateMatchupsWithDefenseStrength2(this.env.DB, weekNum);
      return new Response(JSON.stringify({
        success: true,
        message: `Matchups updated with defense strength for week ${weekNum}`,
        data: {
          week: weekNum,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Update matchups with defense error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
__name(PlayersHandler, "PlayersHandler");

// src/handlers/alerts.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var AlertsHandler = class {
  db;
  constructor(db) {
    this.db = db;
  }
  async handleGet(request) {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const leagueId = url.searchParams.get("leagueId");
      const status = url.searchParams.get("status");
      const limit = url.searchParams.get("limit");
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId query parameter is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const alertsResult = await this.db.getAlerts(userId, leagueId || void 0);
      let alerts = alertsResult.results || [];
      if (status) {
        alerts = alerts.filter((a) => a.status === status);
      }
      const limitNum = limit ? parseInt(limit, 10) : 50;
      if (limitNum > 0) {
        alerts = alerts.slice(0, limitNum);
      }
      return new Response(
        JSON.stringify({
          alerts,
          count: alerts.length
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Alerts GET error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handlePost(request) {
    try {
      const body = await request.json();
      const { userId, leagueId, type, message } = body;
      if (!userId || !leagueId || !type || !message) {
        return new Response(
          JSON.stringify({ error: "userId, leagueId, type, and message are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const validTypes = ["injury", "trade", "waiver", "news", "weather", "system"];
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: "Invalid alert type. Must be one of: " + validTypes.join(", ") }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const result = await this.db.createAlert(userId, leagueId, type, message);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Alert created successfully",
          id: result.meta?.last_row_id
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Alerts POST error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  async handlePatch(request) {
    try {
      const body = await request.json();
      const { alertId } = body;
      if (!alertId) {
        return new Response(
          JSON.stringify({ error: "alertId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const alertIdNum = parseInt(alertId, 10);
      if (isNaN(alertIdNum)) {
        return new Response(
          JSON.stringify({ error: "alertId must be a valid number" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const result = await this.db.markAlertAsRead(alertIdNum);
      if (result.meta?.changes === 0) {
        return new Response(
          JSON.stringify({ error: "Alert not found or already marked as read" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          message: "Alert marked as read successfully"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Alerts PATCH error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
__name(AlertsHandler, "AlertsHandler");

// src/handlers/team.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var TeamHandler = class {
  db;
  constructor(db) {
    this.db = db;
  }
  async handleGet(request) {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      const leagueIdIndex = pathParts.indexOf("team") + 1;
      const leagueId = pathParts[leagueIdIndex];
      const teamId = pathParts[leagueIdIndex + 1];
      if (!leagueId || !teamId) {
        return new Response(
          JSON.stringify({ error: "leagueId and teamId are required in URL path" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      console.log(`Fetching team roster for league ${leagueId}, team ${teamId}...`);
      const rosterData = await fetchTeamRoster(leagueId, parseInt(teamId));
      if (!rosterData || !rosterData.teams || !rosterData.teams[0]) {
        return new Response(
          JSON.stringify({ error: "No team data found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const team = rosterData.teams[0];
      const teamPlayers = [];
      if (team.roster && team.roster.entries) {
        for (const entry of team.roster.entries) {
          if (!entry.playerPoolEntry || !entry.playerPoolEntry.player) {
            continue;
          }
          const player = entry.playerPoolEntry.player;
          const espnId = player.id.toString();
          const dbPlayer = await this.db.getPlayerByEspnId(espnId);
          const projection = dbPlayer ? await this.db.getProjectionByPlayerId(dbPlayer.id) : null;
          teamPlayers.push({
            espn_id: espnId,
            name: player.fullName || `${player.firstName} ${player.lastName}`,
            position: dbPlayer?.position || "UNK",
            team: dbPlayer?.team || "FA",
            status: player.injuryStatus || "healthy",
            bye_week: dbPlayer?.bye_week || null,
            projected_points_week: projection?.projected_points || null,
            projected_points_season: null,
            // ESPN doesn't provide season projections
            projection_source: projection?.source || "none"
          });
        }
      }
      return new Response(
        JSON.stringify({
          success: true,
          team: {
            id: team.id,
            name: team.name,
            abbreviation: team.abbreviation
          },
          players: teamPlayers,
          count: teamPlayers.length
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Team GET error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch team roster" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
__name(TeamHandler, "TeamHandler");

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const db = new DatabaseService(env.DB);
    const noaaService = new NOAAService(env.NOAA_BASE_URL);
    const leagueHandler = new LeagueHandler(db);
    const playersHandler = new PlayersHandler(db, env);
    const alertsHandler = new AlertsHandler(db);
    const teamHandler = new TeamHandler(db);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }
    try {
      let response;
      switch (path) {
        case "/league":
          if (request.method === "POST") {
            response = await leagueHandler.handlePost(request);
          } else if (request.method === "GET") {
            response = await leagueHandler.handleGet(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/players":
          if (request.method === "GET") {
            response = await playersHandler.handleGet(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/players":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncSleeper(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/trending/players":
          if (request.method === "GET") {
            response = await playersHandler.handleTrendingPlayers(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/trending":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncTrendingPlayers(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/fantasy-pros":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncFantasyPros(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/players/with-fantasy-data":
          if (request.method === "GET") {
            response = await playersHandler.handleGetPlayersWithFantasyData(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/test/fantasy-pros-key":
          if (request.method === "GET") {
            response = await playersHandler.handleTestFantasyProsKey(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/nfl/schedule":
          if (request.method === "GET") {
            response = await playersHandler.handleGetNFLSchedule(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/nfl-schedule":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncNFLSchedule(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/matchups":
          if (request.method === "GET") {
            response = await playersHandler.handleGetMatchups(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/matchups":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncMatchups(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/weather":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncWeather(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/defense-strength":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncDefenseStrength(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/matchups-defense":
          if (request.method === "POST") {
            response = await playersHandler.handleUpdateMatchupsWithDefense(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/test/database":
          if (request.method === "GET") {
            response = await playersHandler.handleTestDatabase(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/test/matchups-db":
          if (request.method === "GET") {
            response = await playersHandler.handleTestMatchupsDB(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/sync/espn":
          if (request.method === "POST") {
            response = await playersHandler.handleSyncESPN(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/alerts":
          if (request.method === "GET") {
            response = await alertsHandler.handleGet(request);
          } else if (request.method === "POST") {
            response = await alertsHandler.handlePost(request);
          } else if (request.method === "PATCH") {
            response = await alertsHandler.handlePatch(request);
          } else {
            response = new Response("Method not allowed", { status: 405 });
          }
          break;
        case "/health":
          response = new Response(
            JSON.stringify({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
          break;
        default:
          if (path.startsWith("/team/") && request.method === "GET") {
            response = await teamHandler.handleGet(request);
          } else if (path.startsWith("/sync/players/") && request.method === "POST") {
            response = await playersHandler.handleSyncPlayers(request);
          } else if (path.startsWith("/league/") && path.endsWith("/settings") && request.method === "GET") {
            response = await leagueHandler.handleGetLeagueSettings(request);
          } else {
            response = new Response("Not found", { status: 404 });
          }
          break;
      }
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      console.error("Request error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  },
  async scheduled(event, env, ctx) {
    console.log(`Running scheduled job with cron: ${event.cron}`);
    if (event.cron === "0 6 * * *") {
      console.log("Running daily Sleeper API sync job...");
      try {
        const db = new DatabaseService(env.DB);
        console.log("Syncing all players from Sleeper API...");
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
        console.log("Syncing trending players from Sleeper API...");
        const trendingTypes = ["add", "drop"];
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
          }
        }
        console.log("Daily Sleeper API sync job completed successfully");
      } catch (error) {
        console.error("Scheduled job error:", error);
      }
    } else if (event.cron === "0 * * * *") {
      console.log("Running hourly FantasyPros API sync job...");
      try {
        const db = new DatabaseService(env.DB);
        const playersHandler = new PlayersHandler(db, env);
        const mockRequest = new Request("https://fantasy-command-center-api.kevin-mcgovern.workers.dev/sync/fantasy-pros", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const response = await playersHandler.handleSyncFantasyPros(mockRequest);
        const result = await response.json();
        if (result.success) {
          console.log("Hourly FantasyPros API sync job completed successfully:", result.message);
        } else {
          console.error("FantasyPros sync failed:", result.error);
        }
      } catch (error) {
        console.error("FantasyPros scheduled job error:", error);
      }
    } else {
      console.log(`Unknown cron pattern: ${event.cron}`);
    }
  },
  getCurrentWeek(date) {
    const seasonStart = new Date(2024, 8, 5);
    const diffTime = date.getTime() - seasonStart.getTime();
    const diffWeeks = Math.ceil(diffTime / (1e3 * 60 * 60 * 24 * 7));
    return Math.max(1, Math.min(18, diffWeeks));
  }
};

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-41kHW4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-41kHW4/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
