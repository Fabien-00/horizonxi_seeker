export type JobLevels = {
  [key: string]: number;
};

export interface PlayerData { // Renamed from Player to PlayerData to match usage in App.tsx as raw API data
  charid?: number; // Added charid as it's used in App.tsx
  charname: string;
  avatar?: string; // Made optional as it's handled in App.tsx
  nation?: string; // Assuming these might be optional from API
  rank?: number;
  mjob: string; // Keep as Job, will be cast in App.tsx
  mlvl: number;
  sjob: string; // Keep as Job, will be cast in App.tsx
  slvl: number;
  jobs?: JobLevels; // Assuming optional
  seacomType?: number;
  seacomMessage?: string | null;
  timestamp?: string;
  // party?: any; // Removed as per previous cleanup, if it exists in API, define structure
}

export interface PlayerRow {
  charid: number; // Ensured charid is present
  avatar: string;
  charname: string;
  mjob: Job;
  mlvl: number;
  sjob: Job;
  slvl: number;
  // comment: string | null; // seacomMessage will be used directly
  seacomType?: number;
  seacomMessage?: string | null;
  jobs?: JobLevels;
  isNew?: boolean; // Added for new player highlighting
}

export type JobType = 'main' | 'sub' | 'any';

export interface FilterOptions {
  searchTerm: string;
  mainJobs: Job[]; // Changed to array for multiple selections, renamed for clarity
  subJobs: Job[];  // Changed to array for multiple selections, renamed for clarity
  minLevel: number | ''; // Allow empty string for 'Any'
  maxLevel: number | ''; // Allow empty string for 'Any'
  selectedJobs: Job[]; // Changed to array for multiple selections, renamed for clarity
  jobType: 'main' | 'sub' | 'any';
  alertEnabled: boolean;
  // hideFullParties: boolean; // Removed as per user request
}

export interface ApiResponse {
  total: number;
  chars: PlayerData[];
}

export type Job = 
  | 'WAR' | 'MNK' | 'WHM' | 'BLM' | 'RDM' | 'THF' | 'PLD' | 'DRK' | 'BST' | 'BRD' | 'RNG' 
  | 'SAM' | 'NIN' | 'DRG' | 'SMN' | 'BLU' | 'COR' | 'PUP' | 'DNC';

export const JOB_ABBREVIATIONS: Job[] = ['WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC'];

export const HORIZON_JOB_ABBREVIATIONS: Job[] = ['WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC'];

export type JobAbbreviation = typeof HORIZON_JOB_ABBREVIATIONS[number];

export const JOB_COLORS: Record<JobAbbreviation | string, string> = { 
  'WAR': '#b08968', 'MNK': '#d8a82a', 'WHM': '#e0c28c', 'BLM': '#8f2ab0',
  'RDM': '#da7aac', 'THF': '#d9c653', 'PLD': '#adcdea', 'DRK': '#ad1b34',
  'BST': '#95b998', 'BRD': '#e66fd0', 'RNG': '#97bd66', 'SAM': '#cca300',
  'NIN': '#874f9f', 'DRG': '#6c89d6', 'SMN': '#28b463', 'BLU': '#2e86c1',
  'COR': '#cc6d1e', 'PUP': '#7a7a7a', 'DNC': '#ce4335', 'SCH': '#17a589'
} as const;

export const NATION_COLORS = {
  'San d\'Oria': '#ff6b6b',
  'Bastok': '#6b8cff',
  'Windurst': '#6bff8c'
} as const;
