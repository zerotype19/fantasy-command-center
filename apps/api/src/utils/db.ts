export class DatabaseService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // Player management
  async getAllPlayers(): Promise<any[]> {
    const result = await this.db.prepare(
      'SELECT * FROM players ORDER BY name'
    ).all();
    return result.results || [];
  }

  async getPlayerByEspnId(espnId: string): Promise<any> {
    const result = await this.db.prepare(
      'SELECT * FROM players WHERE espn_id = ?'
    ).bind(espnId).first();
    return result;
  }

  async getPlayerBySleeperId(sleeperId: string): Promise<any> {
    const result = await this.db.prepare(
      'SELECT * FROM players WHERE sleeper_id = ?'
    ).bind(sleeperId).first();
    return result;
  }

  async getPlayersBySleeperIds(sleeperIds: string[]): Promise<any[]> {
    if (sleeperIds.length === 0) return [];
    
    const placeholders = sleeperIds.map(() => '?').join(',');
    const result = await this.db.prepare(
      `SELECT * FROM players WHERE sleeper_id IN (${placeholders})`
    ).bind(...sleeperIds).all();
    return result.results || [];
  }

  async upsertSleeperPlayers(players: any[]): Promise<void> {
    if (players.length === 0) return;

    // Insert all available fields from Sleeper API
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

    const batch = players.map(player => 
      stmt.bind(
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
  async getProjectionByPlayerId(playerId: number): Promise<any> {
    const result = await this.db.prepare(
      'SELECT * FROM projections WHERE player_id = ? ORDER BY week DESC LIMIT 1'
    ).bind(playerId).first();
    return result;
  }

  // Trending players management
  async getTrendingPlayers(type: string, limit: number = 10): Promise<any[]> {
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

  async getTrendingPlayersByLookback(type: string, lookbackHours: number, limit: number = 10): Promise<any[]> {
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
}

// Standalone trending players functions for the scheduled job
export async function upsertTrendingPlayers(
  db: any, 
  trendingPlayers: any[], 
  type: string, 
  lookbackHours: number
): Promise<void> {
  if (trendingPlayers.length === 0) return;

  const stmt = db.prepare(`
    INSERT INTO trending_players (player_id, sleeper_id, type, count, lookback_hours)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(player_id, type, lookback_hours) DO UPDATE SET
      count = excluded.count,
      updated_at = CURRENT_TIMESTAMP
  `);

  const batch = trendingPlayers.map(player => 
    stmt.bind(
      player.player_id,
      player.player_id, // sleeper_id is the same as player_id for trending players
      type,
      player.count,
      lookbackHours
    )
  );

  await db.batch(batch);
}

export async function getTrendingPlayers(db: any, type: string, limit: number = 10): Promise<any[]> {
  const result = await db.prepare(`
    SELECT tp.*, p.name, p.position, p.team, p.status
    FROM trending_players tp
    LEFT JOIN players p ON tp.sleeper_id = p.sleeper_id
    WHERE tp.type = ?
    ORDER BY tp.count DESC, tp.created_at DESC
    LIMIT ?
  `).bind(type, limit).all();
  return result.results || [];
}

export async function getTrendingPlayersByLookback(db: any, type: string, lookbackHours: number, limit: number = 10): Promise<any[]> {
  const result = await db.prepare(`
    SELECT tp.*, p.name, p.position, p.team, p.status
    FROM trending_players tp
    LEFT JOIN players p ON tp.sleeper_id = p.sleeper_id
    WHERE tp.type = ? AND tp.lookback_hours = ? AND tp.created_at >= datetime('now', '-${lookbackHours} hours')
    ORDER BY tp.count DESC, tp.created_at DESC
    LIMIT ?
  `).bind(type, lookbackHours, limit).all();
  return result.results || [];
}

// FantasyPros data management
export async function upsertFantasyProsData(db: any, fantasyProsData: any[]): Promise<void> {
  if (fantasyProsData.length === 0) return;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO fantasy_pros_data (
      sleeper_id, source, week, season, ecr_rank, projected_points, 
      auction_value, sos_rank, tier, position_rank, value_over_replacement
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const batch = fantasyProsData.map(item =>
    stmt.bind(
      item.sleeper_id,
      item.source || 'FantasyPros',
      item.week || null,
      item.season || null,
      item.ecr_rank || null,
      item.projected_points || null,
      item.auction_value || null,
      item.sos_rank || null,
      item.tier || null,
      item.position_rank || null,
      item.value_over_replacement || null
    )
  );

  await db.batch(batch);
}

export async function getPlayersWithFantasyData(db: any, week?: number, season?: number): Promise<any[]> {
  let query = `
    SELECT p.*, fp.ecr_rank, fp.projected_points, fp.auction_value, fp.sos_rank, 
           fp.tier, fp.position_rank, fp.value_over_replacement, fp.source
    FROM players p
    LEFT JOIN fantasy_pros_data fp ON p.sleeper_id = fp.sleeper_id
  `;
  
  const params = [];
  if (week || season) {
    query += ' WHERE ';
    const conditions = [];
    if (week) {
      conditions.push('fp.week = ?');
      params.push(week);
    }
    if (season) {
      conditions.push('fp.season = ?');
      params.push(season);
    }
    query += conditions.join(' AND ');
  }
  
  query += ' ORDER BY p.name';
  
  const result = await db.prepare(query).bind(...params).all();
  return result.results || [];
}
