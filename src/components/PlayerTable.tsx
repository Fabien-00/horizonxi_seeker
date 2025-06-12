import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Typography, Box, CircularProgress, TablePagination } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type PlayerRow } from '../types/index'; // Assuming types are defined here

// Styles will be applied using the sx prop directly in the component.

interface PlayerTableProps {
  players: PlayerRow[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalPlayers: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  handleChangeRowsPerPage
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
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 'bold',
          color: theme.palette.text.primary,
          textAlign: 'left',
        }}>
          {totalPlayers} SEEKING
        </Typography>
      </Box>
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader aria-label="player table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[800] }}>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Avatar</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Charname</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Main Job</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Main Lvl</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Sub Job</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Sub Lvl</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Seacom Type</TableCell>
              <TableCell sx={{ color: theme.palette.common.white, fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>Seacom Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{
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
                <TableCell colSpan={8} sx={{
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
                  <TableCell sx={{ padding: theme.spacing(1), borderBottom: `1px solid ${theme.palette.divider}` }}>
                    {player.avatar && <Avatar src={`data:image/png;base64,${player.avatar}`} alt={player.charname} sx={{ width: theme.spacing(5), height: theme.spacing(5), marginRight: theme.spacing(1) }} />}
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{player.charname}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{player.mjob}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{player.mlvl}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{player.sjob}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{player.slvl}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{mapSeacomType(player.seacomType)}</TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1.5) }}>{player.seacomMessage || '-'}</TableCell>
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