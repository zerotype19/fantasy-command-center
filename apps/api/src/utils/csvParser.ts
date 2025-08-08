export interface FantasyProsCSVRow {
  rank: number;
  tier: number;
  playerName: string;
  team: string;
  position: string;
  positionRank: number;
  byeWeek: number;
  sosRating: string;
  ecrVsAdp: string;
}

export function parseFantasyProsCSV(csvContent: string): FantasyProsCSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const rows: FantasyProsCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length < 8) continue;
    
    // Parse position to extract rank (e.g., "WR1" -> position: "WR", rank: 1)
    const positionMatch = values[4].match(/^([A-Z]+)(\d+)$/);
    const position = positionMatch ? positionMatch[1] : values[4];
    const positionRank = positionMatch ? parseInt(positionMatch[2]) : null;
    
    rows.push({
      rank: parseInt(values[0]) || 0,
      tier: parseInt(values[1]) || 0,
      playerName: values[2],
      team: values[3],
      position: position,
      positionRank: positionRank || 0,
      byeWeek: parseInt(values[5]) || 0,
      sosRating: values[6],
      ecrVsAdp: values[7]
    });
  }
  
  return rows;
}

export function matchCSVToPlayers(csvRows: FantasyProsCSVRow[], players: any[]): { matched: any[], unmatched: any[] } {
  const matched = [];
  const unmatched = [];
  
  // Create player name maps for matching
  const playerNameMap = new Map();
  const playerTeamMap = new Map();
  
  players.forEach(player => {
    if (player.search_full_name) {
      const normalizedName = normalizePlayerName(player.search_full_name);
      if (normalizedName) {
        playerNameMap.set(normalizedName, player.sleeper_id);
      }
    }
    if (player.team) {
      playerTeamMap.set(player.team, player.sleeper_id);
    }
  });
  
  csvRows.forEach(row => {
    let sleeperId = null;
    let matchMethod = '';
    
    // Try exact name match first
    const normalizedCSVName = normalizePlayerName(row.playerName);
    if (normalizedCSVName && playerNameMap.has(normalizedCSVName)) {
      sleeperId = playerNameMap.get(normalizedCSVName);
      matchMethod = 'exact_name';
    } else {
      // Try team + position match
      const teamKey = `${row.team}_${row.position}`;
      if (playerTeamMap.has(row.team)) {
        const potentialPlayer = players.find(p => p.sleeper_id === playerTeamMap.get(row.team) && p.position === row.position);
        if (potentialPlayer) {
          sleeperId = potentialPlayer.sleeper_id;
          matchMethod = 'team_position';
        }
      }
    }
    
    if (sleeperId) {
      matched.push({
        sleeper_id: sleeperId,
        fantasy_pros_draft_rank: row.rank,
        fantasy_pros_tier: row.tier,
        fantasy_pros_position_rank: row.positionRank,
        fantasy_pros_sos_rating: row.sosRating,
        fantasy_pros_ecr_vs_adp: row.ecrVsAdp,
        match_method: matchMethod,
        csv_player_name: row.playerName,
        csv_team: row.team,
        csv_position: row.position
      });
    } else {
      unmatched.push({
        rank: row.rank,
        player_name: row.playerName,
        team: row.team,
        position: row.position,
        tier: row.tier
      });
    }
  });
  
  return { matched, unmatched };
}

function normalizePlayerName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}
