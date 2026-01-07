import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  TextField, 
  Typography, 
  IconButton, 
  Badge, 
  Slider, 
  Box, 
  Chip,
  Stack,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import { 
  NotificationsActive, 
  NotificationsOff, 
  Clear,
  ExpandLess,
  ExpandMore,
  Security,
  LocalHospital,
  Whatshot,
  Groups,
  Person,
  Group
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { type FilterOptions, type Job, JOB_COLORS } from '../types/index';

// Organized job lists by role
const TANK_JOBS: Job[] = ['NIN', 'PLD', 'WAR'];
const HEAL_JOBS: Job[] = ['WHM', 'RDM'];
const DD_JOBS: Job[] = ['MNK', 'BLM', 'THF', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC'];

// Job icons mapping
const JOB_ICONS: Record<Job, string> = {
  'WAR': '⚔️', 'MNK': '👊', 'WHM': '✨', 'BLM': '🔮', 'RDM': '🎭', 'THF': '🗡️',
  'PLD': '🛡️', 'DRK': '🌑', 'BST': '🐺', 'BRD': '🎵', 'RNG': '🏹', 'SAM': '🗾',
  'NIN': '🥷', 'DRG': '🐉', 'SMN': '👹', 'BLU': '💙', 'COR': '🎲', 'PUP': '🤖', 'DNC': '💃'
};

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  playerCounts?: { [key: string]: number }; // Add player counts prop
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

const FilterBar: React.FC<FilterBarProps> = ({ filterOptions, onFilterChange, playerCounts = {} }) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [levelRange, setLevelRange] = useState<number[]>([
    typeof filterOptions.minLevel === 'number' ? filterOptions.minLevel : 1,
    typeof filterOptions.maxLevel === 'number' ? filterOptions.maxLevel : 75
  ]);
  const [editingLevel, setEditingLevel] = useState<'min' | 'max' | null>(null);
  const [tempLevelValue, setTempLevelValue] = useState<string>('');

  const debouncedFilterChange = useMemo(
    () => debounce((filters: FilterOptions) => onFilterChange(filters), 300),
    [onFilterChange]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (event.target instanceof HTMLInputElement) return;
      
      switch (event.key) {
        case ' ':
          event.preventDefault();
          setIsCollapsed(!isCollapsed);
          break;
        case '1':
          handleLevelPreset([1, 10]);
          break;
        case '2':
          handleLevelPreset([11, 20]);
          break;
        case '3':
          handleLevelPreset([21, 30]);
          break;
        case '4':
          handleLevelPreset([31, 40]);
          break;
        case '5':
          handleLevelPreset([41, 50]);
          break;
        case '6':
          handleLevelPreset([51, 60]);
          break;
        case '7':
          handleLevelPreset([61, 70]);
          break;
        case '8':
          handleLevelPreset([71, 75]);
          break;
        case '9':
          handleLevelPreset([75, 75]);
          break;
        case '0':
          handleLevelPreset([1, 75]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  useEffect(() => {
    setLocalFilters(filterOptions);
    setLevelRange([
      typeof filterOptions.minLevel === 'number' ? filterOptions.minLevel : 1,
      typeof filterOptions.maxLevel === 'number' ? filterOptions.maxLevel : 75
    ]);
  }, [filterOptions]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...localFilters,
      searchTerm: event.target.value,
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleLevelRangeChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    setLevelRange(range);
    const newFilters = {
      ...localFilters,
      minLevel: range[0],
      maxLevel: range[1],
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleLevelPreset = (range: number[]) => {
    setLevelRange(range);
    const newFilters = {
      ...localFilters,
      minLevel: range[0],
      maxLevel: range[1],
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleLevelEdit = (type: 'min' | 'max') => {
    setEditingLevel(type);
    setTempLevelValue(String(type === 'min' ? levelRange[0] : levelRange[1]));
  };

  const handleLevelEditSubmit = () => {
    if (editingLevel && tempLevelValue) {
      const newValue = Math.max(1, Math.min(75, parseInt(tempLevelValue) || 1));
      const newRange = editingLevel === 'min' 
        ? [newValue, Math.max(newValue, levelRange[1])]
        : [Math.min(levelRange[0], newValue), newValue];
      
      setLevelRange(newRange);
      const newFilters = {
        ...localFilters,
        minLevel: newRange[0],
        maxLevel: newRange[1],
      };
      setLocalFilters(newFilters);
      debouncedFilterChange(newFilters);
    }
    setEditingLevel(null);
    setTempLevelValue('');
  };

  const handleLevelEditCancel = () => {
    setEditingLevel(null);
    setTempLevelValue('');
  };

  const handleJobToggle = (jobType: 'main' | 'sub', job: Job) => {
    const currentJobs = jobType === 'main' ? localFilters.mainJobs : localFilters.subJobs;
    const newJobs = currentJobs.includes(job) 
      ? currentJobs.filter(j => j !== job)
      : [...currentJobs, job];
    
    const newFilters = {
      ...localFilters,
      [jobType === 'main' ? 'mainJobs' : 'subJobs']: newJobs,
      selectedJobs: [], // Clear generic selectedJobs
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  // Quick select functions
  const handleSelectAllByRole = (jobType: 'main' | 'sub', role: 'tank' | 'heal' | 'dd') => {
    const roleJobs = role === 'tank' ? TANK_JOBS : role === 'heal' ? HEAL_JOBS : DD_JOBS;
    const currentJobs = jobType === 'main' ? localFilters.mainJobs : localFilters.subJobs;
    const allSelected = roleJobs.every(job => currentJobs.includes(job));
    
    const newJobs = allSelected 
      ? currentJobs.filter(job => !roleJobs.includes(job))
      : [...new Set([...currentJobs, ...roleJobs])];
    
    const newFilters = {
      ...localFilters,
      [jobType === 'main' ? 'mainJobs' : 'subJobs']: newJobs,
      selectedJobs: [],
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  // Job combination presets
  const handleJobPreset = (preset: string) => {
    let mainJobs: Job[] = [];
    let subJobs: Job[] = [];
    
    switch (preset) {
      case 'tank-heal':
        mainJobs = [...TANK_JOBS, ...HEAL_JOBS];
        break;
      case 'full-party':
        mainJobs = [...TANK_JOBS, ...HEAL_JOBS, ...DD_JOBS.slice(0, 4)];
        break;
      case 'exp-party':
        mainJobs = [...TANK_JOBS.slice(0, 1), ...HEAL_JOBS.slice(0, 1), ...DD_JOBS.slice(0, 4)];
        break;
      case 'endgame':
        mainJobs = ['PLD', 'WHM', 'BLM', 'RDM', 'THF', 'WAR'];
        break;
    }
    
    const newFilters = {
      ...localFilters,
      mainJobs,
      subJobs,
      selectedJobs: [],
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      searchTerm: '',
      mainJobs: [],
      subJobs: [],
      minLevel: 1 as number | '',
      maxLevel: 75 as number | '',
      selectedJobs: [],
      jobType: 'any' as const,
      alertEnabled: false,
    };
    setLocalFilters(resetFilters);
    setLevelRange([1, 75]);
    debouncedFilterChange(resetFilters);
  };

  const hasActiveFilters = localFilters.searchTerm !== '' || 
    localFilters.mainJobs.length > 0 || 
    localFilters.subJobs.length > 0 || 
    levelRange[0] !== 1 || 
    levelRange[1] !== 75;

  // Color coding for level ranges
  const getLevelColor = (level: number) => {
    if (level === 75) return '#4CAF50'; // Green
    if (level >= 60) return '#FF9800'; // Orange
    if (level >= 40) return '#FFC107'; // Yellow
    if (level >= 20) return '#2196F3'; // Blue
    return '#9E9E9E'; // Grey
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.secondary.main}`,
        mb: 1,
        mt: -1,
        overflow: 'hidden',
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)`,
        maxWidth: '80%',
        mx: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          opacity: 0.6,
        },
        // Subtle particle effect
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%), 
                      radial-gradient(circle at 80% 80%, rgba(46, 74, 120, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 40% 60%, rgba(212, 175, 55, 0.02) 0%, transparent 30%)`,
          pointerEvents: 'none',
          animation: 'subtle-float 8s ease-in-out infinite',
        },
        '@keyframes subtle-float': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        },
      }}
    >
      {/* Collapsible Filter Content */}
      <Box
        sx={{
          opacity: isCollapsed ? 0 : 1,
          maxHeight: isCollapsed ? 0 : '1000px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Main Filter Bar */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3, 
          flexWrap: 'wrap' 
        }}>
          {/* Search */}
          <TextField
            placeholder="Search players or comments... (Press Space to toggle filters)"
            variant="outlined"
            size="small"
            value={localFilters.searchTerm}
            onChange={handleSearchChange}
            sx={{ 
              minWidth: 250,
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: localFilters.searchTerm ? `${theme.palette.primary.main}10` : 'transparent',
              }
            }}
          />

          {/* Level Range Slider */}
          <Box sx={{ minWidth: 200, px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Level:
              </Typography>
              {editingLevel === 'min' ? (
                <TextField
                  size="small"
                  value={tempLevelValue}
                  onChange={(e) => setTempLevelValue(e.target.value)}
                  onBlur={handleLevelEditSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLevelEditSubmit();
                    if (e.key === 'Escape') handleLevelEditCancel();
                  }}
                  autoFocus
                  sx={{ 
                    width: 50,
                    '& .MuiOutlinedInput-root': {
                      height: 20,
                      fontSize: '0.7rem',
                      '& input': {
                        padding: '1px 4px',
                        textAlign: 'center',
                      }
                    }
                  }}
                  inputProps={{ min: 1, max: 75, type: 'number' }}
                />
              ) : (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 1,
                    border: `1px dashed ${theme.palette.divider}`,
                    minWidth: 20,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                    fontSize: '0.7rem',
                    color: getLevelColor(levelRange[0]),
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  onClick={() => handleLevelEdit('min')}
                  title="Click to edit"
                >
                  {levelRange[0]}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>-</Typography>
              {editingLevel === 'max' ? (
                <TextField
                  size="small"
                  value={tempLevelValue}
                  onChange={(e) => setTempLevelValue(e.target.value)}
                  onBlur={handleLevelEditSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLevelEditSubmit();
                    if (e.key === 'Escape') handleLevelEditCancel();
                  }}
                  autoFocus
                  sx={{ 
                    width: 50,
                    '& .MuiOutlinedInput-root': {
                      height: 20,
                      fontSize: '0.7rem',
                      '& input': {
                        padding: '1px 4px',
                        textAlign: 'center',
                      }
                    }
                  }}
                  inputProps={{ min: 1, max: 75, type: 'number' }}
                />
              ) : (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 1,
                    border: `1px dashed ${theme.palette.divider}`,
                    minWidth: 20,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                    fontSize: '0.7rem',
                    color: getLevelColor(levelRange[1]),
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  onClick={() => handleLevelEdit('max')}
                  title="Click to edit"
                >
                  {levelRange[1]}
                </Typography>
              )}
            </Box>
            <Slider
              value={levelRange}
              onChange={handleLevelRangeChange}
              valueLabelDisplay="auto"
              min={1}
              max={75}
              size="small"
              sx={{
                color: theme.palette.primary.main,
                height: 3,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
                '& .MuiSlider-valueLabel': {
                  fontSize: '0.65rem',
                  fontWeight: 600,
                },
              }}
            />
            {/* Compact Level Presets with keyboard shortcuts */}
            <Stack direction="row" spacing={0.25} sx={{ mt: 0.25, flexWrap: 'wrap', gap: 0.25 }}>
              {[
                { label: 'All (0)', range: [1, 75] },
                { label: '75 (9)', range: [75, 75] },
                { label: '1-10 (1)', range: [1, 10] },
                { label: '11-20 (2)', range: [11, 20] },
                { label: '21-30 (3)', range: [21, 30] },
                { label: '31-40 (4)', range: [31, 40] },
                { label: '41-50 (5)', range: [41, 50] },
                { label: '51-60 (6)', range: [51, 60] },
                { label: '61-70 (7)', range: [61, 70] },
                { label: '71-75 (8)', range: [71, 75] }
              ].map(({ label, range }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  clickable
                  onClick={() => handleLevelPreset(range)}
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    backgroundColor: (levelRange[0] === range[0] && levelRange[1] === range[1]) 
                      ? getLevelColor(range[1])
                      : theme.palette.action.hover,
                    color: (levelRange[0] === range[0] && levelRange[1] === range[1]) 
                      ? '#fff'
                      : theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: getLevelColor(range[1]),
                      color: '#fff',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Quick Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Notifications */}
            <IconButton
              onClick={() => {
                const newFilters = {
                  ...localFilters,
                  alertEnabled: !localFilters.alertEnabled,
                };
                setLocalFilters(newFilters);
                debouncedFilterChange(newFilters);
              }}
              size="small"
              sx={{
                color: localFilters.alertEnabled ? theme.palette.warning.main : theme.palette.text.secondary,
              }}
              title={localFilters.alertEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {localFilters.alertEnabled ? (
                <Badge color="warning" variant="dot">
                  <NotificationsActive />
                </Badge>
              ) : (
                <NotificationsOff />
              )}
            </IconButton>

            {/* Reset */}
            {hasActiveFilters && (
              <IconButton
                onClick={resetFilters}
                size="small"
                sx={{ color: theme.palette.error.main }}
                title="Clear all filters"
              >
                <Clear />
              </IconButton>
            )}
          </Stack>
        </Box>
        {/* Job Filters - Compact Side-by-Side Layout */}
        <Divider />
        <Box sx={{ p: 2, pt: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 6 }}>
            {/* Main Jobs */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                  Main Jobs
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Select all Tank jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('main', 'tank')}
                      sx={{ 
                        color: TANK_JOBS.every(job => localFilters.mainJobs.includes(job)) 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Security fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Select all Heal jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('main', 'heal')}
                      sx={{ 
                        color: HEAL_JOBS.every(job => localFilters.mainJobs.includes(job)) 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <LocalHospital fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Select all DD jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('main', 'dd')}
                      sx={{ 
                        color: DD_JOBS.some(job => localFilters.mainJobs.includes(job)) 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Whatshot fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Tank & Heal Jobs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Tank Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Tank
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {TANK_JOBS.map((job) => (
                        <Tooltip key={`main-${job}`} title={`${job} (${playerCounts[job] || 0} players)`}>
                          <Chip
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '0.8rem' }}>{JOB_ICONS[job]}</span>
                                <span>{job}</span>
                                {playerCounts[job] > 0 && (
                                  <Badge 
                                    badgeContent={playerCounts[job]} 
                                    color="secondary" 
                                    sx={{ 
                                      '& .MuiBadge-badge': { 
                                        fontSize: '0.6rem', 
                                        minWidth: 14, 
                                        height: 14 
                                      } 
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                            size="small"
                            clickable
                            onClick={() => handleJobToggle('main', job)}
                            sx={{
                              backgroundColor: localFilters.mainJobs.includes(job) 
                                ? JOB_COLORS[job] || theme.palette.primary.main
                                : theme.palette.action.hover,
                              color: localFilters.mainJobs.includes(job) 
                                ? '#fff'
                                : theme.palette.text.secondary,
                              fontWeight: localFilters.mainJobs.includes(job) ? 600 : 400,
                              fontSize: '0.7rem',
                              height: 22,
                              minWidth: 50,
                              transition: 'all 0.2s ease',
                              border: localFilters.mainJobs.includes(job) 
                                ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                                : `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                backgroundColor: localFilters.mainJobs.includes(job)
                                  ? JOB_COLORS[job] || theme.palette.primary.main
                                  : theme.palette.action.selected,
                                transform: 'scale(1.02)',
                                boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>

                  {/* Heal Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Heal
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {HEAL_JOBS.map((job) => (
                        <Tooltip key={`main-${job}`} title={`${job} (${playerCounts[job] || 0} players)`}>
                          <Chip
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '0.8rem' }}>{JOB_ICONS[job]}</span>
                                <span>{job}</span>
                                {playerCounts[job] > 0 && (
                                  <Badge 
                                    badgeContent={playerCounts[job]} 
                                    color="secondary" 
                                    sx={{ 
                                      '& .MuiBadge-badge': { 
                                        fontSize: '0.6rem', 
                                        minWidth: 14, 
                                        height: 14 
                                      } 
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                            size="small"
                            clickable
                            onClick={() => handleJobToggle('main', job)}
                            sx={{
                              backgroundColor: localFilters.mainJobs.includes(job) 
                                ? JOB_COLORS[job] || theme.palette.primary.main
                                : theme.palette.action.hover,
                              color: localFilters.mainJobs.includes(job) 
                                ? '#fff'
                                : theme.palette.text.secondary,
                              fontWeight: localFilters.mainJobs.includes(job) ? 600 : 400,
                              fontSize: '0.7rem',
                              height: 22,
                              minWidth: 50,
                              transition: 'all 0.2s ease',
                              border: localFilters.mainJobs.includes(job) 
                                ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                                : `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                backgroundColor: localFilters.mainJobs.includes(job)
                                  ? JOB_COLORS[job] || theme.palette.primary.main
                                  : theme.palette.action.selected,
                                transform: 'scale(1.02)',
                                boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* DD Jobs */}
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                    DD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.25, maxWidth: 160 }}>
                    {DD_JOBS.map((job) => (
                      <Tooltip key={`main-${job}`} title={`${job} (${playerCounts[job] || 0} players)`}>
                        <Chip
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <span style={{ fontSize: '0.7rem' }}>{JOB_ICONS[job]}</span>
                              <span>{job}</span>
                            </Box>
                          }
                          size="small"
                          clickable
                          onClick={() => handleJobToggle('main', job)}
                          sx={{
                            backgroundColor: localFilters.mainJobs.includes(job) 
                              ? JOB_COLORS[job] || theme.palette.primary.main
                              : theme.palette.action.hover,
                            color: localFilters.mainJobs.includes(job) 
                              ? '#fff'
                              : theme.palette.text.secondary,
                            fontWeight: localFilters.mainJobs.includes(job) ? 600 : 400,
                            fontSize: '0.65rem',
                            height: 22,
                            minWidth: 48,
                            transition: 'all 0.2s ease',
                            border: localFilters.mainJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.mainJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.primary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.02)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Sub Jobs */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                  Sub Jobs
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Select all Tank jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('sub', 'tank')}
                      sx={{ 
                        color: TANK_JOBS.every(job => localFilters.subJobs.includes(job)) 
                          ? theme.palette.secondary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Security fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Select all Heal jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('sub', 'heal')}
                      sx={{ 
                        color: HEAL_JOBS.every(job => localFilters.subJobs.includes(job)) 
                          ? theme.palette.secondary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <LocalHospital fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Select all DD jobs">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectAllByRole('sub', 'dd')}
                      sx={{ 
                        color: DD_JOBS.some(job => localFilters.subJobs.includes(job)) 
                          ? theme.palette.secondary.main 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Whatshot fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Tank & Heal Jobs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Tank Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Tank
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {TANK_JOBS.map((job) => (
                        <Tooltip key={`sub-${job}`} title={`${job} (${playerCounts[`sub-${job}`] || 0} players)`}>
                          <Chip
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '0.8rem' }}>{JOB_ICONS[job]}</span>
                                <span>{job}</span>
                              </Box>
                            }
                            size="small"
                            clickable
                            onClick={() => handleJobToggle('sub', job)}
                            sx={{
                              backgroundColor: localFilters.subJobs.includes(job) 
                                ? JOB_COLORS[job] || theme.palette.secondary.main
                                : theme.palette.action.hover,
                              color: localFilters.subJobs.includes(job) 
                                ? '#fff'
                                : theme.palette.text.secondary,
                              fontWeight: localFilters.subJobs.includes(job) ? 600 : 400,
                              fontSize: '0.7rem',
                              height: 22,
                              minWidth: 50,
                              transition: 'all 0.2s ease',
                              border: localFilters.subJobs.includes(job) 
                                ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                                : `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                backgroundColor: localFilters.subJobs.includes(job)
                                  ? JOB_COLORS[job] || theme.palette.secondary.main
                                  : theme.palette.action.selected,
                                transform: 'scale(1.02)',
                                boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>

                  {/* Heal Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Heal
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {HEAL_JOBS.map((job) => (
                        <Tooltip key={`sub-${job}`} title={`${job} (${playerCounts[`sub-${job}`] || 0} players)`}>
                          <Chip
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontSize: '0.8rem' }}>{JOB_ICONS[job]}</span>
                                <span>{job}</span>
                              </Box>
                            }
                            size="small"
                            clickable
                            onClick={() => handleJobToggle('sub', job)}
                            sx={{
                              backgroundColor: localFilters.subJobs.includes(job) 
                                ? JOB_COLORS[job] || theme.palette.secondary.main
                                : theme.palette.action.hover,
                              color: localFilters.subJobs.includes(job) 
                                ? '#fff'
                                : theme.palette.text.secondary,
                              fontWeight: localFilters.subJobs.includes(job) ? 600 : 400,
                              fontSize: '0.7rem',
                              height: 22,
                              minWidth: 50,
                              transition: 'all 0.2s ease',
                              border: localFilters.subJobs.includes(job) 
                                ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                                : `1px solid ${theme.palette.divider}`,
                              '&:hover': {
                                backgroundColor: localFilters.subJobs.includes(job)
                                  ? JOB_COLORS[job] || theme.palette.secondary.main
                                  : theme.palette.action.selected,
                                transform: 'scale(1.02)',
                                boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* DD Jobs */}
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                    DD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.25, maxWidth: 160 }}>
                    {DD_JOBS.map((job) => (
                      <Tooltip key={`sub-${job}`} title={`${job} (${playerCounts[`sub-${job}`] || 0} players)`}>
                        <Chip
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <span style={{ fontSize: '0.7rem' }}>{JOB_ICONS[job]}</span>
                              <span>{job}</span>
                            </Box>
                          }
                          size="small"
                          clickable
                          onClick={() => handleJobToggle('sub', job)}
                          sx={{
                            backgroundColor: localFilters.subJobs.includes(job) 
                              ? JOB_COLORS[job] || theme.palette.secondary.main
                              : theme.palette.action.hover,
                            color: localFilters.subJobs.includes(job) 
                              ? '#fff'
                              : theme.palette.text.secondary,
                            fontWeight: localFilters.subJobs.includes(job) ? 600 : 400,
                            fontSize: '0.65rem',
                            height: 22,
                            minWidth: 48,
                            transition: 'all 0.2s ease',
                            border: localFilters.subJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.subJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.secondary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.02)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Toggle Button - Improved Design */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        borderTop: isCollapsed ? 'none' : `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        py: 0.5,
      }}>
        <IconButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            borderRadius: 2,
            padding: '4px 12px',
            fontSize: '0.75rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          }}
          title={isCollapsed ? 'Show filters (Space)' : 'Hide filters (Space)'}
        >
          {isCollapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default FilterBar;