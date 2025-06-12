import { AppBar, Toolbar, Typography, Box, styled, useTheme } from '@mui/material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  // Styles for AppBar will largely come from theme.ts MuiAppBar overrides
  // backgroundColor: theme.palette.background.default, // Match image header background
  // boxShadow: 'none', // Match image (no shadow on app bar)
  // borderBottom: `1px solid ${theme.palette.divider}`, // Match image (subtle border)
  padding: theme.spacing(0.5, 0), 
}));

const Logo = styled('img')(({ theme }) => ({
  height: '40px', // Adjusted to match image proportion
  marginRight: theme.spacing(1.5),
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary, // Match image text color
  fontWeight: 'bold', // Match image
  letterSpacing: '0.5px',
  fontSize: '1.4rem', // Adjusted to match image proportion
  textTransform: 'none', // As per image
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary, // Match image text color
  marginLeft: theme.spacing(1.5), // Adjusted spacing
  fontSize: '0.8rem', // Adjusted to match image proportion
  fontStyle: 'italic',
  opacity: 0.8,
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

const Header: React.FC = () => {
  const theme = useTheme(); // theme is used in Toolbar's sx prop

  return (
    <StyledAppBar position="sticky">
      {/* Toolbar content is centered, minHeight will be from theme or default */}
      <Toolbar sx={{ justifyContent: 'center', minHeight: theme.mixins.toolbar.minHeight || '56px' }}> 
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Logo src="/chocobo.jpg" alt="HorizonXI Seeker Logo" />
          <Box>
            <Title variant="h1"> {/* Changed to h1 for semantic though style is custom */}
              HorizonXI Party Seeker
            </Title>
            <Subtitle variant="body2">
              Find your party, conquer Vana'diel!
            </Subtitle>
          </Box>
        </Box>
        {/* <HeaderLink href="#" onClick={(e) => e.preventDefault()}>Home</HeaderLink>
        <HeaderLink href="#" onClick={(e) => e.preventDefault()}>About</HeaderLink> */}
      </Toolbar>
    </StyledAppBar>
  );
};

export { Header };
