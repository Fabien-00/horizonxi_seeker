import axios from 'axios';
import type { ApiResponse } from '../types/index';

const API_BASE_URL = 'https://api.horizonxi.com/api/v1/chars/lfp';

// Add a simple rate limiter and request deduplication
const RATE_LIMIT = 600000; // 10 minutes (very conservative)
let lastRequestTime = 0;
let pendingRequest: Promise<ApiResponse> | null = null;

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const fetchPlayers = async (): Promise<ApiResponse> => {
  // If there's already a pending request, return it instead of making a new one
  if (pendingRequest) {
    console.log('🔄 Reusing pending API request to prevent spam');
    return pendingRequest;
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // If less than RATE_LIMIT ms have passed, wait the remaining time
  if (timeSinceLastRequest < RATE_LIMIT) {
    console.log(`⏳ Rate limiting: waiting ${Math.ceil((RATE_LIMIT - timeSinceLastRequest) / 1000)}s before next API call`);
    await delay(RATE_LIMIT - timeSinceLastRequest);
  }

  // Create the request promise
  pendingRequest = (async () => {
    try {
      console.log('🌐 Making API request to HorizonXI...');
      const response = await axios.get<ApiResponse>(API_BASE_URL, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        timeout: 10000, // 10 second timeout
      });
      
      lastRequestTime = Date.now();
      console.log(`✅ API request successful: ${response.data.chars?.length || 0} players received`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API error:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        }
      } else {
        console.error('Unexpected error:', error);
      }
      // Return empty data instead of throwing to prevent app crash
      return { total: 0, chars: [] };
    } finally {
      // Clear the pending request after completion
      pendingRequest = null;
    }
  })();

  return pendingRequest;
};
