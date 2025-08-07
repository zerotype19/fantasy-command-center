import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';

interface NFLGame {
  id: number;
  game_id: string;
  week: number;
  game_date: string;
  kickoff_time?: string;
  home_team: string;
  away_team: string;
  location?: string;
  network?: string;
  game_type: string;
  created_at: string;
  updated_at: string;
}

export function NFLSchedule() {
  const { get, loading, error } = useApi();
  const [games, setGames] = useState<NFLGame[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchGames = useCallback(async (week?: number) => {
    setIsLoading(true);
    try {
      const url = week ? `/nfl/schedule?week=${week}` : '/nfl/schedule';
      const response = await get<any>(url);
      
      if (response && response.data && response.data.games) {
        setGames(response.data.games);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching NFL schedule:', error);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchGames(selectedWeek || undefined);
  }, [fetchGames, selectedWeek]);

  const filteredGames = games.filter(game => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      game.home_team.toLowerCase().includes(searchLower) ||
      game.away_team.toLowerCase().includes(searchLower) ||
      game.location?.toLowerCase().includes(searchLower) ||
      game.network?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    
    return `${displayHour}:${minutes} ${ampm} ET`;
  };

  const weekOptions = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NFL Schedule</h1>
        <p className="text-gray-600">View and search the complete 2025 NFL season schedule.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label htmlFor="week-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Week
          </label>
          <select
            id="week-filter"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Weeks</option>
            {weekOptions.map(week => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-48">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search teams, locations, networks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading NFL schedule...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">Error loading NFL schedule: {error}</p>
        </div>
      )}

      {/* Games List */}
      {!isLoading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No games found matching your criteria.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredGames.map((game) => (
                <li key={game.game_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Week {game.week}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{game.away_team}</span>
                            <span className="text-gray-500">@</span>
                            <span className="font-medium text-gray-900">{game.home_team}</span>
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-500">
                            <span>{formatDate(game.game_date)}</span>
                            {game.kickoff_time && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{formatTime(game.kickoff_time)}</span>
                              </>
                            )}
                            {game.network && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{game.network}</span>
                              </>
                            )}
                          </div>
                          
                          {game.location && (
                            <div className="mt-1 text-sm text-gray-400">
                              {game.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {game.game_type}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Summary */}
      {!isLoading && !error && filteredGames.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredGames.length} of {games.length} games
          {selectedWeek && ` for Week ${selectedWeek}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
}
