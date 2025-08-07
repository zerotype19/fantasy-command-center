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

    // Use a simpler approach with just the essential columns
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO players (
        sleeper_id, espn_id, name, position, team, status, bye_week
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const batch = players.map(player => 
      stmt.bind(
        player.sleeper_id,
        player.espn_id || null, // Handle null espn_id
        player.name,
        player.position,
        player.team,
        player.status,
        player.bye_week
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
