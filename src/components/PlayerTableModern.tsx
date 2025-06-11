import { useEffect, useMemo, useState, useRef } from 'react';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { Box, Typography, useTheme, CircularProgress, Tooltip } from '@mui/material';
import type { Player, FilterOptions, PlayerRow, JobAbbreviation } from '../types';
import { JOB_COLORS, NATION_COLORS } from '../types';

interface JobCellProps {
  job: string;
  level: number;
  isMain?: boolean;
}

interface PlayerTableProps {
  players: Player[];
  filterOptions: FilterOptions;
  onPlaySound: () => void;
}

const JobCell = ({ job, level, isMain = false }: JobCellProps) => {
  const color = JOB_COLORS[job as JobAbbreviation] || '#cccccc';
  return (
    <Box 
      component="span"
      sx={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: `${color}33`,
        color: isMain ? '#fff' : 'inherit',
        border: `1px solid ${color}`,
        fontSize: '0.8rem',
        whiteSpace: 'nowrap',
        margin: '2px',
        fontWeight: isMain ? 'bold' : 'normal',
      }}
    >
      {job} {level > 0 ? level : ''}
    </Box>
  );
};

const NewPlayerBadge = () => {
  const theme = useTheme();
  return (
  <Box 
    component="span"
    sx={{
      display: 'inline-block',
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      borderRadius: '4px',
      padding: '0 6px',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      marginLeft: '8px',
      animation: 'pulse 1.5s infinite',
      '@keyframes pulse': {
        '0%': { opacity: 0.6 },
        '50%': { opacity: 1 },
        '100%': { opacity: 0.6 }
      }
    }}
  >
    NEW
  </Box>
  );
};

const useTableStyles = () => {
  const theme = useTheme();
  
  return useMemo(() => ({
    table: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    headRow: {
      style: {
        backgroundColor: 'rgba(50, 40, 30, 0.9)',
        backdropFilter: 'blur(8px)',
        border: 'none',
        minHeight: '56px',
        borderRadius: '8px 8px 0 0',
        '&:hover': {
          backgroundColor: 'rgba(70, 60, 50, 0.95)',
        },
      },
    },
    headCells: {
      style: {
        paddingLeft: '20px',
        paddingRight: '20px',
        fontWeight: 600,
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        '&:first-of-type': {
          borderTopLeftRadius: '12px',
          paddingLeft: '24px',
        },
        '&:last-child': {
          borderTopRightRadius: '12px',
          paddingRight: '24px',
        },
      },
    },
    cells: {
      style: {
        padding: '12px 16px',
        color: '#3a3a3a',
        fontSize: '0.9rem',
        '&:first-of-type': {
          paddingLeft: '20px',
          fontWeight: 500,
        },
        '&:last-child': {
          paddingRight: '20px',
        },
        '&:hover': {
          backgroundColor: 'transparent !important',
        },
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        margin: '0 0 8px 0',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          '& td': {
            backgroundColor: 'transparent',
          },
        },
        '&:not(:last-of-type)': {
          borderBottom: 'none',
        },
      },
      stripedStyle: {
        backgroundColor: 'rgba(240, 240, 240, 0.5)',
      },
    },
    pagination: {
      style: {
        border: 'none',
        padding: '16px 24px',
        backgroundColor: 'transparent',
        '& div, & span': {
          color: '#f0f0f0',
          fontSize: '0.9rem',
        },
        '& button': {
          color: '#f0f0f0',
          borderRadius: '4px',
          '&:disabled': {
            opacity: 0.6,
          },
          '&:hover:not(:disabled)': {
            backgroundColor: 'rgba(200, 170, 120, 0.3)',
            color: '#fff',
          },
        },
      },
    },
  }), [theme]);
};

