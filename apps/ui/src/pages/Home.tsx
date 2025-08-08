import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { PlayerList } from '../components/PlayerList';

interface Alert {
  id: number;
  user_id: string;
  league_id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

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

interface Stats {
  playerCount: number;
  lastUpdate: string | null;
}

export default function Home() {
  const { get, loading, error } = useApi();
  const [stats, setStats] = useState<Stats>({
    playerCount: 0,
    lastUpdate: null,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get players
      const playersData = await get<Player[]>('/players?limit=100');
      
      // Get alerts with a default userId (we'll improve this later)
      const alertsData = await get<Alert[]>(`/alerts?userId=default`);
      
      if (playersData && Array.isArray(playersData)) {
        setStats(prev => ({
          ...prev,
          playerCount: playersData.length,
          lastUpdate: playersData.length > 0 
            ? new Date().toLocaleString() // Since we don't have projection timestamps, use current time
            : null,
        }));
      }
      
      if (alertsData && Array.isArray(alertsData)) {
        setAlerts(alertsData.slice(0, 5)); // Show only 5 most recent alerts
      }
    };

    fetchData();
  }, [get]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Players
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.playerCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Update
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {loading ? '...' : stats.lastUpdate || 'Never'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.type}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    alert.status === 'unread' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player List */}
      <PlayerList />
    </div>
  );
} 