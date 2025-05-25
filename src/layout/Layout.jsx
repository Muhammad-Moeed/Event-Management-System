import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar.jsx';
import logo from '../assets/logo.png';
import { useState } from 'react';

const Layout = ({ children, layout = true }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', bgcolor: '#f4f6f9' }}>
      {layout && <Sidebar />}

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Professional Header with Original Colors */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: '#1e1e2f', 
            backgroundImage: 'linear-gradient(to right, #1e1e2f, #2a2a3a)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <Toolbar sx={{ 
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: 1
          }}>
            {/* Left Section - Branding */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              minWidth: 200
            }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ 
                  mr: 1, 
                  display: { md: 'none' },
                  color: '#ffb300'
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Box
                component="img"
                src={logo}
                alt="Asan Qarza Logo"
                sx={{ 
                  height: 40,
                  mr: 2,
                  display: { xs: 'none', sm: 'block' },
                  filter: 'drop-shadow(0 0 4px rgba(255, 179, 0, 0.3))'
                }}
              />
              
              <Typography
                variant="h6"
                noWrap
                sx={{
                  ml: 2,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: '#ffb300',  
                  display: { xs: 'none', sm: 'block' },
                  textShadow: '0 0 8px rgba(255, 179, 0, 0.3)'
                }}
              >
                Event Management 
              </Typography>
            </Box>

            {/* Center Section - Search */}
            <Box sx={{ 
              flexGrow: 1,
              maxWidth: 600,
              mx: { xs: 1, md: 3 },
              display: { xs: 'none', sm: 'block' }
            }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha('#ffb300', 0.1),
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 179, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: alpha('#ffb300', 0.15)
                  },
                  '&:focus-within': {
                    backgroundColor: alpha('#ffb300', 0.2),
                    boxShadow: '0 0 0 2px rgba(255, 179, 0, 0.2)'
                  }
                }}
              >
                <SearchIcon sx={{ 
                  mr: 1, 
                  color: '#ffb300',
                  fontSize: 20
                }} />
                <InputBase
                  placeholder="Search customers, loans..."
                  fullWidth
                  sx={{ 
                    color: 'white',
                    '& input::placeholder': {
                      color: alpha('#ffb300', 0.6)
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Right Section - Actions */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1.5 },
              minWidth: 200,
              justifyContent: 'flex-end'
            }}>
        
              
           
            </Box>
          </Toolbar>

          {/* Mobile Search */}
          <Box sx={{ 
            px: 2, 
            pb: 1.5,
            display: { xs: 'block', sm: 'none' }
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: alpha('#ffb300', 0.1),
                borderRadius: 2,
                px: 2,
                py: 0.8,
                width: '100%',
                border: '1px solid rgba(255, 179, 0, 0.1)'
              }}
            >
              <SearchIcon sx={{ 
                mr: 1, 
                color: '#ffb300',
                fontSize: 20
              }} />
              <InputBase
                placeholder="Search..."
                fullWidth
                sx={{ 
                  color: 'white',
                  '& input::placeholder': {
                    color: alpha('#ffb300', 0.6)
                  }
                }}
              />
            </Box>
          </Box>
        </AppBar>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            mt: { xs: 12, sm: 9 },
            px: layout ? { xs: 2, sm: 3 } : 0,
            py: layout ? 3 : 0,
            backgroundColor: '#f4f6f9'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;