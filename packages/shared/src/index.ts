// Common types for the fantasy command center
export interface Player {
  id: number;
  espnId: string;
  name: string;
  position: string;
  team: string;
  status?: string;
  byeWeek?: number;
  created_at: string;
  updated_at: string;
}

export interface Projection {
  id: number;
  playerId: number;
  week: number;
  season: number;
  projectedPoints: number;
  source: string;
  created_at: string;
  updated_at: string;
  player?: Player;
}

export interface LeagueSettings {
  id: number;
  userId: string;
  leagueId: string;
  scoringJson: string;
  rosterJson: string;
  keeperRulesJson: string;
  auctionBudget: number;
  waiverBudget: number;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  userId: string;
  leagueId: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  userId: string;
  leagueId: string;
  transactionType: string;
  playerId: number;
  detailsJson: string;
  created_at: string;
  updated_at: string;
  player?: Player;
}

export interface Keeper {
  id: number;
  userId: string;
  leagueId: string;
  playerId: number;
  keeperCost: number;
  created_at: string;
  updated_at: string;
  player?: Player;
}

// API response types
export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
  total?: number;
}

// Common utilities
export function formatPlayerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function validateEspnId(espnId: string): boolean {
  return /^\d+$/.test(espnId);
}

export function validatePosition(position: string): boolean {
  const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'];
  return validPositions.includes(position.toUpperCase());
}

export function validateTeam(team: string): boolean {
  const validTeams = [
    'ATL', 'BUF', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'TEN',
    'IND', 'KC', 'LV', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ',
    'PHI', 'ARI', 'PIT', 'LAC', 'SF', 'SEA', 'TB', 'WAS', 'CAR', 'JAX',
    'BAL', 'HOU', 'FA'
  ];
  return validTeams.includes(team.toUpperCase());
} 