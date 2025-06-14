import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { ffxiTheme } from './theme';
import FilterBar from './components/FilterBar';
import PlayerTable from './components/PlayerTable';
import { Header } from './components/Header';
import type { PlayerRow, FilterOptions, Job, ApiResponse, PlayerData } from './types/index';
import { Alert } from '@mui/material';
import { useMemo } from 'react';

function App() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    mainJobs: [],
    subJobs: [],
    minLevel: 1 as number | '', // Default min level
    maxLevel: 75 as number | '', // Default max level
    selectedJobs: [],
    jobType: 'any',
    alertEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  // const [newPlayerIds, setNewPlayerIds] = useState<Set<number>>(new Set()); // Removed, redundant
  const [knownPlayerCharIds, setKnownPlayerCharIds] = useState<Set<number>>(() => {
    const storedKnownPlayerCharIds = localStorage.getItem('knownPlayerCharIds');
    return storedKnownPlayerCharIds ? new Set(JSON.parse(storedKnownPlayerCharIds)) : new Set();
  });


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<'mlvl' | 'slvl' | 'charname' | null>('mlvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  const [newPlayerRefreshCount, setNewPlayerRefreshCount] = useState<Map<number, number>>(() => {
    const storedNewPlayerRefreshCount = localStorage.getItem('newPlayerRefreshCount');
    return storedNewPlayerRefreshCount ? new Map(JSON.parse(storedNewPlayerRefreshCount)) : new Map();
  }); // Stores charid -> refresh_cycle_count (0 or 1)
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState<boolean>(false);

