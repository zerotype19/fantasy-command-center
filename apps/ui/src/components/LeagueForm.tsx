import { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface LeagueSettings {
  userId: string;
  leagueId: string;
  scoringJson: string;
  rosterJson: string;
  keeperRulesJson: string;
  auctionBudget: number;
  waiverBudget: number;
}

interface LeagueFormProps {
  onSave?: (formData: LeagueSettings) => void;
}

export function LeagueForm({ onSave }: LeagueFormProps) {
  const { post, loading, error } = useApi();
  const [formData, setFormData] = useState<LeagueSettings>({
    userId: 'default-user', // TODO: Replace with actual user ID
    leagueId: '',
    scoringJson: '{}',
    rosterJson: '{}',
    keeperRulesJson: '{}',
    auctionBudget: 200,
    waiverBudget: 100,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const result = await post('/league', formData);
    if (result) {
      alert('League settings saved successfully!');
      // Notify parent component to refresh data with the saved form data
      onSave?.(formData);
    }
  };

  const handleSyncESPN = async () => {
    const result = await post('/sync/espn', { leagueId: formData.leagueId });
    if (result) {
      alert('ESPN players synced successfully!');
    }
  };

  const handleSyncProjections = async () => {
    const result = await post('/sync/projections', {});
    if (result) {
      alert('Projections synced successfully!');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">League Settings</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* League ID */}
        <div>
          <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700">
            League ID
          </label>
          <input
            type="text"
            name="leagueId"
            id="leagueId"
            value={formData.leagueId}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your ESPN League ID"
          />
        </div>

        {/* Budget Settings */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="auctionBudget" className="block text-sm font-medium text-gray-700">
              Auction Budget
            </label>
            <input
              type="number"
              name="auctionBudget"
              id="auctionBudget"
              value={formData.auctionBudget}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="waiverBudget" className="block text-sm font-medium text-gray-700">
              Waiver Budget
            </label>
            <input
              type="number"
              name="waiverBudget"
              id="waiverBudget"
              value={formData.waiverBudget}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* JSON Settings */}
        <div className="space-y-4">
          <div>
            <label htmlFor="scoringJson" className="block text-sm font-medium text-gray-700">
              Scoring Rules (JSON)
            </label>
            <textarea
              name="scoringJson"
              id="scoringJson"
              rows={4}
              value={formData.scoringJson}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder='{"passing_yards": 0.04, "passing_touchdowns": 4}'
            />
          </div>

          <div>
            <label htmlFor="rosterJson" className="block text-sm font-medium text-gray-700">
              Roster Settings (JSON)
            </label>
            <textarea
              name="rosterJson"
              id="rosterJson"
              rows={4}
              value={formData.rosterJson}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder='{"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}'
            />
          </div>

          <div>
            <label htmlFor="keeperRulesJson" className="block text-sm font-medium text-gray-700">
              Keeper Rules (JSON)
            </label>
            <textarea
              name="keeperRulesJson"
              id="keeperRulesJson"
              rows={4}
              value={formData.keeperRulesJson}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder='{"max_keepers": 3, "keeper_cost": "round_drafted"}'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save League Settings'}
          </button>
          
          <button
            type="button"
            onClick={handleSyncESPN}
            disabled={loading || !formData.leagueId}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync ESPN Players'}
          </button>
          
          <button
            type="button"
            onClick={handleSyncProjections}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync Projections'}
          </button>
        </div>
      </div>
    </div>
  );
} 