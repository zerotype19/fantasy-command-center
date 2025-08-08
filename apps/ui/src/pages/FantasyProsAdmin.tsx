import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    file_name: string;
    csv_rows: number;
    matched_count: number;
    unmatched_count: number;
    unmatched_sample: any[];
    matched_sample: any[];
  };
}

const FantasyProsAdmin: React.FC = () => {
  const { post } = useApi();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().includes('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await post('/upload/fantasy-pros-csv', formData);
      
      if (response && response.success) {
        setResult(response);
      } else {
        setError(response?.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FantasyPros CSV Admin
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload FantasyPros Draft Rankings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>File:</strong> {result.data?.file_name}</p>
                  <p><strong>CSV Rows:</strong> {result.data?.csv_rows}</p>
                  <p><strong>Matched Players:</strong> {result.data?.matched_count}</p>
                  <p><strong>Unmatched Players:</strong> {result.data?.unmatched_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {result?.data?.unmatched_sample && result.data.unmatched_sample.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Unmatched Players</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">Some players from the CSV couldn't be matched to our database:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.data.unmatched_sample.map((player: any, index: number) => (
                      <li key={index}>
                        {player.player_name} ({player.team}, {player.position}) - Rank {player.rank}, Tier {player.tier}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Upload FantasyPros CSV files to import draft rankings data</p>
            <p>• The system will match players by name and team</p>
            <p>• Supported fields: Draft Rank, Tier, Position Rank, SOS Rating, ECR vs ADP</p>
            <p>• Files should be in the format: "FantasyPros_2025_Draft_ALL_Rankings.csv"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyProsAdmin;
