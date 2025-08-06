import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Player {
  id: number;
  espn_id: string;
  name: string;
  position: string;
  team: string;
  status: string | null;
  bye_week: number | null;
  projected_points_week: number | null;
  projected_points_season: number | null;
  projection_source: string;
}

export function PlayerList() {
  const { get, loading, error } = useApi();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get players with proper response structure
      const playersData = await get<Player[]>('/players?limit=100');
      
      if (playersData && Array.isArray(playersData)) {
        setPlayers(playersData);
      }
    };

    fetchData();
  }, [get]);

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      QB: 'bg-blue-100 text-blue-800',
      RB: 'bg-green-100 text-green-800',
      WR: 'bg-purple-100 text-purple-800',
      TE: 'bg-orange-100 text-orange-800',
      K: 'bg-gray-100 text-gray-800',
      DEF: 'bg-red-100 text-red-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-green-100 text-green-800';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('out') || statusLower.includes('ir')) {
      return 'bg-red-100 text-red-800';
    } else if (statusLower.includes('questionable') || statusLower.includes('doubtful')) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Players ({players.length})
        </h2>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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
                Bye Week
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proj. Source
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(player.position)}`}>
                    {player.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(player.status)}`}>
                    {player.status || 'Healthy'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.bye_week || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.projection_source === 'none' ? 'No projections' : player.projection_source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {players.length === 0 && !loading && (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">No players found. Sync players from ESPN to get started.</p>
        </div>
      )}
    </div>
  );
} 