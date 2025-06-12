import { AppBar, Toolbar, Typography, Box } from '@mui/material';

import { useTheme, styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, #243447 0%, #2E4A78 50%, #1A2332 100%)`,
  borderBottom: `3px solid #D4AF37`,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(212, 175, 55, 0.15)`,
  backdropFilter: 'blur(20px)',
  padding: theme.spacing(1, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
    pointerEvents: 'none',
  },
}));

const Logo = styled('img')(({ theme }) => ({
  height: '50px',
  marginRight: theme.spacing(2),
  borderRadius: '8px',
  border: `2px solid #D4AF37`,
  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 25px rgba(212, 175, 55, 0.5)',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: '#94A3B8',
  marginLeft: theme.spacing(2),
  fontSize: '0.9rem',
  fontStyle: 'italic',
  fontWeight: 500,
  letterSpacing: '0.5px',
  opacity: 0.9,
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
}));

// const HeaderLink = styled(Link)(({ theme }) => ({
//   marginLeft: theme.spacing(2),
//   color: theme.palette.text.primary,
//   textDecoration: 'none',
//   fontSize: '0.8rem', // Reduced font size
//   '&:hover': {
//     color: theme.palette.secondary.main,
//     textDecoration: 'underline',
//   }
// }));

export const Header = () => {
  const theme = useTheme(); // theme is used in Toolbar's sx prop

  return (
    <StyledAppBar position="sticky">
      {/* Toolbar content is centered, minHeight will be from theme or default */}
      <Toolbar sx={{ 
        justifyContent: 'center', 
        minHeight: '80px',
        position: 'relative',
        zIndex: 1,
      }}> 
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          textAlign: 'center',
          padding: theme.spacing(1),
        }}>
          <Logo src="/chocobo.jpg" alt="HorizonXI Seeker Logo" />
          <Box>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, color: theme.palette.primary.contrastText, fontWeight: 'bold', letterSpacing: '0.05em' }}>
          HorizonXI Seeker
        </Typography>
            <Subtitle variant="body2">
              Fait par moi 
            </Subtitle>
          </Box>
        </Box>
        {/* <HeaderLink href="#" onClick={(e) => e.preventDefault()}>Home</HeaderLink>
        <HeaderLink href="#" onClick={(e) => e.preventDefault()}>About</HeaderLink> */}
      </Toolbar>
    </StyledAppBar>
  );
};
