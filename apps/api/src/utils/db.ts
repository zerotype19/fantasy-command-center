import { D1Database } from '@cloudflare/workers-types';

export interface DatabaseEnv {
  DB: D1Database;
}

export class DatabaseService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // League Settings
  async upsertLeagueSettings(
    userId: string,
    leagueId: string,
    scoringJson: string,
    rosterJson: string,
    keeperRulesJson: string,
    auctionBudget: number,
    waiverBudget: number
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO league_settings (user_id, league_id, scoring_json, roster_json, keeper_rules_json, auction_budget, waiver_budget)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, league_id) 
      DO UPDATE SET 
        scoring_json = excluded.scoring_json,
        roster_json = excluded.roster_json,
        keeper_rules_json = excluded.keeper_rules_json,
        auction_budget = excluded.auction_budget,
        waiver_budget = excluded.waiver_budget,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.bind(userId, leagueId, scoringJson, rosterJson, keeperRulesJson, auctionBudget, waiverBudget).run();
  }

  async getLeagueSettings(userId: string, leagueId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM league_settings 
      WHERE user_id = ? AND league_id = ?
    `);
    
    return stmt.bind(userId, leagueId).first();
  }

  // Players
  async upsertPlayer(
    espnId: string,
    name: string,
    position: string,
    team: string,
    status?: string,
    byeWeek?: number
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO players (espn_id, name, position, team, status, bye_week)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(espn_id) 
      DO UPDATE SET 
        name = excluded.name,
        position = excluded.position,
        team = excluded.team,
        status = excluded.status,
        bye_week = excluded.bye_week,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.bind(espnId, name, position, team, status || null, byeWeek || null).run();
  }

  async getAllPlayers() {
    const stmt = this.db.prepare(`
      SELECT * FROM players ORDER BY name
    `);
    
    return stmt.all();
  }

  async getPlayerByEspnId(espnId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM players WHERE espn_id = ?
    `);
    
    return stmt.bind(espnId).first();
  }

  // Projections
  async upsertProjection(
    playerId: number,
    week: number,
    season: number,
    projectedPoints: number,
    source: string
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO projections (player_id, week, season, projected_points, source)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(player_id, week, season, source) 
      DO UPDATE SET 
        projected_points = excluded.projected_points,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.bind(playerId, week, season, projectedPoints, source).run();
  }

  async getProjectionsByWeek(week: number, season: number) {
    const stmt = this.db.prepare(`
      SELECT p.*, pl.name, pl.position, pl.team
      FROM projections p
      JOIN players pl ON p.player_id = pl.id
      WHERE p.week = ? AND p.season = ?
      ORDER BY p.projected_points DESC
    `);
    
    return stmt.bind(week, season).all();
  }

  // Alerts
  async createAlert(
    userId: string,
    leagueId: string,
    type: string,
    message: string
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO alerts (user_id, league_id, type, message)
      VALUES (?, ?, ?, ?)
    `);
    
    return stmt.bind(userId, leagueId, type, message).run();
  }

  async getAlerts(userId: string, leagueId?: string) {
    let stmt;
    if (leagueId) {
      stmt = this.db.prepare(`
        SELECT * FROM alerts 
        WHERE user_id = ? AND league_id = ?
        ORDER BY created_at DESC
      `);
      return stmt.bind(userId, leagueId).all();
    } else {
      stmt = this.db.prepare(`
        SELECT * FROM alerts 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `);
      return stmt.bind(userId).all();
    }
  }

  async markAlertAsRead(alertId: number) {
    const stmt = this.db.prepare(`
      UPDATE alerts SET status = 'read', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    return stmt.bind(alertId).run();
  }

  // Transactions
  async createTransaction(
    userId: string,
    leagueId: string,
    transactionType: string,
    playerId: number,
    detailsJson: string
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO transactions (user_id, league_id, transaction_type, player_id, details_json)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    return stmt.bind(userId, leagueId, transactionType, playerId, detailsJson).run();
  }

  async getTransactions(userId: string, leagueId?: string) {
    let stmt;
    if (leagueId) {
      stmt = this.db.prepare(`
        SELECT t.*, p.name, p.position, p.team
        FROM transactions t
        JOIN players p ON t.player_id = p.id
        WHERE t.user_id = ? AND t.league_id = ?
        ORDER BY t.created_at DESC
      `);
      return stmt.bind(userId, leagueId).all();
    } else {
      stmt = this.db.prepare(`
        SELECT t.*, p.name, p.position, p.team
        FROM transactions t
        JOIN players p ON t.player_id = p.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
      `);
      return stmt.bind(userId).all();
    }
  }

  // Keepers
  async upsertKeeper(
    userId: string,
    leagueId: string,
    playerId: number,
    keeperCost: number
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO keepers (user_id, league_id, player_id, keeper_cost)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, league_id, player_id) 
      DO UPDATE SET 
        keeper_cost = excluded.keeper_cost,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    return stmt.bind(userId, leagueId, playerId, keeperCost).run();
  }

  async getKeepers(userId: string, leagueId: string) {
    const stmt = this.db.prepare(`
      SELECT k.*, p.name, p.position, p.team
      FROM keepers k
      JOIN players p ON k.player_id = p.id
      WHERE k.user_id = ? AND k.league_id = ?
      ORDER BY p.name
    `);
    
    return stmt.bind(userId, leagueId).all();
  }
} 