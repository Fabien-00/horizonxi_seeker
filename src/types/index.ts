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
  comment: string | null;
  seacomType?: number;
  seacomMessage?: string | null;
  isNew?: boolean; // Added for new player highlighting
  // otherJobs: string[]; // This was in previous PlayerRow, review if needed
}

export type JobType = 'main' | 'sub' | 'any';

export interface FilterOptions {
  searchTerm: string;
  mainJob: Job | null; // Added mainJob
  subJob: Job | null;  // Added subJob, made it non-optional based on usage
  minLevel: number | ''; // Allow empty string for 'Any'
  maxLevel: number | ''; // Allow empty string for 'Any'
  job: Job | ''; // Allow empty string for 'any job'
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
  | 'SAM' | 'NIN' | 'DRG' | 'SMN' | 'BLU' | 'COR' | 'PUP' | 'DNC' | 'GEO' | 'RUN' | 'MON';

export const JOB_ABBREVIATIONS: Job[] = ['WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC', 'GEO', 'RUN', 'MON'];

export const HORIZON_JOB_ABBREVIATIONS: Job[] = ['WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC', 'GEO', 'RUN', 'MON'];

export type JobAbbreviation = typeof HORIZON_JOB_ABBREVIATIONS[number];

export const JOB_COLORS: Record<JobAbbreviation | string, string> = { 
  'WAR': '#c79c6e', 'MNK': '#f4c030', 'WHM': '#f9da9d', 'BLM': '#a330c9',
  'RDM': '#f58cba', 'THF': '#f5e05e', 'PLD': '#c5e0fa', 'DRK': '#c41f3b',
  'BST': '#a9d0ac', 'BRD': '#ff7de3', 'RNG': '#abd473', 'SAM': '#e6b800',
  'NIN': '#9b59b6', 'DRG': '#7b9cf0', 'SMN': '#2ecc71', 'BLU': '#3498db',
  'COR': '#e67e22', 'PUP': '#8e8e8e', 'DNC': '#e74c3c', 'SCH': '#1abc9c',
  'GEO': '#9b59b6', 'RUN': '#3498db'
} as const;

export const NATION_COLORS = {
  'San d\'Oria': '#ff6b6b',
  'Bastok': '#6b8cff',
  'Windurst': '#6bff8c'
} as const;