const fetchDataRef = useRef<typeof fetchData | null>(null);

  useEffect(() => {
    localStorage.setItem('knownPlayerCharIds', JSON.stringify(Array.from(knownPlayerCharIds)));
  }, [knownPlayerCharIds]);

  useEffect(() => {
    localStorage.setItem('newPlayerRefreshCount', JSON.stringify(Array.from(newPlayerRefreshCount.entries())));
  }, [newPlayerRefreshCount]);

  const fetchData = useCallback(async (isRefresh = false) => {
    // Only show loading spinner on initial load, not on refresh
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      // API endpoint is already corrected in the viewed file.
      const response = await fetch('https://api.horizonxi.com/api/v1/chars/lfp'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response from server');
      }
      
      let apiResponseData: ApiResponse;
      try {
        apiResponseData = JSON.parse(text);
      } catch (jsonError) {
        throw new Error('Invalid JSON response from server');
      }

      // Ensure apiResponseData.chars exists and is an array before mapping
      if (apiResponseData && Array.isArray(apiResponseData.chars)) {
        const currentKnownPlayerCharIds = new Set(knownPlayerCharIds);
        const updatedNewPlayerRefreshCount = new Map(newPlayerRefreshCount);
        console.log('Initial knownPlayerCharIds:', new Set(knownPlayerCharIds));
        console.log('Initial newPlayerRefreshCount:', new Map(newPlayerRefreshCount));

        // Step 1: Update refresh counts for players already marked as new and expire them if needed
        if (isRefresh) {
          newPlayerRefreshCount.forEach((count, playerId) => {
            const newCount = count + 1;
            if (newCount >= 2) { // Persist for 2 refreshes (0, 1), remove when count becomes 2
              updatedNewPlayerRefreshCount.delete(playerId);
            } else {
              updatedNewPlayerRefreshCount.set(playerId, newCount);
            }
          });
        }

        const formattedPlayers: PlayerRow[] = apiResponseData.chars.map((p: PlayerData, index: number) => {
          const charId = p.charid || index; // Use index as fallback, though charid should be reliable
          let isNewPlayer = false;
          console.log(`Processing player ${p.charname} (ID: ${charId})`);

          if (!knownPlayerCharIds.has(charId)) {
            // This player is seen for the very first time
            isNewPlayer = true;
            currentKnownPlayerCharIds.add(charId); // Add to known IDs for next cycle
            updatedNewPlayerRefreshCount.set(charId, 0); // Start refresh count at 0
            console.log(`Player ${p.charname} (ID: ${charId}) is NEW (first time seen). Setting refresh count to 0.`);
          } else if (updatedNewPlayerRefreshCount.has(charId)) {
            // This player was new in a previous cycle and is still within its "new" window
            isNewPlayer = true;
            console.log(`Player ${p.charname} (ID: ${charId}) is NEW (still in window). Refresh count: ${updatedNewPlayerRefreshCount.get(charId)}`);
          } else {
            console.log(`Player ${p.charname} (ID: ${charId}) is NOT new.`);
          }

          return {
            charid: charId,
            avatar: p.avatar || '',
            charname: p.charname,
            mjob: p.mjob as Job,
            mlvl: p.mlvl,
            sjob: p.sjob as Job,
            slvl: p.slvl,
            seacomMessage: p.seacomMessage || null,
            seacomType: p.seacomType,
            jobs: p.jobs,
            isNew: isNewPlayer, // Set the isNew flag
          };
        });

        setPlayers(formattedPlayers);
        setKnownPlayerCharIds(currentKnownPlayerCharIds);
        setNewPlayerRefreshCount(updatedNewPlayerRefreshCount);
        console.log('Updated knownPlayerCharIds:', currentKnownPlayerCharIds);
        console.log('Updated newPlayerRefreshCount:', updatedNewPlayerRefreshCount);

      } else {
        console.error("API response did not contain expected 'chars' array or 'total' count:", apiResponseData);
        setPlayers([]); // Set to empty array to prevent further errors
      }
      setLastFetchTime(new Date());
      setPage(0);

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, [knownPlayerCharIds, newPlayerRefreshCount]); // Added missing dependency array

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
if (fetchDataRef.current) {
  fetchDataRef.current(); // Initial load
}
    
    const scheduleNextRefresh = () => {
      if (isAutoRefreshPaused) {
        setRefreshCountdown(0);
        return null;
      }
      // Random interval between 60-100 seconds (60 + 0-40 seconds)
      const randomDelay = 60000 + Math.random() * 40000;
      setRefreshCountdown(Math.ceil(randomDelay / 1000));
      
      return setTimeout(() => {
if (fetchDataRef.current) {
  fetchDataRef.current(true);
}
        scheduleNextRefresh(); // Schedule the next refresh
      }, randomDelay);
    };
    
    const timeoutId = scheduleNextRefresh();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAutoRefreshPaused]);

  // Countdown timer effect
  useEffect(() => {
    if (refreshCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [refreshCountdown]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setPage(0); // Reset to first page on filter change
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const commentLower = player.seacomMessage?.toLowerCase() || '';
      const charnameLower = player.charname?.toLowerCase() || '';
      const searchTermLower = filterOptions.searchTerm.toLowerCase();
      
      const levelMatch = 
        (filterOptions.minLevel === null || filterOptions.minLevel === '' || player.mlvl >= Number(filterOptions.minLevel)) &&
        (filterOptions.maxLevel === null || filterOptions.maxLevel === '' || player.mlvl <= Number(filterOptions.maxLevel));
      
      const mainJobMatch = filterOptions.mainJobs.length === 0 || filterOptions.mainJobs.includes(player.mjob);
      const subJobMatch = filterOptions.subJobs.length === 0 || filterOptions.subJobs.includes(player.sjob);

      // Search term can match charname or comment
      const searchMatch = filterOptions.searchTerm === '' || 
                          charnameLower.includes(searchTermLower) || 
                          commentLower.includes(searchTermLower);
      
      // const partyStatusMatch = !filterOptions.hideFullParties || !player.party || player.party.members < player.party.max_members;
      // Party related filtering removed as party details are not in PlayerRow for the new table

      return levelMatch && mainJobMatch && subJobMatch && searchMatch;
    });
  }, [players, filterOptions]);

  const prevFilteredPlayersRef = useRef<PlayerRow[]>([]);
  useEffect(() => {
    const previousFilteredIds = new Set(prevFilteredPlayersRef.current.map(p => p.charid));
    const newlyAddedPlayers = filteredPlayers.filter(p => !previousFilteredIds.has(p.charid));

    if (filterOptions.alertEnabled && newlyAddedPlayers.length > 0) {
      // Play FFXI-style ring notification sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // FFXI-style bell ring: high frequency with quick decay
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (err) {
        console.log('Audio notification not available:', err);
      }
      console.log("Alert: New players matching filters!", newlyAddedPlayers.map(p => p.charname));
      
      // Update newPlayerRefreshCount for newly added players
      // The logic for setting isNew is now handled within fetchData
      // This effect primarily handles the alert sound and logging.
      // No need to directly manipulate newPlayerRefreshCount here for setting isNew,
      // as fetchData already does that. We just need to ensure the dependency array is correct.
    }
    prevFilteredPlayersRef.current = filteredPlayers;
  }, [filteredPlayers, filterOptions.alertEnabled, newPlayerRefreshCount]); // Updated dependency array

  const handleSort = (column: 'mlvl' | 'slvl' | 'charname') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const playersWithNewFlag = useMemo(() => {
    // The `isNew` flag is now directly part of the PlayerRow object from `fetchData`
    // So, we don't need to map and add it here. We can directly use `filteredPlayers`
    // or if `players` (the raw list from API) already has `isNew` correctly set by `fetchData`,
    // then `filteredPlayers` will also have it.
    // The `isNew` property is already set in the `formattedPlayers` within `fetchData`.
    // Thus, `filteredPlayers` (which is derived from `players`) will already have this flag.

    if (!sortBy) return filteredPlayers; // Use filteredPlayers directly

    // Create a new array for sorting to avoid mutating `filteredPlayers`
    const playersToSort = [...filteredPlayers];

    return playersToSort.sort((a, b) => { // Sort the new array
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'mlvl':
          aValue = a.mlvl;
          bValue = b.mlvl;
          break;
        case 'slvl':
          aValue = a.slvl;
          bValue = b.slvl;
          break;
        case 'charname':
          aValue = a.charname.toLowerCase();
          bValue = b.charname.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredPlayers, sortBy, sortOrder]); // Removed newPlayerIds from dependency array

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ThemeProvider theme={ffxiTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: ffxiTheme.palette.background.default,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(29, 78, 216, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, ${ffxiTheme.palette.background.default} 0%, #0a1929 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 30%)
          `,
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'drift 30s linear infinite',
          zIndex: 0,
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        '@keyframes drift': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
      }}>
        <Header />
      {/* Container styling adjusted to match the image's full-width feel for content area */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', backgroundColor: 'transparent' }}>
        <Container maxWidth={false} disableGutters sx={{ 
          width: '80%', // Set width to 80%
          // mt: 0, mb: 0, p:0, // Remove default container margins and paddings if going full screen
          backgroundColor: 'transparent', // Main content area background
          minHeight: 'calc(100vh - 56px)', // Assuming AppBar height is around 56px (theme.mixins.toolbar.minHeight)
          position: 'relative',
          zIndex: 1,
        }}>
          <FilterBar 
            filterOptions={filterOptions} 
            onFilterChange={handleFilterChange} 
          />
        {error && (
          <Alert severity="error" sx={{ m: 2, fontSize: '0.8rem' }}> {/* Margin instead of mb for consistency */}
            Error fetching data: {error}. Retrying in 60 seconds...
          </Alert>
        )}
        {/* Box for PlayerTableModern - no specific styling needed if table handles its own background via useTableStyles */}
        <Box sx={{ 
          padding: ffxiTheme.spacing(1, 2, 2, 2) // Adjusted top padding
        }}>
          <PlayerTable 
            players={playersWithNewFlag.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            loading={loading} 
            page={page}
            rowsPerPage={rowsPerPage}
            totalPlayers={filteredPlayers.length}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </Box>
        {lastFetchTime && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: ffxiTheme.spacing(1, 2, 1, 2) }}>
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: ffxiTheme.palette.text.secondary }}>
              Last updated: {lastFetchTime.toLocaleTimeString()}
              {refreshCountdown > 0 && ` • Next refresh in: ${Math.floor(refreshCountdown / 60)}:${(refreshCountdown % 60).toString().padStart(2, '0')}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <button
                onClick={() => {
                  if (!isAutoRefreshPaused) {
                    fetchData(true);
                    setRefreshCountdown(0);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isAutoRefreshPaused ? '⏸️ Paused' : '🔄 Refresh'}
              </button>
              <button
                onClick={() => {
                  setIsAutoRefreshPaused(!isAutoRefreshPaused);
                  if (isAutoRefreshPaused) {
                    // Resume refresh cycle
                    fetchData(true);
                  } else {
                    // Clear countdown when pausing
                    setRefreshCountdown(0);
                  }
                }}
                style={{
                  background: isAutoRefreshPaused ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #e53935)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isAutoRefreshPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
            </Box>
          </Box>
        )}
      </Container>
      </Box> {/* Closing the Box that wraps Container */}
      </Box> {/* Closing the main background Box */}
    </ThemeProvider>
  );
}

export default App;
