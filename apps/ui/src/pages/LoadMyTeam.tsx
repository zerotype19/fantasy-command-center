import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';

interface TeamPlayer {
  espn_id: string;
  name: string;
  position: string;
  team: string;
  status: string;
  bye_week: number | null;
  projected_points_week: number | null;
  projected_points_season: number | null;
  projection_source: string;
}

interface TeamData {
  success: boolean;
  team: {
    id: number;
    name: string;
    abbreviation: string;
  };
  players: TeamPlayer[];
  count: number;
}

export function LoadMyTeam() {
  const { get, loading, error } = useApi();
  const [leagueId, setLeagueId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    if (!leagueId || !teamId) {
      alert('Please enter both League ID and Team ID');
      return;
    }

    setLoadError(null);
    try {
      const data = await get<TeamData>(`/team/${leagueId}/${teamId}`);
      if (data) {
        setTeamData(data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load team';
      setLoadError(errorMessage);
      console.error('Load team error:', err);
    }
  }, [get, leagueId, teamId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Load My Team</h1>
        <p className="text-gray-600 mt-1">
          Enter your ESPN League ID and Team ID to load your roster
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ESPN League ID
            </label>
            <input
              type="text"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              placeholder="e.g., 853351"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ESPN Team ID
            </label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadTeam}
              disabled={loading || !leagueId || !teamId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Loading...' : 'Load Team'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
          <p className="text-sm text-red-600 mb-3">{loadError || error}</p>
          <div className="text-sm text-red-700">
            <p className="font-medium mb-1">To fix this issue:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you're signed into ESPN in your browser</li>
              <li>Verify the League ID and Team ID are correct</li>
              <li>Ensure you have access to the league (it may be private)</li>
              <li>Check that the team ID exists in the league</li>
            </ul>
          </div>
        </div>
      )}

      {/* Team Data */}
      {teamData && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {teamData.team.name} ({teamData.team.abbreviation})
            </h2>
            <p className="text-sm text-gray-600">
              {teamData.count} players on roster
            </p>
          </div>
          
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
                    Bye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proj. Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamData.players.map((player) => (
                  <tr key={player.espn_id} className="hover:bg-gray-50">
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
                        player.status === 'healthy' 
                          ? 'bg-green-100 text-green-800'
                          : player.status === 'questionable'
                          ? 'bg-yellow-100 text-yellow-800'
                          : player.status === 'out'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.status || 'Healthy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.bye_week || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.projected_points_week?.toFixed(1) || '-'}
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
        <h3 className="text-sm font-medium text-blue-800 mb-2">How to find your League ID and Team ID:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Go to your ESPN Fantasy Football league</li>
          <li>2. Look at the URL: <code className="bg-blue-100 px-1 rounded">https://fantasy.espn.com/football/team?leagueId=853351&teamId=1</code></li>
          <li>3. The <code className="bg-blue-100 px-1 rounded">leagueId</code> is your League ID</li>
          <li>4. The <code className="bg-blue-100 px-1 rounded">teamId</code> is your Team ID</li>
        </ol>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If you get an "unauthorized" error, make sure you're signed into ESPN in your browser and have access to the league.
          </p>
        </div>
      </div>
    </div>
  );
} 