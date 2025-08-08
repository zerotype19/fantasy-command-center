import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../hooks/useApi';

interface Player {
  id: number;
  sleeper_id: string;
  name: string;
  position: string;
  team: string;
  status: string | null;
  bye_week: number | null;
  projected_points_week: number | null;
  projected_points_season: number | null;
  projection_source: string;
  // Additional fields from database
  age: number | null;
  years_exp: number | null;
  college: string | null;
  weight: string | null;
  height: string | null;
  jersey_number: number | null;
  fantasy_positions: string | null;
  fantasy_data_id: number | null;
  search_rank: number | null;
  injury_status: string | null;
  injury_start_date: string | null;
  injury_notes: string | null;
  practice_participation: string | null;
  depth_chart_position: string | null;
  depth_chart_order: number | null;
  yahoo_id: number | null;
  rotowire_id: number | null;
  rotoworld_id: number | null;
  sportradar_id: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  birth_city: string | null;
  birth_state: string | null;
  birth_country: string | null;
  high_school: string | null;
  hashtag: string | null;
  team_abbr: string | null;
  team_changed_at: string | null;
  gsis_id: string | null;
  swish_id: number | null;
  stats_id: number | null;
  oddsjam_id: string | null;
  opta_id: string | null;
  pandascore_id: string | null;
  sport: string | null;
  news_updated: number | null;
  practice_description: string | null;
  injury_body_part: string | null;
  search_first_name: string | null;
  search_last_name: string | null;
  search_full_name: string | null;
  metadata: string | null;
  competitions: string | null;
  created_at: string;
  updated_at: string;
  // FantasyPros data fields
  ecr_rank: number | null;
  projected_points: number | null;
  auction_value: number | null;
  sos_rank: number | null;
  tier: number | null;
  position_rank: number | null;
  value_over_replacement: number | null;
  source: string | null;
}

interface TrendingPlayer {
  player_id: string;
  count: number;
  type: string;
  lookback_hours: number;
  created_at: string;
}

