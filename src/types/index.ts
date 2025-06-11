export type JobLevels = {
  [key: string]: number;
};

export interface Player {
  charname: string;
  avatar: string;
  nation: string;
  rank: number;
  mjob: string;
  mlvl: number;
  sjob: string;
  slvl: number;
  jobs: JobLevels;
  seacomType: number;
  seacomMessage: string | null;
  timestamp: string;
}

export interface PlayerRow extends Player {
  id: string;
  otherJobs: string[];
  isNew: boolean;
}

export type JobType = 'main' | 'sub' | 'any';

export interface FilterOptions {
  job: string;
  jobType: JobType;
  minLevel: number;
  maxLevel: number;
  searchTerm: string;
  alertEnabled: boolean;
}

export interface ApiResponse {
  total: number;
  chars: Player[];
}

export const JOB_ABBREVIATIONS = [
  'WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK',
  'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU',
  'COR', 'PUP', 'DNC', 'SCH', 'GEO', 'RUN'
] as const;

export type JobAbbreviation = typeof JOB_ABBREVIATIONS[number];

export const JOB_COLORS: Record<JobAbbreviation, string> = {
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