const PlayerTable: React.FC<PlayerTableProps> = ({
  players = [],
  filterOptions,
  onPlaySound,
}) => {
  const theme = useTheme();
  const customStyles = useTableStyles();
  const [tableData, setTableData] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPlayersRef = useRef<Player[]>([]);
  const [newPlayers, setNewPlayers] = useState<Set<string>>(new Set());
  
  // Set loading to false when players are loaded
  useEffect(() => {
    if (players.length > 0) {
      setLoading(false);
    }
  }, [players]);
  
  // Process and filter player data
  const processedData = useMemo(() => {
    return players
      .filter(player => {
        // Filter by job
        if (filterOptions.job && filterOptions.job !== 'All' && 
            player.mjob !== filterOptions.job && player.sjob !== filterOptions.job) {
          return false;
        }
        
        // Filter by level range (using mlvl for main job level)
        if (filterOptions.minLevel && player.mlvl < filterOptions.minLevel) {
          return false;
        }
        
        if (filterOptions.maxLevel && player.mlvl > filterOptions.maxLevel) {
          return false;
        }
        
        // Filter by name search
        if (filterOptions.searchTerm) {
          const searchTerm = filterOptions.searchTerm.toLowerCase();
          if (!player.charname?.toLowerCase().includes(searchTerm)) {
            return false;
          }
        }
        
        return true;
      })
      .map((player) => {
        const otherJobs = Object.entries(player.jobs || {})
          .filter(([job, level]) => job !== player.mjob && job !== player.sjob && level > 0)
          .map(([job, level]) => `${job} ${level}`);
        
        return {
          ...player,
          id: player.charname,
          otherJobs,
          isNew: newPlayers.has(player.charname)
        };
      });
  }, [players, newPlayers, filterOptions]);

  // Update table data when processed data changes
  useEffect(() => {
    setTableData(processedData);
  }, [processedData]);

  // Define columns
  const columns = useMemo<TableColumn<PlayerRow>[]>(
    () => [
      {
        name: 'Name',
        selector: row => row.charname,
        sortable: true,
        cell: row => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2">
              {row.charname || 'Unknown'}
              {row.isNew && <NewPlayerBadge />}
            </Typography>
          </Box>
        ),
        width: '180px',
      },
      {
        name: 'Nation',
        selector: row => row.nation,
        sortable: true,
        cell: row => {
          const nation = row.nation || 'Unknown';
          const nationColor = NATION_COLORS[nation as keyof typeof NATION_COLORS] || theme.palette.grey[500];
          return (
            <Box
              sx={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: `${nationColor}22`,
                color: theme.palette.getContrastText(nationColor),
                border: `1px solid ${nationColor}`,
                display: 'inline-block',
                fontWeight: 'medium',
                fontSize: '0.8rem',
              }}
            >
              {nation}
            </Box>
          );
        },
        width: '120px',
      },
      {
        name: 'Main Job',
        selector: row => row.mjob,
        sortable: true,
        cell: row => (
          <JobCell 
            job={row.mjob || 'N/A'} 
            level={row.mlvl || 0} 
            isMain 
          />
        ),
        width: '120px',
      },
      {
        name: 'Sub Job',
        selector: row => row.sjob,
        sortable: true,
        cell: row => (
          <JobCell 
            job={row.sjob || 'N/A'} 
            level={row.slvl || 0} 
          />
        ),
        width: '100px',
      },
      {
        name: 'Rank',
        selector: row => row.rank,
        sortable: true,
        cell: row => <Box sx={{ fontWeight: 'bold' }}>{row.rank || 'N/A'}</Box>,
        width: '80px',
      },
      {
        name: 'Other Jobs',
        selector: row => row.otherJobs?.join(', ') || '',
        cell: row => (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Array.isArray(row.otherJobs) && row.otherJobs.map((job: string) => {
              const [jobName, level] = job.split(' ');
              return (
                <JobCell 
                  key={jobName}
                  job={jobName} 
                  level={parseInt(level, 10) || 0} 
                />
              );
            })}
          </Box>
        ),
        minWidth: '200px',
      },
      {
        name: 'Message',
        selector: row => row.seacomMessage || '',
        cell: row => (
          <Tooltip title={row.seacomMessage || 'No message'}>
            <Typography noWrap sx={{ maxWidth: '200px' }}>
              {row.seacomMessage || 'No message'}
            </Typography>
          </Tooltip>
        ),
        minWidth: '250px',
      },
    ],
    [newPlayers, theme]
  );

  // Detect new players and update state
  useEffect(() => {
    const newPlayerSet = new Set<string>();
    const currentPlayerIds = new Set(players.map(p => p.charname));
    
    // Find new players that weren't in the previous render
    if (prevPlayersRef.current.length > 0) {
      players.forEach(player => {
        if (!prevPlayersRef.current.some(p => p.charname === player.charname)) {
          newPlayerSet.add(player.charname);
          onPlaySound();
        }
      });
    }
    
    setNewPlayers(prev => {
      const updated = new Set([...prev]);
      // Remove players that are no longer in the list
      Array.from(updated).forEach(name => {
        if (!currentPlayerIds.has(name)) {
          updated.delete(name);
        }
      });
      // Add new players
      newPlayerSet.forEach(name => updated.add(name));
      return updated;
    });
    
    // Update the previous players ref
    prevPlayersRef.current = [...players];
  }, [players, onPlaySound]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [players]);

  if (isLoading) {
    return (
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" size={40} thickness={4} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Loading player data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
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
      '& > *': {
        position: 'relative',
        zIndex: 2,
      },
      '& .rdt_Table': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
      },
      '& .rdt_TableBody': {
        backgroundColor: 'transparent',
      },
      '& .rdt_TableRow': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginBottom: '8px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
        },
      },
      '& .rdt_TableCol_Sortable': {
        '&:hover': {
          color: '#333',
        },
      },
    }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <CircularProgress sx={{ color: '#333' }} />
          <Typography variant="body1" sx={{ ml: 2, color: '#333' }}>
            Loading players...
          </Typography>
        </Box>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          customStyles={customStyles}
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[10, 25, 50]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
            noRowsPerPage: false,
            selectAllRowsItem: false,
          }}
          highlightOnHover
          pointerOnHover
          responsive
          noDataComponent={
            <Box sx={{ 
              textAlign: 'center', 
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" color="textSecondary">
                No players found matching your criteria
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Try adjusting your filters or check back later
              </Typography>
            </Box>
          }
        />
      )}
    </Box>
  );
};

export default PlayerTable;
