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
        padding: theme.spacing(2, 2, 1.5, 2), // Adjusted padding
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}` // Added a bottom border
      }}>
        <Typography variant="h5" sx={{
          fontWeight: 'bold',
          color: 'white', // Changed color to primary.main
          textAlign: 'left',
        }}>
          {totalPlayers} SEEKING
        </Typography>
      </Box>
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader aria-label="player table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[900] }}>{/* Darker background for header */}
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(1, 1.5),
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('charname')}
              >
                Charname {sortBy === 'charname' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.grey[700]}`, padding: theme.spacing(1, 1.5) }}>Main Job</TableCell>
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(1, 1.5),
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('mlvl')}
              >
                Main Lvl {sortBy === 'mlvl' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.grey[700]}`, padding: theme.spacing(1, 1.5) }}>Sub Job</TableCell>
              <TableCell 
                sx={{ 
                  color: theme.palette.common.white, 
                  fontWeight: 'bold', 
                  borderBottom: `1px solid ${theme.palette.grey[700]}`, 
                  padding: theme.spacing(1, 1.5),
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: theme.palette.grey[800] }
                }}
                onClick={() => onSort('slvl')}
              >
                Sub Lvl {sortBy === 'slvl' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.grey[700]}`, padding: theme.spacing(1, 1.5) }}>Other Jobs</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.grey[700]}`, padding: theme.spacing(1, 1.5) }}>Seacom Type</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.grey[700]}`, padding: theme.spacing(1, 1.5) }}>Seacom Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ // Adjusted colSpan to 8 to account for new 'Other Jobs' column
                  textAlign: 'center',
                  padding: theme.spacing(3),
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
                  padding: theme.spacing(3),
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
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{player.charname}</Typography>
                      {player.isNew && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            ml: 1, 
                            backgroundColor: theme.palette.secondary.main, 
                            color: theme.palette.secondary.contrastText, 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          NEW
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>
                    <Chip 
                      label={player.mjob} 
                      size="small"
                      sx={{ 
                        background: `linear-gradient(135deg, ${JOB_COLORS[player.mjob as Job] || theme.palette.grey[700]}, ${JOB_COLORS[player.mjob as Job] ? `${JOB_COLORS[player.mjob as Job]}b3` : theme.palette.grey[800]})`,
                        color: theme.palette.common.white, // Explicitly set light text color
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: `1px solid ${JOB_COLORS[player.mjob as Job] ? `${JOB_COLORS[player.mjob as Job]}99` : theme.palette.grey[600]}`, 
                        borderRadius: '3px',
                        minWidth: '40px',
                        height: '26px',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(3px)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-1px) scale(1.02)',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                          border: `1px solid ${JOB_COLORS[player.mjob as Job] || theme.palette.grey[500]}`,
                          cursor: 'pointer',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1) }}>{player.mlvl}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1) }}>
                    {player.sjob && player.sjob.trim() !== '' ? (
                      <Chip 
                        label={player.sjob} 
                        size="small"
                        sx={{ 
                          background: `linear-gradient(135deg, ${JOB_COLORS[player.sjob as Job] || theme.palette.grey[700]}, ${JOB_COLORS[player.sjob as Job] ? `${JOB_COLORS[player.sjob as Job]}b3` : theme.palette.grey[800]})`,
                          color: theme.palette.common.white, // Explicitly set light text color
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                          border: `1px solid ${JOB_COLORS[player.sjob as Job] ? `${JOB_COLORS[player.sjob as Job]}99` : theme.palette.grey[600]}`, 
                          borderRadius: '3px',
                          minWidth: '40px',
                          height: '26px',
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(3px)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-1px) scale(1.02)',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                            border: `1px solid ${JOB_COLORS[player.sjob as Job] || theme.palette.grey[500]}`,
                            cursor: 'pointer',
                          }
                        }}
                      />
                    ) : (
                      <span style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>-</span>
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1) }}>{player.slvl}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1, 1.5) }}>
                    {player.jobs && Object.entries(player.jobs).map(([job, level]) => (
                      <Chip 
                        key={job} 
                        label={`${job.toUpperCase()} ${level}`} 
                        size="small" 
                          sx={{
                            mr: 0.5, 
                            mb: 0.5, 
                            background: `linear-gradient(135deg, ${JOB_COLORS[job.toUpperCase() as Job] || '#4A5568'}, ${JOB_COLORS[job.toUpperCase() as Job] ? `${JOB_COLORS[job.toUpperCase() as Job]}cc` : '#2D3748'})`,
                            color: '#E2E8F0',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            letterSpacing: '0.3px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                            border: `1px solid ${JOB_COLORS[job.toUpperCase() as Job] ? `${JOB_COLORS[job.toUpperCase() as Job]}66` : '#4A5568'}`, 
                            borderRadius: '3px',
                            minWidth: '35px',
                            height: '22px',
                            padding: '0 6px',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                              border: `1px solid ${JOB_COLORS[job.toUpperCase() as Job] || '#A0AEC0'}`, 
                            }
                          }} 
                      />
                    ))}
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1) }}>{mapSeacomType(player.seacomType)}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1), whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '300px' }}>{player.seacomMessage || '-'}</TableCell>
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