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
  Divider
} from '@mui/material';
import { 
  NotificationsActive, 
  NotificationsOff, 
  Clear,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { type FilterOptions, type Job, JOB_COLORS } from '../types/index';

// Organized job lists by role
const TANK_JOBS: Job[] = ['NIN', 'PLD', 'WAR'];
const HEAL_JOBS: Job[] = ['WHM', 'RDM'];
const DD_JOBS: Job[] = ['MNK', 'BLM', 'THF', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC'];

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
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

const FilterBar: React.FC<FilterBarProps> = ({ filterOptions, onFilterChange }) => {
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
            placeholder="Search players or comments..."
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
                  color="text.primary" 
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
                  color="text.primary" 
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
            {/* Compact Level Presets */}
            <Stack direction="row" spacing={0.25} sx={{ mt: 0.25, flexWrap: 'wrap', gap: 0.25 }}>
              {[
                { label: 'All', range: [1, 75] },
                { label: '75', range: [75, 75] },
                { label: '1-10', range: [1, 10] },
                { label: '11-20', range: [11, 20] },
                { label: '21-30', range: [21, 30] },
                { label: '31-40', range: [31, 40] },
                { label: '41-50', range: [41, 50] },
                { label: '51-60', range: [51, 60] },
                { label: '61-70', range: [61, 70] },
                { label: '71-75', range: [71, 75] }
              ].map(({ label, range }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  clickable
                  onClick={() => {
                    setLevelRange(range);
                    const newFilters = {
                      ...localFilters,
                      minLevel: range[0],
                      maxLevel: range[1],
                    };
                    setLocalFilters(newFilters);
                    debouncedFilterChange(newFilters);
                  }}
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    backgroundColor: (levelRange[0] === range[0] && levelRange[1] === range[1]) 
                      ? theme.palette.primary.main 
                      : theme.palette.action.hover,
                    color: (levelRange[0] === range[0] && levelRange[1] === range[1]) 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
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
              <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                Main Jobs
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Tank & Heal Jobs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Tank Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Tank
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {TANK_JOBS.map((job) => (
                        <Chip
                          key={`main-${job}`}
                          label={job}
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
                            fontSize: '0.75rem',
                            height: 26,
                            minWidth: 55,
                            transition: 'all 0.2s ease',
                            border: localFilters.mainJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.mainJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.primary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.05)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Heal Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Heal
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {HEAL_JOBS.map((job) => (
                        <Chip
                          key={`main-${job}`}
                          label={job}
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
                            fontSize: '0.75rem',
                            height: 26,
                            minWidth: 55,
                            transition: 'all 0.2s ease',
                            border: localFilters.mainJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.mainJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.primary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.05)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* DD Jobs */}
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                    DD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5, maxWidth: 180 }}>
                    {DD_JOBS.map((job) => (
                      <Chip
                        key={`main-${job}`}
                        label={job}
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
                          fontSize: '0.75rem',
                          height: 26,
                          minWidth: 55,
                          transition: 'all 0.2s ease',
                          border: localFilters.mainJobs.includes(job) 
                            ? `1px solid ${JOB_COLORS[job] || theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            backgroundColor: localFilters.mainJobs.includes(job)
                              ? JOB_COLORS[job] || theme.palette.primary.main
                              : theme.palette.action.selected,
                            transform: 'scale(1.05)',
                            boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Sub Jobs */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                Sub Jobs
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Tank & Heal Jobs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Tank Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Tank
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {TANK_JOBS.map((job) => (
                        <Chip
                          key={`sub-${job}`}
                          label={job}
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
                            fontSize: '0.75rem',
                            height: 26,
                            minWidth: 55,
                            transition: 'all 0.2s ease',
                            border: localFilters.subJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.subJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.secondary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.05)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Heal Jobs */}
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                      Heal
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {HEAL_JOBS.map((job) => (
                        <Chip
                          key={`sub-${job}`}
                          label={job}
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
                            fontSize: '0.75rem',
                            height: 26,
                            minWidth: 55,
                            transition: 'all 0.2s ease',
                            border: localFilters.subJobs.includes(job) 
                              ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: localFilters.subJobs.includes(job)
                                ? JOB_COLORS[job] || theme.palette.secondary.main
                                : theme.palette.action.selected,
                              transform: 'scale(1.05)',
                              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* DD Jobs */}
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                    DD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5, maxWidth: 180 }}>
                    {DD_JOBS.map((job) => (
                      <Chip
                        key={`sub-${job}`}
                        label={job}
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
                          fontSize: '0.75rem',
                          height: 26,
                          minWidth: 55,
                          transition: 'all 0.2s ease',
                          border: localFilters.subJobs.includes(job) 
                            ? `1px solid ${JOB_COLORS[job] || theme.palette.secondary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            backgroundColor: localFilters.subJobs.includes(job)
                              ? JOB_COLORS[job] || theme.palette.secondary.main
                              : theme.palette.action.selected,
                            transform: 'scale(1.05)',
                            boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                          },
                        }}
                      />
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
          title={isCollapsed ? 'Show filters' : 'Hide filters'}
        >
          {isCollapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default FilterBar;