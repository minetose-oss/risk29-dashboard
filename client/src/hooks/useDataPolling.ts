/**
 * Custom React Hook for Real-time Data Polling
 * Automatically fetches real_data.json at regular intervals and detects changes
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface PollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 5 minutes)
  enabled?: boolean; // Enable/disable polling (default: true)
  onUpdate?: (data: any) => void; // Callback when new data is detected
}

interface PollingState {
  data: any | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: string | null;
  isNewData: boolean;
}

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useDataPolling(url: string, options: PollingOptions = {}) {
  const {
    interval = DEFAULT_INTERVAL,
    enabled = true,
    onUpdate,
  } = options;

  const [state, setState] = useState<PollingState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isNewData: false,
  });

  const lastTimestampRef = useRef<string | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Add cache-busting parameter to avoid browser cache
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`${url}${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newData = await response.json();
      const newTimestamp = newData.timestamp || newData.last_updated;
      
      // Check if data has changed by comparing timestamps
      const hasChanged = lastTimestampRef.current !== newTimestamp;
      
      if (hasChanged) {
        console.log('[useDataPolling] New data detected:', newTimestamp);
        lastTimestampRef.current = newTimestamp;
        
        setState({
          data: newData,
          loading: false,
          error: null,
          lastUpdated: newTimestamp,
          isNewData: true,
        });
        
        // Call onUpdate callback if provided
        if (onUpdate) {
          onUpdate(newData);
        }
        
        // Reset isNewData flag after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, isNewData: false }));
        }, 5000);
      } else {
        // Data hasn't changed, just update loading state
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('[useDataPolling] Error fetching data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [url, onUpdate]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) {
      // Clear interval if polling is disabled
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Set up interval
    intervalIdRef.current = setInterval(() => {
      fetchData();
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [enabled, interval, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
  };
}
