import { useState, useEffect, useMemo } from 'react';
import { TextField, FormControl, InputLabel, Typography, Paper, Button } from '@mui/material'; // Removed Select, FormControlLabel, Checkbox
// import type { SelectChangeEvent } from '@mui/material/Select'; // No longer needed for Select
import { useTheme } from '@mui/material/styles';
import type { FilterOptions, Job } from '../types';

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

// Mock JobSelectionDialog - currentMainJob and currentSubJob props are removed as they were unused warnings
const JobSelectionDialog: React.FC<{ open: boolean; onClose: () => void; onApply: (jobs: { mainJob: Job | null; subJob: Job | null }) => void; mainJob: Job | null; subJob: Job | null; }> = ({ open, onClose, onApply, mainJob, subJob }) => {
  if (!open) return null;
  // Basic state for the dialog's own job selection if needed, or pass directly
  const [selectedMainJob, setSelectedMainJob] = useState<Job | null>(mainJob);
  const [selectedSubJob, setSelectedSubJob] = useState<Job | null>(subJob);

  // Example jobs - replace with actual job list from types or props
  const exampleJobs: Job[] = ['WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN'];

  return (
    <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', zIndex: 100, border: '1px solid #ccc', borderRadius: '8px'}}>
      <Typography variant="h6">Select Jobs</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Main Job</InputLabel>
        <select value={selectedMainJob || ''} onChange={(e) => setSelectedMainJob(e.target.value as Job | null)} style={{padding: '10px', width: '100%'}}>
          <option value="">Any</option>
          {exampleJobs.map(job => <option key={`main-${job}`} value={job}>{job}</option>)}
        </select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Sub Job</InputLabel>
        <select value={selectedSubJob || ''} onChange={(e) => setSelectedSubJob(e.target.value as Job | null)} style={{padding: '10px', width: '100%'}}>
          <option value="">Any</option>
          {exampleJobs.map(job => <option key={`sub-${job}`} value={job}>{job}</option>)}
        </select>
      </FormControl>
      <Button onClick={() => onApply({ mainJob: selectedMainJob, subJob: selectedSubJob })} variant="contained" color="primary" style={{marginRight: '10px'}}>Apply</Button>
      <Button onClick={onClose} variant="outlined">Close</Button>
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({ filterOptions, onFilterChange }) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);
  const [openJobDialog, setOpenJobDialog] = useState(false);

  const debouncedFilterChange = useMemo(
    () => debounce((filters: FilterOptions) => onFilterChange(filters), 300),
    [onFilterChange]
  );

  useEffect(() => {
    setLocalFilters(filterOptions);
  }, [filterOptions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    let processedValue: string | number = value;
    if (name === 'minLevel' || name === 'maxLevel') {
      processedValue = value === '' ? '' : Number(value);
      if (isNaN(Number(processedValue)) && value !== '') return; // Prevent non-numeric input for levels unless empty
      if (Number(processedValue) < 1 && value !== '') processedValue = 1;
      if (Number(processedValue) > 99 && value !== '') processedValue = 99;
    }

    const newFilters = {
      ...localFilters,
      [name]: processedValue,
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const handleJobChange = (selectedJobs: { mainJob: Job | null; subJob: Job | null }) => {
    const newFilters = {
      ...localFilters,
      mainJob: selectedJobs.mainJob,
      subJob: selectedJobs.subJob,
    };
    setLocalFilters(newFilters);
    debouncedFilterChange(newFilters);
    setOpenJobDialog(false); // Close dialog on apply
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        p: theme.spacing(1.5, 2),
        mb: 2, 
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2),
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: '0',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ 
        mr: 1, 
        color: theme.palette.text.secondary, 
        fontSize: '0.8rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        FILTERS:
      </Typography>

      <Button 
        variant="outlined"
        onClick={() => setOpenJobDialog(true)} 
        size="small"
      >
        {localFilters.mainJob || localFilters.subJob ? 
          `Jobs: ${localFilters.mainJob || 'Any'} / ${localFilters.subJob || 'Any'}` : 
          'Select Jobs'}
      </Button>
      <JobSelectionDialog
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        mainJob={localFilters.mainJob}
        subJob={localFilters.subJob}
        onApply={handleJobChange}
      />

      <TextField
        name="minLevel"
        label="Min Lvl"
        type="number"
        variant="outlined"
        size="small"
        value={localFilters.minLevel}
        onChange={handleInputChange}
        inputProps={{ min: 1, max: 99, style: { MozAppearance: 'textfield' } }} // Firefox style fix
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
        inputProps={{ min: 1, max: 99, style: { MozAppearance: 'textfield' } }} // Firefox style fix
        InputLabelProps={{ shrink: true }}
        sx={{ width: 90, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
      />

      <TextField
        name="searchTerm"
        label="Comment Search"
        variant="outlined"
        size="small"
        value={localFilters.searchTerm}
        onChange={handleInputChange}
        sx={{ maxWidth: 200 }}
      />
      {/* Removed Hide Full Parties Checkbox */}
    </Paper>
  );
};

export default FilterBar;
