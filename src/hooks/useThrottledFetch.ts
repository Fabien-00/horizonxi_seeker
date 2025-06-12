import { useState, useEffect, useCallback } from 'react';

export const useThrottledFetch = <T,>(
  url: string,
  minInterval = 600000, // 1 minute by default
  maxJitter = 200000 // 20 seconds jitter
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response received');
      }
      
      const result = JSON.parse(text);
      setData(result);
      setError(null);
      setLastFetchTime(Date.now());
      return result;
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err as Error);
      return null;
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextFetch = () => {
      const jitter = Math.random() * maxJitter;
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const timeToNextFetch = Math.max(0, minInterval + jitter - timeSinceLastFetch);
      
      timeoutId = setTimeout(() => {
        fetchData(true).finally(() => {
          scheduleNextFetch();
        });
      }, timeToNextFetch);
    };

    // Initial fetch
    fetchData().finally(() => {
      if (!error) {
        scheduleNextFetch();
      }
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchData, lastFetchTime, minInterval, maxJitter, error]);

  return { data, loading, error, lastFetchTime };
};
