import React from 'react';
import { AppBar, Toolbar, Typography, Box, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(145deg, #0a1a2a, #0f2742)',
  borderBottom: '1px solid #2a8bff',
  boxShadow: '0 0 15px rgba(42, 139, 255, 0.2)',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1, 0),
}));

const Logo = styled('img')({
  height: '60px',
  width: 'auto',
  marginRight: '16px',
  filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 1))',
  },
});

const Title = styled(Typography)({
  background: 'linear-gradient(90deg, #ffd700, #ffa500)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  letterSpacing: '2px',
  margin: 0,
  lineHeight: 1.2,
  fontSize: '2.2rem',
  fontFamily: '"Times New Roman", Times, serif',
  textTransform: 'uppercase',
});

const Subtitle = styled(Typography)({
  color: '#a0c8ff',
  fontSize: '0.9rem',
  letterSpacing: '1px',
  marginLeft: '4px',
  fontStyle: 'italic',
});

const HeaderLink = styled(RouterLink)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  flexGrow: 1,
});

export const Header: React.FC = () => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = 'https://i.imgur.com/placeholder-chocobo.png';
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <HeaderLink to="/">
          <Logo 
            src="/Chocobo_FFT.webp" 
            alt="Chocobo Logo" 
            onError={handleImageError}
          />
          <Box>
            <Title>HorizonXI Party Finder</Title>
            <Subtitle>Find your next adventure in Vana'diel</Subtitle>
          </Box>
        </HeaderLink>
      </Toolbar>
    </StyledAppBar>
  );
};
