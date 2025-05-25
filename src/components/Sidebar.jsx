import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Avatar,
  Typography,
  Box,
  Collapse,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  RequestQuote as LoanRequestIcon,
  RealEstateAgent as NewLoanIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  AdminPanelSettings as AdminIcon,
  People as UsersIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import routes from '../routes/index';
import { AuthContext } from '../context/AuthContext';
import supabase from '../services/supabaseClient';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const Sidebar = ({ drawerWidth = 280, collapsedWidth = 80, isMobile, toggleSidebar }) => {
  const [activePath, setActivePath] = useState('');
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    fullName: '',
    avatarUrl: '',
    role: 'user'
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        
        let avatarUrl = '';
        if (data.avatar_url) {
        setUserData({
          fullName: fullName || 'User',
          avatarUrl: data.avatar_url,
          role: data?.role || 'user'
        })};
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserData({
          fullName: 'User',
          avatarUrl: '',
          role: 'user'
        });
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Toggle submenu
  const handleSubmenuToggle = (path) => {
    setOpenSubmenu(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Filter routes based on role
  const filteredRoutes = routes.filter(route => {
    if (!route.showInSidebar) return false;
    if (userData.role === 'admin') return route.adminOnly === true;
    return route.adminOnly !== true;
  });

  // Icon mappings
  const iconMap = {
    dashboard: <DashboardIcon sx={{ color: activePath === '/dashboard' ? '#ffb300' : 'inherit' }} />,
    request: <LoanRequestIcon sx={{ color: activePath === '/my-loan-request' ? '#ffb300' : 'inherit' }} />,
    loan: <NewLoanIcon sx={{ color: activePath === '/new-loan' ? '#ffb300' : 'inherit' }} />,
    profile: <ProfileIcon sx={{ color: activePath === '/profile' ? '#ffb300' : 'inherit' }} />,
    admin: <AdminIcon sx={{ color: activePath.startsWith('/admin') ? '#ffb300' : 'inherit' }} />,
    users: <UsersIcon sx={{ color: activePath === '/admin/users' ? '#ffb300' : 'inherit' }} />,
    notifications: <NotificationsIcon />,
    settings: <SettingsIcon />,
    help: <HelpIcon />,
    logout: <LogoutIcon />
  };

  // Drawer styles
  const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: collapsed ? collapsedWidth : drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      width: collapsed ? collapsedWidth : drawerWidth,
      overflowX: 'hidden',
      backgroundColor: '#121212',
      borderRight: 'none',
      backgroundImage: 'none',
      boxShadow: '0px 0px 20px rgba(255, 235, 59, 0.1)',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }));

  // User profile section
  const UserProfileSection = () => (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      minHeight: 72,
      background: 'linear-gradient(90deg, rgba(255,235,59,0.1) 0%, rgba(18,18,18,1) 100%)'
    }}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            bgcolor: '#13a121',
            border: '2px solid #121212'
          }} />
        }
      >
        {userData.avatarUrl ? (
          <Avatar
            src={userData.avatarUrl}
            sx={{ 
              width: collapsed ? 40 : 48, 
              height: collapsed ? 40 : 48,
              mr: collapsed ? 0 : 2
            }}
          />
        ) : (
          <Avatar
            sx={{ 
              width: collapsed ? 40 : 48, 
              height: collapsed ? 40 : 48,
              mr: collapsed ? 0 : 2,
              bgcolor: '#ffb300',
              color: '#121212',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        )}
      </Badge>
      {!collapsed && (
        <Box sx={{ ml: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle1" noWrap sx={{ color: '#fff', fontWeight: 500 }}>
            {userData.fullName}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: userData.role === 'admin' ? '#13a121' : '#ffb300',
            fontWeight: 'bold'
          }}>
            {userData.role === 'admin' ? 'Administrator' : 'User'}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Nav item component
  const NavItem = ({ route }) => {
    const isActive = activePath === route.path || 
                   (route.subRoutes && route.subRoutes.some(sub => sub.path === activePath));
    
    return (
      <>
        <ListItem 
          disablePadding 
          sx={{ 
            display: 'block',
            mb: 0.5
          }}
        >
          <ListItemButton
            component={route.subRoutes ? 'div' : Link}
            to={!route.subRoutes ? route.path : undefined}
            onClick={() => route.subRoutes && handleSubmenuToggle(route.path)}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              borderRadius: 1,
              mx: 1,
              backgroundColor: isActive ? 'rgba(255, 235, 59, 0.1)' : 'transparent',
              color: isActive ? '#ffb300' : 'rgba(255, 255, 255, 0.7)',
              borderLeft: isActive ? '3px solid #ffb300' : 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 235, 59, 0.05)',
                color: '#ffb300',
              },
              '& .MuiListItemIcon-root': {
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
                color: isActive ? '#ffb300' : 'rgba(255, 255, 255, 0.7)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon>
              {route.adminOnly ? (
                <Badge badgeContent="ADMIN" color="success">
                  {iconMap[route.sidebarIcon]}
                </Badge>
              ) : (
                iconMap[route.sidebarIcon]
              )}
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText 
                  primary={route.sidebarText} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem'
                  }} 
                />
                {route.subRoutes && (
                  openSubmenu[route.path] ? 
                    <ExpandLess sx={{ color: isActive ? '#ffb300' : 'rgba(255, 255, 255, 0.7)' }} /> : 
                    <ExpandMore sx={{ color: isActive ? '#ffb300' : 'rgba(255, 255, 255, 0.7)' }} />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {route.subRoutes && !collapsed && (
          <Collapse in={openSubmenu[route.path]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {route.subRoutes.map((subRoute) => (
                <ListItemButton
                  key={subRoute.path}
                  component={Link}
                  to={subRoute.path}
                  sx={{
                    pl: 6,
                    py: 0.75,
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    backgroundColor: activePath === subRoute.path ? 'rgba(255, 235, 59, 0.1)' : 'transparent',
                    color: activePath === subRoute.path ? '#ffb300' : 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 235, 59, 0.05)',
                    },
                  }}
                >
                  <ListItemText 
                    primary={subRoute.sidebarText} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: activePath === subRoute.path ? 500 : 400,
                      fontSize: '0.85rem'
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  };

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={!isMobile || !collapsed}
      onClose={toggleSidebar}
    >
      <Toolbar />
      <UserProfileSection />
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <List>
          {filteredRoutes.map((route) => (
            <NavItem key={`${route.path}-${route.adminOnly ? 'admin' : 'user'}`} route={route} />
          ))}
        </List>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Popup
            trigger={
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: 1,
                  mx: 1,
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    color: '#ff5555',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LogoutIcon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2' }} />
                )}
              </ListItemButton>
            }
            modal
            nested
            contentStyle={{
              background: '#1e1e1e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '20px',
              width: 'auto'
            }}
          >
            {close => (
              <div style={{ color: 'white' }}>
                <h3 style={{ marginTop: 0, color: '#ffb300' }}>Confirm Logout</h3>
                <p>Are you sure you want to logout?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    onClick={close}
                    style={{
                      background: 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      close();
                    }}
                    style={{
                      background: '#ff5555',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </Popup>
        </ListItem>
      </List>
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'center' }}>
        <IconButton
          onClick={toggleCollapse}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: '#ffb300',
              backgroundColor: 'rgba(255, 235, 59, 0.1)'
            }
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;