import { useState, useCallback } from 'react';

// Fallback API URL if environment variable is not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fantasy-command-center-api.kevin-mcgovern.workers.dev';

// Debug logging
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_BASE_URL: API_BASE_URL
});

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback(async <T>(endpoint: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Making GET request to: ${fullUrl}`);
    console.log(`API_BASE_URL: ${API_BASE_URL}`);
    console.log(`endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(fullUrl);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('API error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async <T>(endpoint: string, body: any): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Making POST request to: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('API error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const patch = useCallback(async <T>(endpoint: string, body: any): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Making PATCH request to: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('API error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    get,
    post,
    patch,
    loading,
    error,
  };
} 