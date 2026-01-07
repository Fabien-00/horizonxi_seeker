import React, { useState, useEffect, useMemo } from 'react';
import { Paper, TextField, Button, Typography, Autocomplete, IconButton, Badge } from '@mui/material';
import { NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { type FilterOptions, type Job } from '../types/index';
import { HORIZON_JOB_ABBREVIATIONS } from '../types/index';

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

  const debouncedFilterChange = useMemo(
    () => debounce((filters: FilterOptions) => onFilterChange(filters), 300),
    [onFilterChange]
  );

  useEffect(() => {
    setLocalFilters(filterOptions);
  }, [filterOptions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    let processedValue: string | number | '' = value;
    if (name === 'minLevel' || name === 'maxLevel') {
      processedValue = value === '' ? ('' as number | '') : Number(value);
      if (isNaN(Number(processedValue)) && value !== '') return; // Prevent non-numeric input for levels unless empty
      if (Number(processedValue) < 1 && value !== '') processedValue = 1;
      if (Number(processedValue) > 75 && value !== '') processedValue = 75;
    }

    const newFilters = {
      ...localFilters,
      [name]: processedValue,
    } as FilterOptions;
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleMainJobChange = (selectedMainJobs: Job[]) => {
    const newFilters = {
      ...localFilters,
      mainJobs: selectedMainJobs,
      selectedJobs: [], // Clear generic selectedJobs when specific main jobs are chosen
    } as FilterOptions;
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleSubJobChange = (selectedSubJobs: Job[]) => {
    const newFilters = {
      ...localFilters,
      subJobs: selectedSubJobs,
      selectedJobs: [], // Clear generic selectedJobs when specific sub jobs are chosen
    } as FilterOptions;
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        p: theme.spacing(1.5, 2),
        mb: 2, 
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2.5), // Increased gap for better separation
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: '0',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle1" sx={{ 
        mr: 1, 
        color: theme.palette.text.primary, // Changed to primary for more emphasis
        fontSize: '0.9rem', // Slightly larger
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        FILTERS:
      </Typography>

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={HORIZON_JOB_ABBREVIATIONS as Job[]}
        getOptionLabel={(option) => option}
        value={localFilters.mainJobs}
        onChange={(_event, newValue) => {
          handleMainJobChange(newValue as Job[]);
        }}
        renderInput={(params) => <TextField {...params} label="Main Job(s)" variant="outlined" />}
        size="small"
        sx={{ width: 200 }}
        ChipProps={{
          size: 'small',
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[500],
            color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[500]),
            '& .MuiChip-deleteIcon': {
              color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[500]),
            },
          }
        }}
      />

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={HORIZON_JOB_ABBREVIATIONS as Job[]}
        getOptionLabel={(option) => option}
        value={localFilters.subJobs}
        onChange={(_event, newValue) => {
          handleSubJobChange(newValue as Job[]);
        }}
        renderInput={(params) => <TextField {...params} label="Sub Job(s)" variant="outlined" />}
        size="small"
        sx={{ width: 200 }}
        ChipProps={{
          size: 'small',
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400]),
            '& .MuiChip-deleteIcon': {
              color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400]),
            },
          }
        }}
      />

      <TextField
        name="minLevel"
        label="Min Lvl"
        type="number"
        variant="outlined"
        size="small"
        value={localFilters.minLevel}
        onChange={handleInputChange}
        inputProps={{ min: 1, max: 75, style: { MozAppearance: 'textfield' } }} // Firefox style fix
        InputLabelProps={{ shrink: true }}
        sx={{ width: 90, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
      />

      <TextField
        name="maxLevel"
        label="Max Lvl"
        type="number"
        variant="outlined"
        size="small"
        value={localFilters.maxLevel}
        onChange={handleInputChange}
        inputProps={{ min: 1, max: 75, style: { MozAppearance: 'textfield' } }} // Firefox style fix
        InputLabelProps={{ shrink: true }}
        sx={{ width: 90, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
      />

      <TextField
        name="searchTerm"
        label="Search Name/Comment" // Clarified label
        variant="outlined"
        size="small"
        value={localFilters.searchTerm}
        onChange={handleInputChange}
        sx={{ maxWidth: 200 }}
      />

      <Button
        variant="outlined"
        size="small"
        onClick={() => {
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
          debouncedFilterChange(resetFilters);
        }}
        sx={{
          color: theme.palette.error.main,
          borderColor: theme.palette.error.main,
          '&:hover': {
            borderColor: theme.palette.error.dark,
            backgroundColor: `rgba(244, 67, 54, 0.04)`,
          },
        }}
      >
        Reset Filters
      </Button>

      <IconButton
        onClick={() => {
          const newFilters = {
            ...localFilters,
            alertEnabled: !localFilters.alertEnabled,
          };
          setLocalFilters(newFilters);
          debouncedFilterChange(newFilters);
        }}
        sx={{
          color: localFilters.alertEnabled ? theme.palette.warning.main : theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: `rgba(255, 193, 7, 0.08)`,
          },
        }}
        title={localFilters.alertEnabled ? 'Disable notifications for new players' : 'Enable notifications for new players'}
      >
        {localFilters.alertEnabled ? (
          <Badge color="warning" variant="dot">
            <NotificationsActive />
          </Badge>
        ) : (
          <NotificationsOff />
        )}
      </IconButton>

      {/* Removed Hide Full Parties Checkbox */}
    </Paper>
  );
};

export default FilterBar;
