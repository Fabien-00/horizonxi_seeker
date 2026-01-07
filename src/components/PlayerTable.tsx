import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, TablePagination, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type PlayerRow, JOB_COLORS, type Job } from '../types/index'; // Assuming types are defined here

// Styles will be applied using the sx prop directly in the component.

interface PlayerTableProps {
  players: PlayerRow[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalPlayers: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: 'mlvl' | 'slvl' | 'charname' | null;
  sortOrder: 'asc' | 'desc';
  onSort: (column: 'mlvl' | 'slvl' | 'charname') => void;
}

const SEACOM_TYPE_MAP: { [key: number]: string } = {
  0: '-',
  1: 'PT',
  2: 'Alliance',
  3: 'Linkshell',
  4: 'Shout',
  5: 'Yell',
  6: 'Tell',
  // Add more mappings as needed
};

const mapSeacomType = (type: number | undefined): string => {
  if (type === undefined || !SEACOM_TYPE_MAP[type]) {
    return '-';
  }
  return SEACOM_TYPE_MAP[type];
};

const PlayerTable: React.FC<PlayerTableProps> = ({ 
  players,
  loading,
  page,
  rowsPerPage,
  totalPlayers,
  handleChangePage,
  handleChangeRowsPerPage,
  sortBy,
  sortOrder,
  onSort
}) => {
  const theme = useTheme();

  // Handle character name clicks
  const handleCharacterClick = (charname: string, event: React.MouseEvent) => {
    event.preventDefault();
    const url = `https://horizonxi.com/players/${encodeURIComponent(charname)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    console.log(`🔗 Opening player profile: ${url}`);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[3],
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{
        padding: theme.spacing(0.5, 2, 0.5, 2), // Even more reduced padding
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}` // Added a bottom border
      }}>
        <Typography variant="body2" sx={{
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}>
          {totalPlayers} SEEKING
        </Typography>
      </Box>
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader aria-label="player table" sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[900] }}>{/* Darker background for header */}
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(0.4, 0.75),
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2px',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('charname')}
              >
                Charname {sortBy === 'charname' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.common.white, 
                fontWeight: 'bold', 
                borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                padding: theme.spacing(0.4, 0.75),
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>Main Job</TableCell>
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(0.4, 0.75),
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2px',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('mlvl')}
              >
                Main Lvl {sortBy === 'mlvl' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.common.white, 
                fontWeight: 'bold', 
                borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                padding: theme.spacing(0.4, 0.75),
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>Sub Job</TableCell>
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(0.4, 0.75),
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2px',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('slvl')}
              >
                Sub Lvl {sortBy === 'slvl' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ 
                color: theme.palette.common.white, 
                fontWeight: 'bold', 
                borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                padding: theme.spacing(0.4, 0.75),
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>Other Jobs</TableCell>
              <TableCell sx={{ 
                color: theme.palette.common.white, 
                fontWeight: 'bold', 
                borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                padding: theme.spacing(0.4, 0.75),
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>Seacom Type</TableCell>
              <TableCell sx={{ 
                color: theme.palette.common.white, 
                fontWeight: 'bold', 
                borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                padding: theme.spacing(0.4, 0.75),
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>Seacom Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ // Adjusted colSpan to 8 to account for new 'Other Jobs' column
                  textAlign: 'center',
                  padding: theme.spacing(2),
                  color: theme.palette.text.secondary,
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ // Adjusted colSpan to 8 to account for new 'Other Jobs' column
                  textAlign: 'center',
                  padding: theme.spacing(2),
                  color: theme.palette.text.secondary,
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Typography>No players found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow 
                  key={player.charid} 
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.5, 0.75) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.primary,
                          fontSize: '0.75rem',
                          letterSpacing: '0.3px',
                          cursor: 'pointer',
                          userSelect: 'none', // Prevent text selection on double-click
                          '&:hover': {
                            color: theme.palette.text.secondary,
                          }
                        }}
                        onClick={(e) => handleCharacterClick(player.charname, e)}
                        title="Click to open player profile"
                      >
                        {player.charname}
                      </Typography>
                      {player.isNew && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            ml: 0.5, 
                            backgroundColor: theme.palette.secondary.main, 
                            color: theme.palette.secondary.contrastText, 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            letterSpacing: '0.3px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        >
                          NEW
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.5, 0.75) }}>
                    <Chip 
                      label={player.mjob} 
                      size="small"
                      sx={{ 
                        background: `linear-gradient(135deg, ${JOB_COLORS[player.mjob as Job] || '#4A5568'}, ${JOB_COLORS[player.mjob as Job] ? `${JOB_COLORS[player.mjob as Job]}cc` : '#2D3748'})`,
                        color: '#E2E8F0',
                        fontWeight: 500,
                        fontSize: '0.6rem',
                        letterSpacing: '0.2px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                        border: `1px solid ${JOB_COLORS[player.mjob as Job] ? `${JOB_COLORS[player.mjob as Job]}66` : '#4A5568'}`, 
                        borderRadius: '2px',
                        minWidth: '28px',
                        height: '18px',
                        padding: '0 4px',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                          border: `1px solid ${JOB_COLORS[player.mjob as Job] || '#A0AEC0'}`, 
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`, 
                    padding: theme.spacing(0.5, 0.75), 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}>{player.mlvl}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.5, 0.75) }}>
                    {player.sjob && player.sjob.trim() !== '' ? (
                      <Chip 
                        label={player.sjob} 
                        size="small"
                        sx={{ 
                          background: `linear-gradient(135deg, ${JOB_COLORS[player.sjob as Job] || '#4A5568'}, ${JOB_COLORS[player.sjob as Job] ? `${JOB_COLORS[player.sjob as Job]}cc` : '#2D3748'})`,
                          color: '#E2E8F0',
                          fontWeight: 500,
                          fontSize: '0.6rem',
                          letterSpacing: '0.2px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                          border: `1px solid ${JOB_COLORS[player.sjob as Job] ? `${JOB_COLORS[player.sjob as Job]}66` : '#4A5568'}`, 
                          borderRadius: '2px',
                          minWidth: '28px',
                          height: '18px',
                          padding: '0 4px',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                            border: `1px solid ${JOB_COLORS[player.sjob as Job] || '#A0AEC0'}`, 
                          }
                        }}
                      />
                    ) : (
                      <span style={{ 
                        color: theme.palette.text.secondary, 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.3px'
                      }}>-</span>
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`, 
                    padding: theme.spacing(0.5, 0.75), 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}>{player.slvl}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.5, 0.75) }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                      {player.jobs && Object.entries(player.jobs).map(([job, level]) => (
                        <Chip 
                          key={job} 
                          label={`${job.toUpperCase()} ${level}`} 
                          size="small" 
                          sx={{
                            background: `linear-gradient(135deg, ${JOB_COLORS[job.toUpperCase() as Job] || '#4A5568'}, ${JOB_COLORS[job.toUpperCase() as Job] ? `${JOB_COLORS[job.toUpperCase() as Job]}cc` : '#2D3748'})`,
                            color: '#E2E8F0',
                            fontWeight: 500,
                            fontSize: '0.6rem',
                            letterSpacing: '0.2px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                            border: `1px solid ${JOB_COLORS[job.toUpperCase() as Job] ? `${JOB_COLORS[job.toUpperCase() as Job]}66` : '#4A5568'}`, 
                            borderRadius: '2px',
                            minWidth: '28px',
                            height: '18px',
                            padding: '0 4px',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                              border: `1px solid ${JOB_COLORS[job.toUpperCase() as Job] || '#A0AEC0'}`, 
                            }
                          }} 
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`, 
                    padding: theme.spacing(0.5, 0.75), 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}>{mapSeacomType(player.seacomType)}</TableCell>
                  <TableCell sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`, 
                    padding: theme.spacing(0.5, 0.75), 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word', 
                    maxWidth: '250px', 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.2px'
                  }}>{player.seacomMessage || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalPlayers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default PlayerTable;