import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { LeagueForm } from '../components/LeagueForm';

interface LeagueSettings {
  id: number;
  user_id: string;
  league_id: string;
  scoring_json: string;
  roster_json: string;
  keeper_rules_json: string;
  auction_budget: number;
  waiver_budget: number;
  created_at: string;
  updated_at: string;
}

export function League() {
  const { get, loading, error } = useApi();
  const [leagueData, setLeagueData] = useState<LeagueSettings | null>(null);

  const fetchLeagueData = useCallback(async () => {
    // Use the same userId as the form ('default-user') to match the saved data
    const data = await get<LeagueSettings>('/league?userId=default-user&leagueId=default');
    if (data) {
      setLeagueData(data);
    }
  }, [get]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">League Setup</h1>
        <p className="text-gray-600 mb-6">
          Configure your league settings and sync data from ESPN and FantasyPros.
        </p>
      </div>

      <LeagueForm onSave={fetchLeagueData} />

      {/* Debug Output */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Debug: League Data</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : leagueData ? (
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(leagueData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            No league data found. Save your league settings to see the data here.
          </div>
        )}
      </div>
    </div>
  );
} 