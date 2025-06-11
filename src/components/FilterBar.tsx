import type { FC, ChangeEvent } from 'react';
import { useMemo } from 'react';
import { 
  Box, 
  TextField, 
  MenuItem,
  FormControl, 
  InputLabel, 
  Select, 
  type SelectChangeEvent, 
  Switch, 
  FormControlLabel, 
  Slider,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  styled,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { JOB_ABBREVIATIONS } from '../types';

type JobOption = {
  value: string;
  label: string;
};

export const JOB_OPTIONS: JobOption[] = [
  { value: '', label: 'All Jobs' },
  ...JOB_ABBREVIATIONS.map((job) => ({
    value: job,
    label: job
  }))
];

type JobType = 'any' | 'main' | 'sub';

type FilterBarProps = {
  filterOptions: {
    job: string;
    jobType: JobType;
    minLevel: number;
    maxLevel: number;
    searchTerm: string;
    alertEnabled: boolean;
  };
  onFilterChange: (filters: {
    job: string;
    jobType: JobType;
    minLevel: number;
    maxLevel: number;
    searchTerm: string;
    alertEnabled: boolean;
  }) => void;
};

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 6,
  padding: '15px 0',
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: theme.palette.grey[400],
  },
  '& .MuiSlider-track': {
    border: 'none',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  '& .MuiSlider-thumb': {
    width: 18,
    height: 18,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover, &.Mui-focusVisible, &.Mui-active': {
      boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0.16)}`,
    },
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: '0.75rem',
    '&:before': {
      display: 'none',
    },
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    padding: '6px 12px',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    textTransform: 'none',
    '&:not(:first-of-type)': {
      marginLeft: -1,
      borderLeft: '1px solid transparent',
    },
    '&:first-of-type': {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    '&:last-of-type': {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderColor: theme.palette.primary.light,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const FilterBar: FC<FilterBarProps> = ({ 
  filterOptions, 
  onFilterChange 
}) => {
  const theme = useTheme();
  const { job, jobType, minLevel, maxLevel, searchTerm, alertEnabled } = filterOptions;

  const handleJobChange = (event: SelectChangeEvent) => {
    onFilterChange({
      ...filterOptions,
      job: event.target.value,
    });
  };

  const handleJobTypeChange = (_: React.MouseEvent<HTMLElement>, newType: JobType) => {
    if (newType !== null) {
      onFilterChange({
        ...filterOptions,
        jobType: newType,
      });
    }
  };

  const handleLevelChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onFilterChange({
        ...filterOptions,
        minLevel: newValue[0],
        maxLevel: newValue[1],
      });
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filterOptions,
      searchTerm: event.target.value,
    });
  };

  const handleAlertToggle = (event: ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filterOptions,
      alertEnabled: event.target.checked,
    });
  };

  // Memoize the level text to prevent unnecessary re-renders
  const levelText = useMemo(() => {
    return `Lv. ${minLevel} - ${maxLevel}`;
  }, [minLevel, maxLevel]);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
          {/* Search Field */}
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search players..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Job Selector */}
          <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-filter-label">Job</InputLabel>
              <Select
                labelId="job-filter-label"
                value={job}
                label="Job"
                onChange={handleJobChange}
              >
                {JOB_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Job Type Toggle */}
          <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
            <Box>
              <InputLabel shrink sx={{ mb: 1, ml: 1, color: 'text.primary' }}>
                Job Type
              </InputLabel>
              <StyledToggleButtonGroup
                value={jobType}
                exclusive
                onChange={handleJobTypeChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="main">Main</ToggleButton>
                <ToggleButton value="sub">Sub</ToggleButton>
              </StyledToggleButtonGroup>
            </Box>
          </Box>

          {/* Level Range Slider */}
          <Box sx={{ flex: '2 1 300px', px: 2 }}>
            <InputLabel shrink sx={{ mb: 1, color: 'text.primary' }}>
              Level Range: {levelText}
            </InputLabel>
            <StyledSlider
              value={[minLevel, maxLevel]}
              onChange={handleLevelChange}
              valueLabelDisplay="auto"
              aria-labelledby="level-range-slider"
              min={1}
              max={75}
              valueLabelFormat={(value) => `Lv ${value}`}
              sx={{
                mt: 3,
                px: 1,
              }}
            />
          </Box>

          {/* Search */}
          <Box sx={{ flex: '1 1 200px', maxWidth: '100%' }}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                }
              }}
            />
          </Box>

        </Box>

        {/* Alert Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', pl: 2, borderLeft: `1px solid ${theme.palette.divider}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={alertEnabled}
                onChange={handleAlertToggle}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon color={alertEnabled ? 'primary' : 'action'} fontSize="small" />
                <Typography variant="body2">
                  Alerts {alertEnabled ? 'On' : 'Off'}
                </Typography>
              </Box>
            }
            labelPlacement="start"
            sx={{ m: 0 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};
