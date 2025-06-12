import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { ffxiTheme } from './theme';
import FilterBar from './components/FilterBar';
import PlayerTable from './components/PlayerTable';
import { Header } from './components/Header';
import type { PlayerRow, FilterOptions, Job, ApiResponse, PlayerData } from './types';
import { Alert } from '@mui/material';
import { useMemo } from 'react';

function App() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    minLevel: 1, // Default min level
    maxLevel: 99, // Default max level
    mainJob: null,
    subJob: null,
    alertEnabled: false,
    // hideFullParties is removed from FilterOptions type and initial state
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API endpoint is already corrected in the viewed file.
      const response = await fetch('https://api.horizonxi.com/api/v1/chars/lfp'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponseData: ApiResponse = await response.json();

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
        setOnlineCount(apiResponseData.total); // Ensure this uses apiResponseData.total
      } else {
        // It seems the previous error message was for 'data' but the code was already using 'chars'.
        // The user's new input confirms 'chars' is correct. The error might be elsewhere or intermittent.
        // For now, let's ensure the error message accurately reflects what we expect.
        console.error("API response did not contain expected 'chars' array or 'total' count:", apiResponseData);
        setPlayers([]); // Set to empty array to prevent further errors
        setOnlineCount(0);
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
  }, []); // Added missing dependency array

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);

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

  // Sound alert logic (simplified, consider a more robust solution if needed)
  // Sound alert logic (simplified, consider a more robust solution if needed)
  const prevFilteredPlayersRef = useRef<PlayerRow[]>([]);
  useEffect(() => {
    if (filterOptions.alertEnabled && filteredPlayers.length > 0) {
      // Play sound only if new players are added to the filtered list
      const newMatchingPlayers = filteredPlayers.filter(
        p1 => !prevFilteredPlayersRef.current.some(p2 => p2.charid === p1.charid)
      );
      if (newMatchingPlayers.length > 0) {
        // const audio = new Audio('/path-to-your-alert-sound.mp3'); // Replace with your sound file path
        // audio.play().catch(err => console.error("Error playing sound:", err));
        console.log("Alert: New players matching filters!"); // Placeholder for actual sound
      }
    }
    prevFilteredPlayersRef.current = filteredPlayers;
  }, [filteredPlayers, filterOptions.alertEnabled]);

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
      <Header />
      {/* Container styling adjusted to match the image's full-width feel for content area */}
      <Container maxWidth={false} disableGutters sx={{ 
        // mt: 0, mb: 0, p:0, // Remove default container margins and paddings if going full screen
        backgroundColor: ffxiTheme.palette.background.default, // Main content area background
        minHeight: 'calc(100vh - 56px)', // Assuming AppBar height is around 56px (theme.mixins.toolbar.minHeight)
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
          padding: ffxiTheme.spacing(0, 2, 2, 2) 
        }}>
          <PlayerTable 
            players={filteredPlayers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            loading={loading} 
            page={page}
            rowsPerPage={rowsPerPage}
            totalPlayers={filteredPlayers.length}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>
        {lastFetchTime && (
          <Typography variant="caption" display="block" sx={{ p: ffxiTheme.spacing(0, 2, 1, 2), textAlign: 'right', fontSize: '0.7rem', color: ffxiTheme.palette.text.disabled }}>
            Last updated: {lastFetchTime.toLocaleTimeString()} | Online: {onlineCount ?? 'N/A'}
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
