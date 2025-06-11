import { useEffect, useMemo, useState, useRef, type FC } from 'react';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import type { Player, FilterOptions, PlayerRow, JobAbbreviation } from '../types';
import { JOB_COLORS, NATION_COLORS } from '../types';

// Types
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

// Components
const JobCell: FC<JobCellProps> = ({ job, level, isMain = false }) => {
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

const NewPlayerBadge: FC = () => {
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

// Main Component
const PlayerTable: FC<PlayerTableProps> = ({
  players = [],
  onPlaySound,
}) => {
  const theme = useTheme();
  const [newPlayers, setNewPlayers] = useState<Set<string>>(new Set());
  const prevPlayersRef = useRef<Player[]>([]);
  const [tableData, setTableData] = useState<PlayerRow[]>([]);

  // Table styles
  const customStyles = useMemo(() => ({
    table: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    headRow: {
      style: {
        backgroundColor: theme.palette.background.paper,
        borderBottom: `2px solid ${theme.palette.divider}`,
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
    cells: {
      style: {
        padding: '12px 16px',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        backgroundColor: theme.palette.background.paper,
        '&:not(:last-of-type)': {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      },
    },
    pagination: {
      style: {
        borderTop: `1px solid ${theme.palette.divider}`,
        padding: '16px 8px',
      },
    },
  }), [theme]);

  // Process player data
  const processedData = useMemo(() => {
    return players.map((player) => {
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
  }, [players, newPlayers]);

  // Update table data when processed data changes
  useEffect(() => {
    setTableData(processedData);
  }, [processedData]);

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

  // Table columns
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
        selector: row => row.nation || 'Unknown',
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
        selector: row => row.mjob || 'N/A',
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
        selector: row => row.sjob || 'N/A',
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
        selector: row => row.rank || 'N/A',
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
    [theme]
  );

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      '& .rdt_Table': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      '& .rdt_TableBody': {
        flex: 1,
      },
      '& .rdt_TableCol_Sortable': {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      },
    }}>
      <DataTable
        columns={columns}
        data={tableData}
        customStyles={customStyles}
        pagination
        paginationPerPage={25}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: false,
        }}
        highlightOnHover
        pointerOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="calc(100vh - 280px)"
        defaultSortFieldId="charname"
        defaultSortAsc={true}
        noDataComponent={
          <Box sx={{ 
            padding: '40px 0', 
            textAlign: 'center', 
            color: 'text.secondary',
            fontStyle: 'italic'
          }}>
            No players found
          </Box>
        }
      />
    </Box>
  );
};

export default PlayerTable;
