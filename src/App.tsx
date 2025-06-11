import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { ffxiTheme } from './theme';
import { fetchPlayers } from './services/api';
import { FilterBar } from './components/FilterBar';
import PlayerTable from './components/PlayerTableModern';
import { Header } from './components/Header';
import type { Player, FilterOptions } from './types';

const INITIAL_FILTERS: FilterOptions = {
  job: '',
  jobType: 'any',
  minLevel: 1,
  maxLevel: 75,
  searchTerm: '',
  alertEnabled: true,
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load notification sound
  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback((): void => {
    if (filters.alertEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e: Error) => console.error('Error playing sound:', e));
    }
  }, [filters.alertEnabled]);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchPlayers();
      setPlayers(data.chars);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch players:', err);
      setError('Failed to fetch player data. Please try again later.');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling
  useEffect(() => {
    const minDelay = 30000; // 30 seconds
    const maxDelay = 60000; // 60 seconds
    
    const getRandomDelay = () => Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const poll = (): void => {
      void fetchData();
      timeoutId = setTimeout(poll, getRandomDelay());
    };
    
    timeoutId = setTimeout(poll, getRandomDelay());
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchData]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <ThemeProvider theme={ffxiTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundImage: 'url(/assets/Chocobo_FFT.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1,
            },
          }}
        >
          <Header />
          
          <Container 
            maxWidth="xl" 
            sx={{ 
              py: 4,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              p: { xs: 2, md: 4 },
              mb: 3
            }}>
              <Box sx={{ 
                mb: 4, 
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(-10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(45deg, #ffd700 30%, #ffa500 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  FFXI Party Finder
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#f0f0f0',
                    fontStyle: 'italic',
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  Real-time party search for HorizonXI
                </Typography>
              </Box>

              <FilterBar 
                filterOptions={filters} 
                onFilterChange={handleFilterChange} 
              />
            </Box>

            <PlayerTable 
              players={players}
              filterOptions={filters}
              onPlaySound={playNotificationSound}
            />

            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Box sx={{ 
              mt: 3, 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              Data updates every 30-60 seconds • Last updated: {new Date().toLocaleTimeString()}
            </Box>
          </Container>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