export default function ResearchPlayers() {
  const { get, loading, error } = useApi();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingPlayer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  const fetchPlayers = useCallback(async () => {
    setIsLoadingPlayers(true);
    try {
      // Load all players (FantasyPros data is now stored directly in players table)
      const response = await get<any>('/players');
      console.log('API Response:', response);
      if (response && response.data && response.data.players) {
        console.log('Setting players:', response.data.players.length);
        setPlayers(response.data.players);
      } else {
        console.log('No players found in response');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [get]);

  const fetchTrendingData = useCallback(async (playerId: string) => {
    setIsLoadingTrending(true);
    try {
      // Fetch trending data for both add and drop types
      const [addData, dropData] = await Promise.all([
        get<TrendingPlayer[]>(`/trending/players?type=add&limit=50`),
        get<TrendingPlayer[]>(`/trending/players?type=drop&limit=50`)
      ]);
      
      const allTrending = [
        ...(addData || []).filter(t => t.player_id === playerId),
        ...(dropData || []).filter(t => t.player_id === playerId)
      ];
      
      setTrendingData(allTrending);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setTrendingData([]);
    } finally {
      setIsLoadingTrending(false);
    }
  }, [get]);

  const openPlayerModal = useCallback(async (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
    await fetchTrendingData(player.sleeper_id);
  }, [fetchTrendingData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
    setTrendingData([]);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const filteredPlayers = useMemo(() => {
    let filtered = players;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchLower) ||
        player.team.toLowerCase().includes(searchLower)
      );
    }

    // Apply position filter
    if (positionFilter) {
      filtered = filtered.filter(player =>
        player.position.toUpperCase() === positionFilter.toUpperCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Player];
      const bValue = b[sortBy as keyof Player];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [players, searchTerm, positionFilter, sortBy, sortOrder]);

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Players</h1>
          <p className="text-gray-600 mt-1">
            Explore all players from the database (updated daily via Sleeper API)
          </p>
        </div>
      </div>



      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Players
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or team..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="position">Position</option>
              <option value="team">Team</option>
              <option value="bye_week">Bye Week</option>
              <option value="status">Status</option>
              <option value="ecr_rank">ECR Rank</option>
              <option value="projected_points">Projected Points</option>
              <option value="auction_value">Auction Value</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Players Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Players ({filteredPlayers.length})
            </h2>
            <div className="text-sm text-gray-500">
              {players.length > 0 && (
                <span>Total: {players.length} players loaded</span>
              )}
            </div>
          </div>
        </div>
        
        {loading || isLoadingPlayers ? (
          <div className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isLoadingPlayers ? 'Loading all players...' : 'Syncing players...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Exp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ECR Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proj. Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auction Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr 
                    key={player.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openPlayerModal(player)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.age && player.years_exp 
                        ? `${player.age}/${player.years_exp}`
                        : player.age 
                        ? `${player.age}`
                        : player.years_exp 
                        ? `Exp: ${player.years_exp}`
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.college || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.status || 'Active'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.bye_week || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.ecr_rank ? `#${player.ecr_rank}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.projected_points ? player.projected_points.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.auction_value ? `$${player.auction_value}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Player Details Modal */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPlayer.name} - {selectedPlayer.position} - {selectedPlayer.team}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span>{selectedPlayer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Position:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {selectedPlayer.position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Team:</span>
                      <span>{selectedPlayer.team}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span>{selectedPlayer.status || 'Active'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Bye Week:</span>
                      <span>{selectedPlayer.bye_week || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Age:</span>
                      <span>{selectedPlayer.age || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Years Experience:</span>
                      <span>{selectedPlayer.years_exp || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">College:</span>
                      <span>{selectedPlayer.college || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Height:</span>
                      <span>{selectedPlayer.height || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Weight:</span>
                      <span>{selectedPlayer.weight || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Jersey Number:</span>
                      <span>{selectedPlayer.jersey_number || '-'}</span>
                    </div>
                  </div>
                </div>

                                  {/* Fantasy Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Fantasy Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Fantasy Positions:</span>
                      <span>{selectedPlayer.fantasy_positions || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Search Rank:</span>
                      <span>{selectedPlayer.search_rank || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Depth Chart Position:</span>
                      <span>{selectedPlayer.depth_chart_position || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Depth Chart Order:</span>
                      <span>{selectedPlayer.depth_chart_order || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Projection Source:</span>
                      <span>{selectedPlayer.projection_source === 'none' ? 'No projections' : selectedPlayer.projection_source}</span>
                    </div>
                  </div>

                  {/* FantasyPros Data */}
                  <h4 className="text-md font-semibold text-gray-900 mb-3 mt-4">FantasyPros Data</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">ECR Rank:</span>
                      <span>{selectedPlayer.ecr_rank ? `#${selectedPlayer.ecr_rank}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Projected Points:</span>
                      <span>{selectedPlayer.projected_points ? selectedPlayer.projected_points.toFixed(1) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Auction Value:</span>
                      <span>{selectedPlayer.auction_value ? `$${selectedPlayer.auction_value}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">SOS Rank:</span>
                      <span>{selectedPlayer.sos_rank ? `#${selectedPlayer.sos_rank}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Tier:</span>
                      <span>{selectedPlayer.tier || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Position Rank:</span>
                      <span>{selectedPlayer.position_rank ? `#${selectedPlayer.position_rank}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Value Over Replacement:</span>
                      <span>{selectedPlayer.value_over_replacement ? selectedPlayer.value_over_replacement.toFixed(1) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Data Source:</span>
                      <span>{selectedPlayer.source || '-'}</span>
                    </div>
                  </div>

                  {/* Injury Information */}
                  <h4 className="text-md font-semibold text-gray-900 mb-3 mt-4">Injury Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Injury Status:</span>
                      <span>{selectedPlayer.injury_status || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Injury Start Date:</span>
                      <span>{selectedPlayer.injury_start_date || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Injury Notes:</span>
                      <span>{selectedPlayer.injury_notes || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Practice Participation:</span>
                      <span>{selectedPlayer.practice_participation || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Injury Body Part:</span>
                      <span>{selectedPlayer.injury_body_part || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Data */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Trending Data</h4>
                {isLoadingTrending ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading trending data...</p>
                  </div>
                ) : trendingData.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trendingData.map((trend, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              {trend.type === 'add' ? '📈 Trending Up' : '📉 Trending Down'}
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              {trend.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {trend.lookback_hours}h lookback • {new Date(trend.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No trending data available for this player
                  </div>
                )}
              </div>

              {/* External IDs */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">External IDs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Sleeper ID:</span>
                    <span className="font-mono">{selectedPlayer.sleeper_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ESPN ID:</span>
                    <span className="font-mono">{selectedPlayer.espn_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Yahoo ID:</span>
                    <span className="font-mono">{selectedPlayer.yahoo_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Rotowire ID:</span>
                    <span className="font-mono">{selectedPlayer.rotowire_id || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 