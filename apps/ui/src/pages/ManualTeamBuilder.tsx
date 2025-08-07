import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface Player {
  sleeper_id: string;
  name: string;
  position: string;
  team: string;
  status?: string;
  bye_week?: number;
  projected_points_week?: number;
  projected_points_season?: number;
  fantasy_pros_ecr?: number;
  fantasy_pros_tier?: string;
}

interface TeamPlayer extends Player {
  roster_slot?: string;
  added_at: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    players: Player[];
    count: number;
  };
}

const ManualTeamBuilder: React.FC = () => {
  const { get, post } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [teamName, setTeamName] = useState('My Fantasy Team');

  // Load team from localStorage on component mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('fantasy-team');
    if (savedTeam) {
      try {
        const parsed = JSON.parse(savedTeam);
        setTeamPlayers(parsed.players || []);
        setTeamName(parsed.name || 'My Fantasy Team');
      } catch (err) {
        console.error('Error loading saved team:', err);
      }
    }
  }, []);

  // Save team to localStorage whenever it changes
  useEffect(() => {
    const teamData = {
      name: teamName,
      players: teamPlayers,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('fantasy-team', JSON.stringify(teamData));
  }, [teamName, teamPlayers]);

  const searchPlayers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('search', searchTerm);
      if (selectedPosition) params.append('position', selectedPosition);

      const response = await get<SearchResponse>(`/players?${params.toString()}`);
      
      if (response && response.success) {
        setSearchResults(response.data.players);
      } else {
        setError('Failed to search players');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search players');
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = (player: Player) => {
    // Check if player is already on team
    const isAlreadyOnTeam = teamPlayers.some(p => p.sleeper_id === player.sleeper_id);
    if (isAlreadyOnTeam) {
      alert(`${player.name} is already on your team!`);
      return;
    }

    // Check position limits
    const positionCounts = teamPlayers.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currentCount = positionCounts[player.position] || 0;
    const maxCount = getMaxPositionCount(player.position);
    
    if (currentCount >= maxCount) {
      alert(`You already have ${maxCount} ${player.position} players. Consider removing one first.`);
      return;
    }

    const teamPlayer: TeamPlayer = {
      ...player,
      added_at: new Date().toISOString()
    };

    setTeamPlayers(prev => [...prev, teamPlayer]);
  };

  const removePlayerFromTeam = (playerId: string) => {
    setTeamPlayers(prev => prev.filter(p => p.sleeper_id !== playerId));
  };

  const getMaxPositionCount = (position: string): number => {
    const limits: Record<string, number> = {
      'QB': 3,
      'RB': 6,
      'WR': 6,
      'TE': 3,
      'K': 2,
      'DEF': 2,
      'DST': 2
    };
    return limits[position] || 5;
  };

  const getPositionCount = (position: string): number => {
    return teamPlayers.filter(p => p.position === position).length;
  };

  const getTeamStats = () => {
    const stats = {
      total: teamPlayers.length,
      byPosition: teamPlayers.reduce((acc, p) => {
        acc[p.position] = (acc[p.position] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      projectedPoints: teamPlayers.reduce((sum, p) => sum + (p.projected_points_week || 0), 0)
    };
    return stats;
  };

  const clearTeam = () => {
    if (confirm('Are you sure you want to clear your entire team?')) {
      setTeamPlayers([]);
    }
  };

  const exportTeam = () => {
    const teamData = {
      name: teamName,
      players: teamPlayers,
      stats: getTeamStats(),
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teamName.replace(/\s+/g, '_')}_team.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Team Builder</h1>
        <p className="text-gray-600 mt-1">
          Search for players and build your fantasy team manually
        </p>
      </div>

      {/* Team Name */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your team name"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportTeam}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export Team
            </button>
            <button
              onClick={clearTeam}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Clear Team
            </button>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      {teamPlayers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Team Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{getTeamStats().total}</div>
              <div className="text-sm text-blue-800">Total Players</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getTeamStats().projectedPoints.toFixed(1)}
              </div>
              <div className="text-sm text-green-800">Proj. Points</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {teamPlayers.filter(p => p.status === 'healthy' || !p.status).length}
              </div>
              <div className="text-sm text-purple-800">Healthy Players</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {teamPlayers.filter(p => p.status === 'questionable' || p.status === 'out').length}
              </div>
              <div className="text-sm text-orange-800">Injured Players</div>
            </div>
          </div>
        </div>
      )}

      {/* Player Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Search Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchPlayers()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={searchPlayers}
              disabled={loading || !searchTerm.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Search Results ({searchResults.length})
            </h3>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proj. Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((player) => (
                    <tr key={player.sleeper_id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          player.status === 'healthy' || !player.status
                            ? 'bg-green-100 text-green-800'
                            : player.status === 'questionable'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {player.status || 'Healthy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.projected_points_week?.toFixed(1) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => addPlayerToTeam(player)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Add to Team
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* My Team */}
      {teamPlayers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">My Team</h2>
          
          {/* Position Breakdown */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Roster Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {positions.map(position => {
                const count = getPositionCount(position);
                const maxCount = getMaxPositionCount(position);
                return (
                  <div key={position} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{position}</span>
                      <span className="text-sm text-gray-500">{count}/{maxCount}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          count >= maxCount ? 'bg-red-500' : 
                          count >= maxCount * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Players */}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proj. Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamPlayers.map((player) => (
                  <tr key={player.sleeper_id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        player.status === 'healthy' || !player.status
                          ? 'bg-green-100 text-green-800'
                          : player.status === 'questionable'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {player.status || 'Healthy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.projected_points_week?.toFixed(1) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(player.added_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removePlayerFromTeam(player.sleeper_id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How to use the Manual Team Builder:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Enter a player name in the search box</li>
          <li>2. Optionally filter by position</li>
          <li>3. Click "Search" to find players</li>
          <li>4. Click "Add to Team" to add players to your roster</li>
          <li>5. Your team is automatically saved to your browser</li>
          <li>6. Use "Export Team" to download your team data</li>
        </ol>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your team is saved locally in your browser. Clear your browser data to reset your team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualTeamBuilder;
