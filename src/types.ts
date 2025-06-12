// Define Job abbreviations
export const JOB_ABBREVIATIONS = [
  'WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 
  'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC', 'RUN', 
  'GEO', 'MON'
] as const;

// Define Job type from abbreviations
export type Job = typeof JOB_ABBREVIATIONS[number];

// Define JobType for roles
export type JobType = 'any' | 'tank' | 'healer' | 'dps' | 'support';

// Define the structure for player data
export interface PlayerData {
  id: string; // Unique identifier for the player
  name: string;
  job: Job;
  level: number;
  partyId?: string; // Optional: if the player is in a party
  comment?: string; // Optional: player's comment or LFP message
  timestamp: number; // Timestamp of the last update or when player was seen
  jobType?: JobType; // Role based on job, can be derived or set
  flag?: string; // Player's flag/nation
  zone?: string; // Player's current zone
}

// Define the structure for filter options
export interface FilterOptions {
  searchTerm: string;
  job: Job | ''; // Allow empty string for 'any job'
  minLevel: number;
  maxLevel: number;
  jobType: JobType;
  alertEnabled: boolean;
  // Potentially add other filters like flag, zone, etc.
}

// Define the structure for party data
export interface PartyData {
  id: string; // Unique identifier for the party
  leaderName: string; // Name of the party leader
  members: PlayerData[]; // Array of players in the party
  description?: string; // Party's LFM message or description
  averageLevel?: number; // Average level of the party (can be calculated)
  jobComposition?: Partial<Record<JobType, number>>; // e.g., { tank: 1, healer: 1, dps: 3 }
  timestamp: number; // Timestamp of party creation or last update
}

// Define colors for jobs
export const JOB_COLORS: Record<Job, string> = {
  WAR: '#FF0000', // Red
  MNK: '#FFA500', // Orange
  WHM: '#FFFFFF', // White
  BLM: '#000000', // Black
  RDM: '#FFC0CB', // Pink
  THF: '#808080', // Gray
  PLD: '#ADD8E6', // Light Blue
  DRK: '#A020F0', // Purple
  BST: '#964B00', // Brown
  BRD: '#FFFF00', // Yellow
  RNG: '#008000', // Green
  SAM: '#DC143C', // Crimson
  NIN: '#483D8B', // Dark Slate Blue
  DRG: '#0000FF', // Blue
  SMN: '#9370DB', // Medium Purple
  BLU: '#4169E1', // Royal Blue
  COR: '#FFD700', // Gold
  PUP: '#D2B48C', // Tan
  DNC: '#FF69B4', // Hot Pink
  RUN: '#708090', // Slate Gray
  GEO: '#DAA520', // Goldenrod
  MON: '#E6E6FA', // Lavender (Placeholder, as MON is not a standard FFXI job abbreviation, assuming it's a custom one or a typo for MNK)
};

// Define colors for nations (example)
export const NATION_COLORS: Record<string, string> = {
  Sandoria: '#FF0000', // Red
  Bastok: '#0000FF', // Blue
  Windurst: '#008000', // Green
  Beastmen: '#808080', // Gray
  Other: '#FFFFFF', // White
};