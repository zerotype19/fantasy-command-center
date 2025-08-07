import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface PlayerMatchup {
  id: number;
  player_id: number;
  week: number;
  game_id: string;
  opponent_team: string;
  is_home: boolean;
  game_date: string;
  game_time: string;
  network: string;
  weather_flag?: string;
  rest_days?: number;
  opponent_position_rank?: number;
  weather_forecast?: string;
  temperature_low?: number;
  temperature_high?: number;
  precipitation_chance?: number;
  wind_speed?: string;
  name: string;
  team: string;
  position: string;
}

interface MatchupsResponse {
  success: boolean;
  data: {
    matchups: PlayerMatchup[];
    count: number;
  };
}

const PlayerMatchups: React.FC = () => {
  const [matchups, setMatchups] = useState<PlayerMatchup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { get, post } = useApi();

  const fetchMatchups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedWeek) params.append('week', selectedWeek.toString());
      if (selectedTeam) params.append('team', selectedTeam);
      
      const response = await get<MatchupsResponse>(`/matchups?${params.toString()}`);
      
      if (response && response.success) {
        setMatchups(response.data.matchups);
      } else {
        setError('Failed to fetch matchups');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matchups');
    } finally {
      setLoading(false);
    }
  };

  const syncMatchups = async () => {
    setSyncLoading(true);
    setSyncError(null);
    
    try {
      const response = await post(`/sync/matchups?week=${selectedWeek}`, {});
      
      if (response && response.success) {
        await fetchMatchups(); // Refresh the data
      } else {
        setSyncError('Failed to sync matchups');
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync matchups');
    } finally {
      setSyncLoading(false);
    }
  };

  const syncWeather = async () => {
    setSyncLoading(true);
    setSyncError(null);
    
    try {
      const response = await post(`/sync/weather?week=${selectedWeek}`, {});
      
      if (response && response.success) {
        await fetchMatchups(); // Refresh the data
      } else {
        setSyncError('Failed to sync weather');
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync weather');
    } finally {
      setSyncLoading(false);
    }
  };

  const syncDefenseStrength = async () => {
    setSyncLoading(true);
    setSyncError(null);
    
    try {
      const response = await post('/sync/defense-strength', {});
      
      if (response && response.success) {
        await fetchMatchups(); // Refresh the data
      } else {
        setSyncError('Failed to sync defense strength');
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync defense strength');
    } finally {
      setSyncLoading(false);
    }
  };

  const updateMatchupsWithDefense = async () => {
    setSyncLoading(true);
    setSyncError(null);
    
    try {
      const response = await post(`/sync/matchups-defense?week=${selectedWeek}`, {});
      
      if (response && response.success) {
        await fetchMatchups(); // Refresh the data
      } else {
        setSyncError('Failed to update matchups with defense');
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to update matchups with defense');
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchups();
  }, [selectedWeek, selectedTeam]);

  const getWeatherIcon = (forecast: string) => {
    if (!forecast) return '🌤️';
    const lower = forecast.toLowerCase();
    if (lower.includes('rain')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('sun')) return '☀️';
    if (lower.includes('wind')) return '💨';
    return '🌤️';
  };

  const getDefenseStrengthColor = (rank: number) => {
    if (rank <= 5) return 'text-red-600 font-bold';
    if (rank <= 10) return 'text-orange-600 font-semibold';
    if (rank <= 15) return 'text-yellow-600';
    if (rank <= 20) return 'text-blue-600';
    return 'text-green-600';
  };

  const teams = [
    'BUF', 'MIA', 'NE', 'NYJ', 'BAL', 'CIN', 'CLE', 'PIT',
    'HOU', 'IND', 'JAX', 'TEN', 'DEN', 'KC', 'LV', 'LAC',
    'DAL', 'NYG', 'PHI', 'WAS', 'CHI', 'DET', 'GB', 'MIN',
    'ATL', 'CAR', 'NO', 'TB', 'ARI', 'LAR', 'SF', 'SEA'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Player Matchups</h1>
        <p className="text-gray-600 mb-6">
          View player matchups with weather and defense information
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Filter
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sync Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={syncMatchups}
            disabled={syncLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {syncLoading ? 'Syncing...' : 'Sync Matchups'}
          </button>
          
          <button
            onClick={syncWeather}
            disabled={syncLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {syncLoading ? 'Syncing...' : 'Sync Weather'}
          </button>
          
          <button
            onClick={syncDefenseStrength}
            disabled={syncLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {syncLoading ? 'Syncing...' : 'Sync Defense'}
          </button>
          
          <button
            onClick={updateMatchupsWithDefense}
            disabled={syncLoading}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {syncLoading ? 'Updating...' : 'Update Defense'}
          </button>
        </div>

        {syncError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {syncError}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Matchups Display */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Matchups for Week {selectedWeek} ({matchups.length} players)
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading matchups...</p>
          </div>
        ) : matchups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No matchups found for the selected criteria
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
                    Matchup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weather
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game Info
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchups.map((matchup) => (
                  <tr key={matchup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {matchup.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {matchup.position} • {matchup.team}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className={matchup.is_home ? 'text-green-600' : 'text-blue-600'}>
                          {matchup.is_home ? 'vs' : '@'} {matchup.opponent_team}
                        </span>
                      </div>
                      {matchup.rest_days !== null && (
                        <div className="text-xs text-gray-500">
                          {matchup.rest_days} days rest
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {matchup.weather_forecast ? (
                        <div>
                          <div className="flex items-center text-sm text-gray-900">
                            <span className="mr-2">{getWeatherIcon(matchup.weather_forecast)}</span>
                            <span>{matchup.weather_forecast}</span>
                          </div>
                          {(matchup.temperature_low || matchup.temperature_high) && (
                            <div className="text-xs text-gray-500">
                              {matchup.temperature_low && `${matchup.temperature_low}°F`}
                              {matchup.temperature_low && matchup.temperature_high && ' - '}
                              {matchup.temperature_high && `${matchup.temperature_high}°F`}
                            </div>
                          )}
                          {matchup.wind_speed && (
                            <div className="text-xs text-gray-500">
                              Wind: {matchup.wind_speed}
                            </div>
                          )}
                          {matchup.precipitation_chance && (
                            <div className="text-xs text-gray-500">
                              Rain: {matchup.precipitation_chance}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No weather data</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {matchup.opponent_position_rank ? (
                        <div>
                          <span className={`text-sm ${getDefenseStrengthColor(matchup.opponent_position_rank)}`}>
                            #{matchup.opponent_position_rank} DEF
                          </span>
                          <div className="text-xs text-gray-500">
                            {matchup.opponent_position_rank <= 5 ? 'Elite' :
                             matchup.opponent_position_rank <= 10 ? 'Strong' :
                             matchup.opponent_position_rank <= 15 ? 'Average' :
                             matchup.opponent_position_rank <= 20 ? 'Weak' : 'Very Weak'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No defense data</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {matchup.game_date && (
                        <div className="text-sm text-gray-900">
                          {new Date(matchup.game_date).toLocaleDateString()}
                        </div>
                      )}
                      {matchup.game_time && (
                        <div className="text-sm text-gray-500">
                          {matchup.game_time}
                        </div>
                      )}
                      {matchup.network && (
                        <div className="text-xs text-gray-400">
                          {matchup.network}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerMatchups;
