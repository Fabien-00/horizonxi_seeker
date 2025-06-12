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
    mainJob: null,
    subJob: null,
    minLevel: 1 as number | '', // Default min level
    maxLevel: 75 as number | '', // Default max level
    job: '' as Job | '',
    jobType: 'any',
    alertEnabled: false,
    // hideFullParties is removed from FilterOptions type and initial state
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [newPlayerIds, setNewPlayerIds] = useState<Set<number>>(new Set());


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<'mlvl' | 'slvl' | 'charname' | null>('mlvl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  const [newPlayerRefreshCount, setNewPlayerRefreshCount] = useState<Map<number, number>>(new Map());

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
        const formattedPlayers: PlayerRow[] = apiResponseData.chars.map((p: PlayerData, index: number) => ({
          charid: p.charid || index, // Fallback to index if charid is missing
          avatar: p.avatar || '', // Provide default for avatar
          charname: p.charname,
          mjob: p.mjob as Job, // Cast to Job type
          mlvl: p.mlvl,
          sjob: p.sjob as Job, // Cast to Job type
          slvl: p.slvl,
          comment: p.seacomMessage || null, // Use seacomMessage for comment, provide default null
          seacomType: p.seacomType,
        }));
        setPlayers(formattedPlayers);
      } else {
        // It seems the previous error message was for 'data' but the code was already using 'chars'.
        // The user's new input confirms 'chars' is correct. The error might be elsewhere or intermittent.
        // For now, let's ensure the error message accurately reflects what we expect.
        console.error("API response did not contain expected 'chars' array or 'total' count:", apiResponseData);
        setPlayers([]); // Set to empty array to prevent further errors
      }
      setLastFetchTime(new Date());
      setPage(0);
      
      // If this is a refresh, increment refresh count for NEW players
      if (isRefresh) {
        setNewPlayerRefreshCount(prevCount => {
          const updatedCount = new Map(prevCount);
          const idsToRemove: number[] = [];
          
          updatedCount.forEach((count, playerId) => {
            const newCount = count + 1;
            if (newCount >= 2) {
              // Remove after 2 refreshes
              idsToRemove.push(playerId);
            } else {
              updatedCount.set(playerId, newCount);
            }
          });
          
          // Remove players that have been through 2 refreshes
          idsToRemove.forEach(id => {
            updatedCount.delete(id);
            setNewPlayerIds(prevIds => {
              const updatedIds = new Set(prevIds);
              updatedIds.delete(id);
              return updatedIds;
            });
          });
          
          return updatedCount;
        });
      }

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
  }, []); // Added missing dependency array

  useEffect(() => {
    fetchData(); // Initial load
    
    const scheduleNextRefresh = () => {
      // Random interval between 60-100 seconds (60 + 0-40 seconds)
      const randomDelay = 60000 + Math.random() * 40000;
      setRefreshCountdown(Math.ceil(randomDelay / 1000));
      
      return setTimeout(() => {
        fetchData(true);
        scheduleNextRefresh(); // Schedule the next refresh
      }, randomDelay);
    };
    
    const timeoutId = scheduleNextRefresh();
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

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
      const commentLower = player.comment?.toLowerCase() || '';
      const charnameLower = player.charname?.toLowerCase() || '';
      const searchTermLower = filterOptions.searchTerm.toLowerCase();
      
      const levelMatch = 
        (filterOptions.minLevel === null || filterOptions.minLevel === '' || player.mlvl >= Number(filterOptions.minLevel)) &&
        (filterOptions.maxLevel === null || filterOptions.maxLevel === '' || player.mlvl <= Number(filterOptions.maxLevel));
      
      const mainJobMatch = !filterOptions.mainJob || player.mjob === filterOptions.mainJob;
      const subJobMatch = !filterOptions.subJob || player.sjob === filterOptions.subJob;

      // Search term can match charname or comment
      const searchMatch = filterOptions.searchTerm === '' || 
                          charnameLower.includes(searchTermLower) || 
                          commentLower.includes(searchTermLower);
      
      // const partyStatusMatch = !filterOptions.hideFullParties || !player.party || player.party.members < player.party.max_members;
      // Party related filtering removed as party details are not in PlayerRow for the new table

      return levelMatch && mainJobMatch && subJobMatch && searchMatch; // Removed partyStatusMatch
    });
  }, [players, filterOptions]);

  const prevFilteredPlayersRef = useRef<PlayerRow[]>([]);
  useEffect(() => {
    const previousFilteredIds = new Set(prevFilteredPlayersRef.current.map(p => p.charid));
    const newlyAddedPlayers = filteredPlayers.filter(p => !previousFilteredIds.has(p.charid));

    if (filterOptions.alertEnabled && newlyAddedPlayers.length > 0) {
      // Play sound with correct path
      const audio = new Audio('/chocobo.mp3'); // Try mp3 first
      audio.play().catch(err => {
        console.error("Error playing sound:", err);
        // Try alternative audio file
        const altAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        altAudio.play().catch(() => console.log('Audio notification not available'));
      });
      console.log("Alert: New players matching filters!", newlyAddedPlayers.map(p => p.charname));
      
      // Add new player IDs to state for highlighting and track refresh count
      const currentNewIds = new Set(newPlayerIds);
      const currentRefreshCount = new Map(newPlayerRefreshCount);
      newlyAddedPlayers.forEach(p => {
        currentNewIds.add(p.charid);
        currentRefreshCount.set(p.charid, 0); // Start counting refreshes for this player
      });
      setNewPlayerIds(currentNewIds);
      setNewPlayerRefreshCount(currentRefreshCount);
    }
    prevFilteredPlayersRef.current = filteredPlayers;
  }, [filteredPlayers, filterOptions.alertEnabled, newPlayerIds]);

  const handleSort = (column: 'mlvl' | 'slvl' | 'charname') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const playersWithNewFlag = useMemo(() => {
    const playersWithFlags = filteredPlayers.map(player => ({
      ...player,
      isNew: newPlayerIds.has(player.charid)
    }));

    if (!sortBy) return playersWithFlags;

    return playersWithFlags.sort((a, b) => {
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
  }, [filteredPlayers, newPlayerIds, sortBy, sortOrder]);

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
                  fetchData(true);
                  setRefreshCountdown(0);
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
                🔄 Refresh
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
