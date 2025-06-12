import axios from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = 'https://api.horizonxi.com/api/v1/chars/lfp';

// Add a simple rate limiter
const RATE_LIMIT = 600000; // 1 request per minute
let lastRequestTime = 0;

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const fetchPlayers = async (): Promise<ApiResponse> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // If less than RATE_LIMIT ms have passed, wait the remaining time
  if (timeSinceLastRequest < RATE_LIMIT) {
    await delay(RATE_LIMIT - timeSinceLastRequest);
  }

  try {
    const response = await axios.get<ApiResponse>(API_BASE_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      timeout: 10000, // 10 second timeout
    });
    
    lastRequestTime = Date.now();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API error:', error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    // Return empty data instead of throwing to prevent app crash
    return { meta:{total: 0}, data: [] };
  }
};
